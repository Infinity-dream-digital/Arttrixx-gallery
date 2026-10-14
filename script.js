document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. GESTION DU PRELOADER (3 SECONDES)
     ========================================== */
  const progressFill = document.getElementById('progressFill');
  const preloader = document.getElementById('preloader');

  // Déclenche le remplissage de la jauge rose dès le chargement
  setTimeout(() => {
    if (progressFill) {
      progressFill.style.width = '100%';
    }
  }, 100);

  // À la fin des 3 secondes (3000ms), masque le preloader avec effet de fondu
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('fade-out');
      document.body.style.overflow = 'auto'; // Active le scroll de la page
    }
  }, 3100);


  /* ==========================================
     2. GESTION DU MENU BURGER MOBILE
     ========================================== */
  const burgerBtn = document.getElementById('burgerBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const adminFooterEntry = document.querySelector('.admin-footer-entry');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêche le scroll en arrière-plan
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (burgerBtn) burgerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Fermer le menu lors du clic sur un lien
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  if (adminFooterEntry) {
    let adminClickTimer;
    let adminClickCount = 0;
    adminFooterEntry.addEventListener('click', event => {
      event.preventDefault();
      window.clearTimeout(adminClickTimer);
      adminClickCount += 1;
      if (adminClickCount >= 2) {
        adminClickCount = 0;
        window.location.href = adminFooterEntry.href;
        return;
      }
      adminClickTimer = window.setTimeout(() => {
        adminClickCount = 0;
      }, 350);
    });
  }

  /* ==========================================
     3. PANIER PARTAGÉ ET COMMANDE
     ========================================== */
  const cartToast = document.getElementById('cartToast');
  const cartTrigger = document.querySelector('.cart-btn');
  const deliveryFee = 1500;
  const storageKey = 'arttrixx-gallery-cart';
  let cart = [];
  let toastTimeout;

  try {
    cart = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch (error) {
    cart = [];
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-modal-overlay" id="cartModalOverlay" hidden>
      <section class="cart-modal" role="dialog" aria-modal="true" aria-labelledby="cartModalTitle">
        <button class="cart-modal-close" type="button" aria-label="Fermer le panier">&times;</button>
        <div id="cartModalContent"></div>
      </section>
    </div>
  `);

  const cartOverlay = document.getElementById('cartModalOverlay');
  const cartModalContent = document.getElementById('cartModalContent');
  const closeCartButton = document.querySelector('.cart-modal-close');

  function saveCart() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      // Le panier reste utilisable pour la session même si le stockage est indisponible.
    }
    updateCartCount();
  }

  function updateCartCount() {
    const quantity = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(count => {
      count.textContent = String(quantity);
    });
  }

  function formatPrice(price) {
    return `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function showCartToast(message) {
    if (!cartToast) return;
    cartToast.textContent = message;
    cartToast.classList.add('visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => cartToast.classList.remove('visible'), 2600);
  }

  function openCart() {
    renderCart();
    cartOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeCartButton.focus();
  }

  function closeCart() {
    cartOverlay.hidden = true;
    document.body.style.overflow = '';
    if (cartTrigger) cartTrigger.focus();
  }

  function renderCart() {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = cart.length ? deliveryFee : 0;

    if (!cart.length) {
      cartModalContent.innerHTML = `
        <span class="cart-modal-eyebrow">Arttrixx Gallery</span>
        <h2 id="cartModalTitle">Votre panier</h2>
        <p class="cart-empty-message">Votre panier est encore vide. Découvrez les œuvres et pièces de la collection.</p>
        <button class="cart-continue-button" type="button" data-cart-close>Continuer mes achats</button>
      `;
      return;
    }

    const itemsMarkup = cart.map((item, index) => `
      <article class="cart-line-item">
        <img src="${escapeHtml(item.image)}" alt="" class="cart-line-image">
        <div class="cart-line-details">
          <h3>${escapeHtml(item.name)}</h3>
          ${item.size ? `<p class="cart-line-size">Taille : ${escapeHtml(item.size)}</p>` : ''}
          <p class="cart-line-price">${formatPrice(item.price)}</p>
          <div class="cart-line-controls">
            <button type="button" data-cart-action="decrease" data-cart-index="${index}" aria-label="Diminuer la quantité">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-cart-index="${index}" aria-label="Augmenter la quantité">+</button>
            <button type="button" class="cart-line-remove" data-cart-action="remove" data-cart-index="${index}">Supprimer</button>
          </div>
        </div>
        <strong class="cart-line-total">${formatPrice(item.price * item.quantity)}</strong>
      </article>
    `).join('');

    cartModalContent.innerHTML = `
      <span class="cart-modal-eyebrow">Arttrixx Gallery</span>
      <h2 id="cartModalTitle">Votre panier <span>(${cart.reduce((total, item) => total + item.quantity, 0)})</span></h2>
      <div class="cart-line-list">${itemsMarkup}</div>
      <div class="cart-totals">
        <p><span>Sous-total</span><strong>${formatPrice(subtotal)}</strong></p>
        <p><span>Livraison</span><strong>${formatPrice(shipping)}</strong></p>
        <p class="cart-grand-total"><span>Total à payer</span><strong>${formatPrice(subtotal + shipping)}</strong></p>
      </div>
      <button class="cart-checkout-button" type="button" data-cart-checkout>Commander</button>
      <button class="cart-continue-button" type="button" data-cart-close>Continuer mes achats</button>
    `;
  }

  function renderCheckout() {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    cartModalContent.innerHTML = `
      <button class="cart-back-button" type="button" data-cart-back>← Retour au panier</button>
      <span class="cart-modal-eyebrow">Finaliser la commande</span>
      <h2 id="cartModalTitle">Informations de livraison</h2>
      <p class="checkout-total-preview">Total avec livraison : <strong>${formatPrice(subtotal + deliveryFee)}</strong></p>
      <form class="checkout-form" id="checkoutForm">
        <label>Nom complet<input name="customerName" type="text" autocomplete="name" required></label>
        <label>Numéro de téléphone<input name="phone" type="tel" autocomplete="tel" placeholder="Ex. +225 07 00 00 00 00" required></label>
        <label>Lieu de livraison<input name="location" type="text" autocomplete="street-address" placeholder="Commune, quartier, adresse ou repère" required></label>
        <label>Date et heure de livraison<input name="deliveryTime" type="datetime-local" required></label>
        <button class="cart-checkout-button" type="submit">Confirmer la commande</button>
      </form>
    `;
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  closeCartButton.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', event => {
    if (event.target === cartOverlay || event.target.closest('[data-cart-close]')) closeCart();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !cartOverlay.hidden) closeCart();
  });

  cartModalContent.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-cart-action]');
    if (actionButton) {
      const index = Number(actionButton.dataset.cartIndex);
      if (!cart[index]) return;
      if (actionButton.dataset.cartAction === 'remove') cart.splice(index, 1);
      if (actionButton.dataset.cartAction === 'increase') cart[index].quantity += 1;
      if (actionButton.dataset.cartAction === 'decrease') {
        cart[index].quantity -= 1;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
      }
      saveCart();
      renderCart();
      return;
    }

    if (event.target.closest('[data-cart-checkout]')) renderCheckout();
    if (event.target.closest('[data-cart-back]')) renderCart();
  });

  cartModalContent.addEventListener('submit', async event => {
    if (event.target.id !== 'checkoutForm') return;
    event.preventDefault();
    if (!event.target.reportValidity()) return;

    const formData = new FormData(event.target);
    const customerName = String(formData.get('customerName')).trim();
    const submitButton = event.target.querySelector('[type="submit"]');
    const order = {
      customerName,
      phone: String(formData.get('phone')).trim(),
      location: String(formData.get('location')).trim(),
      deliveryTime: String(formData.get('deliveryTime')),
      items: cart.map(item => ({
        productId: item.productId || '',
        name: item.name,
        size: item.size || '',
        unitPrice: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity
      })),
      subtotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      deliveryFee,
      total: cart.reduce((total, item) => total + item.price * item.quantity, 0) + deliveryFee,
      status: 'pending'
    };

    if (!window.arttrixxFirebase?.isConfigured) {
      let warning = event.target.querySelector('.checkout-error');
      if (!warning) {
        warning = document.createElement('p');
        warning.className = 'checkout-error';
        warning.setAttribute('role', 'alert');
        event.target.prepend(warning);
      }
      warning.textContent = 'Firebase n’est pas encore configuré : la commande ne peut pas être enregistrée.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enregistrement…';
    let orderNumber;
    try {
      orderNumber = await window.arttrixxFirebase.createOrder(order);
    } catch (error) {
      let warning = event.target.querySelector('.checkout-error');
      if (!warning) {
        warning = document.createElement('p');
        warning.className = 'checkout-error';
        warning.setAttribute('role', 'alert');
        event.target.prepend(warning);
      }
      warning.textContent = 'La commande n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.';
      submitButton.disabled = false;
      submitButton.textContent = 'Confirmer la commande';
      return;
    }

    cart = [];
    saveCart();
    cartModalContent.innerHTML = `
      <div class="order-success-mark" aria-hidden="true">✓</div>
      <span class="cart-modal-eyebrow">Commande enregistrée</span>
      <h2 id="cartModalTitle">Merci ${escapeHtml(customerName)} !</h2>
      <p class="cart-empty-message">Votre commande <strong>${orderNumber}</strong> a été enregistrée. Nous vous contacterons au numéro indiqué pour confirmer la livraison.</p>
      <button class="cart-checkout-button" type="button" data-cart-close>Terminer</button>
    `;
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('.add-to-cart-btn');
    if (!button) return;
      const card = button.closest('.art-canvas-card');
      if (!card || button.disabled) return;
      const sizeSelect = card.querySelector('.product-size-select');
      const size = sizeSelect ? sizeSelect.value : '';
      if (sizeSelect && !size) {
        sizeSelect.setCustomValidity('Choisissez une taille avant l’ajout au panier.');
        sizeSelect.reportValidity();
        sizeSelect.addEventListener('change', () => sizeSelect.setCustomValidity(''), { once: true });
        return;
      }

      const name = button.dataset.productName || card.querySelector('.art-name')?.textContent.trim() || 'Article Arttrixx';
      const priceText = card.querySelector('.art-price')?.textContent || '0';
      const price = Number(priceText.replace(/[^\d]/g, ''));
      const image = card.querySelector('.canvas-frame img')?.getAttribute('src') || '';
      const existingItem = cart.find(item => item.name === name && item.size === size);
      const productId = button.dataset.productId || '';

      if (existingItem) existingItem.quantity += 1;
      else cart.push({ name, size, price, image, productId, quantity: 1 });

      saveCart();
      showCartToast(`${name}${size ? ` · taille ${size}` : ''} ajouté au panier.`);
      button.innerHTML = 'Ajouté au panier <span aria-hidden="true">✓</span>';
      window.setTimeout(() => {
        button.innerHTML = 'Ajouter au panier <span aria-hidden="true">+</span>';
      }, 1400);
  });

  updateCartCount();

});

