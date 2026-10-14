import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { db, firebaseConfigured } from './firebase-config.js';

const money = value => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`;

window.arttrixxFirebase = {
  isConfigured: firebaseConfigured,
  async createOrder(order) {
    if (!firebaseConfigured || !db) throw new Error('Firebase n’est pas configuré.');
    const result = await addDoc(collection(db, 'orders'), { ...order, createdAt: serverTimestamp() });
    return result.id;
  }
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProduct(product) {
  const card = createElement('article', 'art-canvas-card');
  const frame = createElement('div', 'canvas-frame');
  const image = createElement('img');
  image.src = product.image || '';
  image.alt = product.name || 'Article Arttrixx';
  image.loading = 'lazy';
  frame.append(image, createElement('span', 'canvas-badge', product.badge || 'Disponible'));

  const cartel = createElement('div', 'canvas-cartel');
  const info = createElement('div', 'cartel-info');
  info.append(createElement('h3', 'art-name', product.name || 'Article sans nom'));
  info.append(createElement('p', 'art-medium', product.description || 'Création Arttrixx Gallery'));
  cartel.append(info, createElement('span', 'art-price', money(product.price)));
  card.append(frame, cartel);

  if (product.category === 'streetwear') {
    const sizeLabel = createElement('label', 'product-size-label', 'Taille');
    const sizeSelect = createElement('select', 'product-size-select');
    sizeSelect.setAttribute('aria-label', `Choisir la taille de ${product.name}`);
    sizeSelect.required = true;
    const placeholder = createElement('option', '', 'Choisir');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    sizeSelect.append(placeholder);
    (Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL']).forEach(size => {
      const option = createElement('option', '', size);
      option.value = size;
      sizeSelect.append(option);
    });
    sizeLabel.append(sizeSelect);
    card.append(sizeLabel);
  }

  const addButton = createElement('button', 'add-to-cart-btn', 'Ajouter au panier +');
  addButton.type = 'button';
  addButton.dataset.productName = product.name || 'Article Arttrixx';
  addButton.dataset.productId = product.id;
  card.append(addButton);
  return card;
}

if (firebaseConfigured && db) {
  const category = document.body.dataset.catalogCategory;
  const productGrid = document.querySelector('.art-grid');
  if (productGrid && category) {
    const productsQuery = query(collection(db, 'products'), where('available', '==', true));
    onSnapshot(productsQuery, snapshot => {
      const visibleProducts = snapshot.docs
        .map(productDocument => ({ id: productDocument.id, ...productDocument.data() }))
        .filter(product => product.available === true && (category === 'home' || product.category === category));
      visibleProducts.sort((first, second) => {
        const firstDate = first.createdAt?.toMillis?.() || 0;
        const secondDate = second.createdAt?.toMillis?.() || 0;
        return secondDate - firstDate;
      });
      const homeProducts = category === 'home' ? visibleProducts.slice(0, 3) : visibleProducts;
      productGrid.replaceChildren(...homeProducts.map(renderProduct));
      if (!homeProducts.length) {
        const message = createElement('p', 'catalog-empty-message', 'La collection sera bientôt disponible.');
        productGrid.append(message);
      }
    }, error => {
      console.error('Impossible de charger le catalogue Firebase :', error);
    });
  }
}
