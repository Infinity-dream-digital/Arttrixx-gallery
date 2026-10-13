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

  /* ==========================================
     3. AJOUT DES ARTICLES AU PANIER
     ========================================== */
  const cartCount = document.querySelector('.cart-count');
  const cartToast = document.getElementById('cartToast');
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  let cartQuantity = 0;
  let toastTimeout;

  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      cartQuantity += 1;
      if (cartCount) cartCount.textContent = String(cartQuantity);

      if (cartToast) {
        cartToast.textContent = `${button.dataset.productName} ajouté au panier.`;
        cartToast.classList.add('visible');
        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => {
          cartToast.classList.remove('visible');
        }, 2600);
      }

      button.innerHTML = 'Ajouté au panier <span aria-hidden="true">✓</span>';
      window.setTimeout(() => {
        button.innerHTML = 'Ajouter au panier <span aria-hidden="true">+</span>';
      }, 1400);
    });
  });

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