/* SCRIPT DE TRANSITION DU HERO AU SCROLL */
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  const heroImageWrapper = document.getElementById('heroImageWrapper');
  const heroTextContent = document.getElementById('heroTextContent');
  let animationFrameRequested = false;

  if (!heroSection || !heroImageWrapper || !heroTextContent) return;

  const updateHeroTransition = () => {
    const scrollDistance = heroSection.offsetHeight - window.innerHeight;
    const sectionTop = heroSection.getBoundingClientRect().top + window.scrollY;
    const scrollProgress = scrollDistance > 0
      ? (window.scrollY - sectionTop) / scrollDistance
      : 0;
    const progress = Math.max(0, Math.min(1, scrollProgress));

    // Les textes et les boutons disparaissent d’abord, puis reviennent en remontant.
    const textProgress = Math.min(1, progress * 3.2);
    heroTextContent.style.opacity = String(1 - textProgress);
    heroTextContent.style.transform = `translateY(${-textProgress * 45}px)`;
    heroTextContent.style.visibility = textProgress >= 1 ? 'hidden' : 'visible';

    // L’image se contracte au centre jusqu’à disparaître à la fin de la section sticky.
    const imageProgress = Math.max(0, (progress - 0.12) / 0.88);
    const scale = 1 - imageProgress * 0.98;
    heroImageWrapper.style.transform = `scale(${scale})`;
    heroImageWrapper.style.borderRadius = `${imageProgress * 48}px`;
  };

  const requestHeroUpdate = () => {
    if (animationFrameRequested) return;
    animationFrameRequested = true;
    window.requestAnimationFrame(() => {
      updateHeroTransition();
      animationFrameRequested = false;
    });
  };

  window.addEventListener('scroll', requestHeroUpdate, { passive: true });
  window.addEventListener('resize', requestHeroUpdate);
  updateHeroTransition();
});

