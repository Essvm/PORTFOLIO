/**
 * ESSAM ADEL — NEO-BRUTALIST PORTFOLIO
 * Lightweight Vanilla JS with Progressive Enhancement
 * Everything remains fully functional if JS is disabled.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initProjectFilters();
  initLightbox();
  initBackToTop();
});

/* -------------------------------------------------------------------------
   Mobile Navigation Toggle
   ------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu-wrapper');
  if (!toggleBtn || !navMenu) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !toggleBtn.classList.contains('is-open');
    toggleBtn.classList.toggle('is-open', isOpen);
    navMenu.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  }

  toggleBtn.addEventListener('click', () => toggleMenu());

  // Close when clicking nav links
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

/* -------------------------------------------------------------------------
   Project Category Filter (Homepage)
   ------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------
   Accessible Lightbox Gallery (Project Subpages)
   ------------------------------------------------------------------------- */
function initLightbox() {
  const galleryLinks = document.querySelectorAll('.gallery-image-link');
  const modal = document.querySelector('.lightbox-modal');
  if (!galleryLinks.length || !modal) return;

  const modalImg = modal.querySelector('.lightbox-img');
  const modalCaption = modal.querySelector('.lightbox-footer');
  const modalCounter = modal.querySelector('.lightbox-counter');
  const closeBtn = modal.querySelector('.lightbox-close-btn');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentIndex = 0;
  let lastFocusedElement = null;

  // Build items array from DOM
  const items = Array.from(galleryLinks).map(link => ({
    src: link.getAttribute('href'),
    alt: link.querySelector('img')?.getAttribute('alt') || '',
    caption: link.getAttribute('data-caption') || link.querySelector('img')?.getAttribute('alt') || '',
    element: link
  }));

  function openLightbox(index) {
    currentIndex = index;
    lastFocusedElement = document.activeElement;
    updateLightboxContent();
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeLightbox() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function updateLightboxContent() {
    const item = items[currentIndex];
    if (!item) return;

    if (modalImg) {
      modalImg.src = item.src;
      modalImg.alt = item.alt;
    }
    if (modalCaption) {
      modalCaption.textContent = item.caption;
    }
    if (modalCounter) {
      modalCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % items.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateLightboxContent();
  }

  // Bind click handlers to gallery links
  galleryLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', showNext);
  prevBtn?.addEventListener('click', showPrev);

  // Close when clicking modal backdrop outside container
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}

/* -------------------------------------------------------------------------
   Back to Top
   ------------------------------------------------------------------------- */
function initBackToTop() {
  const topBtns = document.querySelectorAll('.back-to-top-btn');
  topBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}
