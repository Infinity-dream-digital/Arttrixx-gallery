import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
import { adminEmail, auth, db, firebaseConfigured, storage } from './firebase-config.js';

const loginPanel = document.getElementById('adminLoginPanel');
const dashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('adminLoginForm');
const loginMessage = document.getElementById('loginMessage');
const setupNotice = document.getElementById('firebaseSetupNotice');
const productForm = document.getElementById('productForm');
const productMessage = document.getElementById('productMessage');
const dashboardMessage = document.getElementById('dashboardMessage');
const productsBody = document.getElementById('productsTableBody');
const ordersList = document.getElementById('ordersList');
const categoryFilter = document.getElementById('categoryFilter');
const categorySelect = document.getElementById('productCategory');
const sizesField = document.getElementById('sizesField');

let products = [];
let orders = [];
let stopProductsListener;
let stopOrdersListener;
let initialCatalogSeeded = false;

const currency = value => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`;
const categoryName = category => category === 'streetwear' ? 'T-shirts & pulls' : 'Tableaux & toiles';

function showError(element, message) {
  element.textContent = message;
  element.classList.add('admin-error');
}

function clearError(element) {
  element.textContent = '';
  element.classList.remove('admin-error');
}

function createCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function updateStats() {
  document.getElementById('productCount').textContent = String(products.length);
  document.getElementById('availableCount').textContent = String(products.filter(product => product.available).length);
  document.getElementById('pendingOrderCount').textContent = String(orders.filter(order => order.status !== 'completed').length);
  document.getElementById('orderCount').textContent = String(orders.length);
}

function renderProducts() {
  const selectedCategory = categoryFilter.value;
  const filteredProducts = products.filter(product => selectedCategory === 'all' || product.category === selectedCategory);
  productsBody.replaceChildren();

  if (!filteredProducts.length) {
    const row = document.createElement('tr');
    const emptyCell = createCell('Aucun produit dans cette catégorie.');
    emptyCell.colSpan = 5;
    row.append(emptyCell);
    productsBody.append(row);
    return;
  }

  filteredProducts.forEach(product => {
    const row = document.createElement('tr');
    const productCell = document.createElement('td');
    const productInfo = document.createElement('div');
    productInfo.className = 'admin-product-cell';
    const image = document.createElement('img');
    image.src = product.image || '';
    image.alt = '';
    const text = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = product.name || 'Produit sans nom';
    const description = document.createElement('small');
    description.textContent = product.description || '';
    text.append(name, description);
    productInfo.append(image, text);
    productCell.append(productInfo);
    row.append(productCell);

    const categoryCell = createCell(categoryName(product.category));
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'admin-category-badge';
    categoryBadge.textContent = categoryCell.textContent;
    categoryCell.replaceChildren(categoryBadge);
    row.append(categoryCell, createCell(currency(product.price)));

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = `admin-status-badge ${product.available ? 'is-available' : 'is-unavailable'}`;
    status.textContent = product.available ? 'Disponible' : 'Indisponible';
    statusCell.append(status);
    row.append(statusCell);

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'admin-row-actions';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'admin-action-button is-secondary';
    toggle.dataset.productAction = 'toggle';
    toggle.dataset.id = product.id;
    toggle.textContent = product.available ? 'Désactiver' : 'Activer';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-action-button is-danger';
    remove.dataset.productAction = 'delete';
    remove.dataset.id = product.id;
    remove.textContent = 'Supprimer';
    actions.append(toggle, remove);
    actionsCell.append(actions);
    row.append(actionsCell);
    productsBody.append(row);
  });
}

function formatDate(value) {
  if (!value) return 'Date non précisée';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('fr-FR');
}

function renderOrders() {
  ordersList.replaceChildren();
  if (!orders.length) {
    ordersList.append(Object.assign(document.createElement('p'), { textContent: 'Aucune commande pour le moment.' }));
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('article');
    card.className = 'admin-order-card';
    const heading = document.createElement('div');
    heading.className = 'admin-order-heading';
    const customer = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = `${order.customerName || 'Client'} · ${order.id}`;
    const meta = document.createElement('p');
    meta.className = 'admin-order-meta';
    meta.textContent = `Téléphone : ${order.phone || '—'} · Lieu : ${order.location || '—'} · Livraison souhaitée : ${formatDate(order.deliveryTime)}`;
    customer.append(title, meta);
    const status = document.createElement('span');
    const completed = order.status === 'completed';
    status.className = `admin-status-badge ${completed ? 'is-completed' : ''}`;
    status.textContent = completed ? 'Terminée' : 'À traiter';
    heading.append(customer, status);

    const lines = document.createElement('p');
    lines.className = 'admin-order-items';
    lines.textContent = (Array.isArray(order.items) ? order.items : []).map(item => `${item.name}${item.size ? ` (taille ${item.size})` : ''} × ${item.quantity} — ${currency(item.lineTotal)}`).join(' · ');
    const total = document.createElement('p');
    total.className = 'admin-order-meta admin-order-total';
    total.textContent = `Sous-total : ${currency(order.subtotal)} · Livraison : ${currency(order.deliveryFee)} · Total : ${currency(order.total)} · Reçue le ${formatDate(order.createdAt)}`;

    const actions = document.createElement('div');
    actions.className = 'admin-row-actions';
    if (!completed) {
      const complete = document.createElement('button');
      complete.type = 'button';
      complete.className = 'admin-action-button';
      complete.dataset.orderAction = 'complete';
      complete.dataset.id = order.id;
      complete.textContent = 'Marquer comme terminée';
      actions.append(complete);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-action-button is-danger';
    remove.dataset.orderAction = 'delete';
    remove.dataset.id = order.id;
    remove.textContent = 'Supprimer';
    actions.append(remove);
    card.append(heading, lines, total, actions);
    ordersList.append(card);
  });
}

function startDashboard(user) {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  document.getElementById('adminWelcome').textContent = `Connecté en tant que ${user.email}`;
  clearError(dashboardMessage);

  stopProductsListener?.();
  stopOrdersListener?.();
  if (!initialCatalogSeeded) {
    initialCatalogSeeded = true;
    seedInitialCatalog().catch(error => showError(dashboardMessage, `Initialisation du catalogue impossible : ${error.message}`));
  }
  stopProductsListener = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), snapshot => {
    products = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderProducts();
    updateStats();
  }, error => showError(dashboardMessage, `Lecture des produits impossible : ${error.message}`));

  stopOrdersListener = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snapshot => {
    orders = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderOrders();
    updateStats();
  }, error => showError(dashboardMessage, `Lecture des commandes impossible : ${error.message}`));
}

async function seedInitialCatalog() {
  const productsCollection = collection(db, 'products');
  const snapshot = await getDocs(productsCollection);
  if (!snapshot.empty) return;

  const starterProducts = [
    { category: 'tableaux', name: 'Écho Urbain', description: 'Huile & acrylique sur toile · 120 × 90 cm', price: 450000, image: 'https://i.pinimg.com/1200x/bc/8f/e9/bc8fe94478e088628f03a5ab38972895.jpg', badge: 'Pièce unique' },
    { category: 'streetwear', name: 'Hoodie Oversize Arttrixx Signature', description: 'Coton 480 GSM · Broderie artisanale', price: 85000, image: 'https://i.pinimg.com/736x/0c/e8/da/0ce8da66db411501fbb5ce97796eef50.jpg', badge: 'Édition limitée', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { category: 'tableaux', name: 'Mémoire de Formes', description: 'Technique mixte sur lin · 100 × 100 cm', price: 380000, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=85&w=900', badge: 'Signé par l’artiste' },
    { category: 'tableaux', name: 'Rythme en Rouge', description: 'Acrylique sur toile · 80 × 100 cm', price: 320000, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=85&w=900', badge: 'Série limitée' },
    { category: 'tableaux', name: 'Silence Doré', description: 'Acrylique & feuille d’or · 90 × 90 cm', price: 410000, image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=85&w=900', badge: 'Nouvelle œuvre' },
    { category: 'streetwear', name: 'T-shirt Spray Signature', description: 'Coton bio · Coupe oversize', price: 35000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=85&w=900', badge: 'Best-seller', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { category: 'streetwear', name: 'Sweat Urban Canvas', description: 'Molleton premium · Sérigraphie', price: 65000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=85&w=900', badge: 'Nouveauté', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { category: 'streetwear', name: 'Hoodie Gorilla Art', description: 'Coton épais · Impression premium', price: 75000, image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&q=85&w=900', badge: 'Série limitée', sizes: ['S', 'M', 'L', 'XL', 'XXL'] }
  ];

  await Promise.all(starterProducts.map(product => addDoc(productsCollection, {
    ...product,
    available: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })));
}

if (!firebaseConfigured) {
  setupNotice.hidden = false;
  setupNotice.textContent = 'Firebase n’est pas configuré. Renseignez firebase-config.js, activez Authentication (e-mail/mot de passe), Firestore et Storage, puis publiez les règles fournies.';
  loginForm.querySelector('button[type="submit"]').disabled = true;
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearError(loginMessage);
  if (!firebaseConfigured || !auth) return;
  const formData = new FormData(loginForm);
  const email = adminEmail.trim().toLowerCase();
  const password = String(formData.get('password'));

  const submit = loginForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showError(loginMessage, 'Code incorrect ou compte administrateur Firebase non configuré.');
  } finally {
    submit.disabled = false;
  }
});

document.getElementById('logoutButton').addEventListener('click', () => signOut(auth));
categoryFilter.addEventListener('change', renderProducts);
categorySelect.addEventListener('change', () => {
  sizesField.hidden = categorySelect.value !== 'streetwear';
});
categorySelect.dispatchEvent(new Event('change'));

productForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearError(productMessage);
  const formData = new FormData(productForm);
  const imageFile = formData.get('image');
  if (!imageFile || !imageFile.size) {
    showError(productMessage, 'Choisissez une image pour ce produit.');
    return;
  }

  const submit = productForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Envoi du produit…';
  try {
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const imagePath = `products/${auth.currentUser.uid}/${Date.now()}-${safeFileName}`;
    const imageRef = ref(storage, imagePath);
    await uploadBytes(imageRef, imageFile, { contentType: imageFile.type });
    const imageUrl = await getDownloadURL(imageRef);
    const category = String(formData.get('category'));
    const sizes = category === 'streetwear'
      ? String(formData.get('sizes')).split(',').map(size => size.trim()).filter(Boolean)
      : [];

    await addDoc(collection(db, 'products'), {
      category,
      name: String(formData.get('name')).trim(),
      description: String(formData.get('description')).trim(),
      price: Number(formData.get('price')),
      image: imageUrl,
      sizes,
      available: formData.get('available') === 'on',
      storagePath: imagePath,
      badge: 'Nouveauté',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    productForm.reset();
    categorySelect.dispatchEvent(new Event('change'));
    productMessage.textContent = 'Produit ajouté. Le catalogue de la boutique se met à jour automatiquement.';
  } catch (error) {
    showError(productMessage, `Ajout impossible : ${error.message}`);
  } finally {
    submit.disabled = false;
    submit.textContent = 'Ajouter au catalogue';
  }
});

productsBody.addEventListener('click', async event => {
  const button = event.target.closest('[data-product-action]');
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.id);
  if (!product) return;
  try {
    if (button.dataset.productAction === 'toggle') {
      await updateDoc(doc(db, 'products', product.id), { available: !product.available, updatedAt: serverTimestamp() });
    } else if (button.dataset.productAction === 'delete' && window.confirm(`Supprimer « ${product.name} » du catalogue ?`)) {
      await deleteDoc(doc(db, 'products', product.id));
      if (product.storagePath) {
        await deleteObject(ref(storage, product.storagePath)).catch(error => {
          console.warn('Produit supprimé, mais son image n’a pas pu être supprimée :', error);
        });
      }
    }
  } catch (error) {
    showError(dashboardMessage, `Modification impossible : ${error.message}`);
  }
});

ordersList.addEventListener('click', async event => {
  const button = event.target.closest('[data-order-action]');
  if (!button) return;
  const order = orders.find(item => item.id === button.dataset.id);
  if (!order) return;
  try {
    if (button.dataset.orderAction === 'complete') {
      await updateDoc(doc(db, 'orders', order.id), { status: 'completed', updatedAt: serverTimestamp() });
    } else if (button.dataset.orderAction === 'delete' && window.confirm(`Supprimer la commande ${order.id} ?`)) {
      await deleteDoc(doc(db, 'orders', order.id));
    }
  } catch (error) {
    showError(dashboardMessage, `Modification de la commande impossible : ${error.message}`);
  }
});

if (firebaseConfigured && auth) {
  onAuthStateChanged(auth, user => {
    if (!user) {
      stopProductsListener?.();
      stopOrdersListener?.();
      dashboard.hidden = true;
      loginPanel.hidden = false;
      return;
    }
    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      signOut(auth);
      showError(loginMessage, 'Ce compte n’est pas autorisé à gérer la boutique.');
      return;
    }
    startDashboard(user);
  });
}