/* SCRIPT DE TRANSITION DE LA SECTION "À PROPOS DE L'ARTISTE" AU SCROLL */
document.addEventListener('DOMContentLoaded', () => {
  const aboutSection = document.getElementById('about');
  const aboutIntro = document.getElementById('aboutIntro');
  const aboutImage = document.getElementById('aboutImage');
  const aboutText = document.getElementById('aboutText');

  window.addEventListener('scroll', () => {
    if (!aboutSection) return;

    const rect = aboutSection.getBoundingClientRect();
    const sectionHeight = aboutSection.offsetHeight - window.innerHeight;
    
    // Calcule la progression du scroll dans cette section spécifique (de 0 à 1)
    let progress = -rect.top / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));

    if (progress > 0 && progress < 1) {
      // PHASE 1 (0% à 50%) : Le grand titre s'efface et zoome légèrement
      const introOpacity = 1 - (progress * 2.2); // S'efface rapidement dans la première moitié
      const introScale = 1 + (progress * 0.1);
      
      aboutIntro.style.opacity = Math.max(0, introOpacity);
      aboutIntro.style.transform = `scale(${introScale})`;
      aboutIntro.style.pointerEvents = introOpacity <= 0 ? 'none' : 'auto';

      // PHASE 2 (30% à 100%) : La photo glisse depuis la gauche et le texte apparaît
      const revealProgress = Math.max(0, (progress - 0.25) / 0.75); // Démarre un peu avant la fin de l'intro
      
      // La photo glisse de -120px vers 0px et passe d'opacité 0 à 1
      const imageX = -120 * (1 - revealProgress);
      aboutImage.style.transform = `translateX(${imageX}px)`;
      aboutImage.style.opacity = revealProgress;

      // Le texte glisse de +60px vers 0px et passe d'opacité 0 à 1
      const textX = 60 * (1 - revealProgress);
      aboutText.style.transform = `translateX(${textX}px)`;
      aboutText.style.opacity = revealProgress;

    } else if (progress === 0) {
      // État initial (avant d'entrer dans la section)
      aboutIntro.style.opacity = 1;
      aboutIntro.style.transform = 'scale(1)';
      aboutIntro.style.pointerEvents = 'auto';

      aboutImage.style.transform = 'translateX(-120px)';
      aboutImage.style.opacity = 0;

      aboutText.style.transform = 'translateX(60px)';
      aboutText.style.opacity = 0;
    } else if (progress === 1) {
      // État final (section complètement passée)
      aboutIntro.style.opacity = 0;
      aboutIntro.style.pointerEvents = 'none';

      aboutImage.style.transform = 'translateX(0)';
      aboutImage.style.opacity = 1;

      aboutText.style.transform = 'translateX(0)';
      aboutText.style.opacity = 1;
    }
  });
});

/* TRANSITION ET GESTION DU FORMULAIRE DE CONTACT */
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Animation d'apparition au scroll pour la section Contact
  const contactSection = document.getElementById('contact');

  const observerOptions = {
    root: null,
    threshold: 0.15 // Déclenche l'animation quand 15% de la section est visible
  };

  const contactObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (contactSection) {
    // État initial avant l'apparition
    contactSection.style.opacity = '0';
    contactSection.style.transform = 'translateY(40px)';
    contactSection.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    
    contactObserver.observe(contactSection);
  }

  // 2. Gestion de l'envoi du formulaire (Simulation d'envoi élégante)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.btn-submit-contact');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = "<span>Transmission en cours...</span>";
      submitBtn.style.backgroundColor = "#FF2A85";
      submitBtn.disabled = true;

      setTimeout(() => {
        alert("Merci pour votre message. L'équipe d'Arttrixx Gallery vous recontactera dans les plus brefs délais.");
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.style.backgroundColor = "#111111";
        submitBtn.disabled = false;
      }, 1500);
    });
  }

});