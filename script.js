/**
 * ESSAM ADEL — NEO-BRUTALIST PORTFOLIO
 * Lightweight Vanilla JS with Progressive Enhancement
 * Everything remains fully functional if JS is disabled.
 */

document.addEventListener('DOMContentLoaded', () => {
  globalThis.Portfolio?.init();
  initMobileNav();
  initProjectFilters();
  initLightbox();
  initBackToTop();
  initArcadeSounds();
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
  const projectCards = document.querySelectorAll('.project-card, .project-bar-item');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = '';
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

/* -------------------------------------------------------------------------
   Opt-in Arcade UI Sound Pack — Web Audio API, no external sound assets
   ------------------------------------------------------------------------- */
function initArcadeSounds() {
  const header = document.querySelector('.header-inner');
  if (!header) return;

  // Persist only the user's explicit choice; never play sounds automatically.
  const storageKey = 'essam_arcade_sounds_enabled';
  let enabled = false;
  try { enabled = localStorage.getItem(storageKey) === 'true'; } catch (_) {}
  let audioContext = null;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'arcade-sound-toggle';
  const mobileToggle = header.querySelector('.mobile-toggle');
  header.insertBefore(toggle, mobileToggle || null);

  function renderToggle() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Turn arcade sounds off' : 'Turn arcade sounds on');
    toggle.title = enabled ? 'Turn sound off' : 'Turn sound on';
    toggle.innerHTML =
      '<span class="sound-symbol" aria-hidden="true">' + (enabled ? '🔊' : '🔇') + '</span>' +
      '<span class="sound-label">SOUND ' + (enabled ? 'ON' : 'OFF') + '</span>';
  }
  renderToggle();

  function audio() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    try {
      if (!audioContext) audioContext = new Audio();
      if (audioContext.state === 'suspended') {
        const p = audioContext.resume();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      return audioContext;
    } catch (_) {
      return null;
    }
  }

  // Small, self-contained sounds matching the Arcade Sound Lab preview.
  function note(context, { freq = 500, to = freq, duration = 0.09,
                            type = 'square', amp = 0.13, offset = 0 }) {
    const t = context.currentTime + offset;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, t);
    if (to !== freq) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + duration);
    }
    volume.gain.setValueAtTime(0.0001, t);
    volume.gain.exponentialRampToValueAtTime(Math.max(0.0002, amp * 0.5), t + Math.min(0.006, duration / 3));
    volume.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.01);
  }

  function play(name) {
    if (!enabled) return;
    const c = audio();
    if (!c) return;
    try {
      switch (name) {
        case 'open':
          note(c, { freq: 392, to: 470, duration: 0.085, type: 'square', amp: 0.13 });
          note(c, { freq: 587, to: 630, duration: 0.085, type: 'square', amp: 0.11, offset: 0.09 });
          note(c, { freq: 784, to: 900, duration: 0.16, type: 'triangle', amp: 0.18, offset: 0.18 });
          break;
        case 'popup':
          note(c, { freq: 230, to: 510, duration: 0.115, type: 'triangle', amp: 0.26 });
          note(c, { freq: 360, to: 850, duration: 0.115, type: 'sine', amp: 0.24, offset: 0.072 });
          break;
        case 'select':
          note(c, { freq: 880, to: 1050, duration: 0.04, type: 'square', amp: 0.095 });
          note(c, { freq: 1320, to: 1300, duration: 0.047, type: 'triangle', amp: 0.09, offset: 0.045 });
          break;
        case 'menu':
          note(c, { freq: 320, to: 650, duration: 0.12, type: 'sawtooth', amp: 0.08 });
          note(c, { freq: 740, to: 590, duration: 0.07, type: 'triangle', amp: 0.08, offset: 0.095 });
          break;
        case 'next':
          note(c, { freq: 520, to: 560, duration: 0.07, type: 'square', amp: 0.13 });
          note(c, { freq: 700, to: 730, duration: 0.075, type: 'square', amp: 0.11, offset: 0.085 });
          break;
        case 'close':
          note(c, { freq: 650, to: 380, duration: 0.12, type: 'triangle', amp: 0.20 });
          note(c, { freq: 340, to: 180, duration: 0.12, type: 'sine', amp: 0.17, offset: 0.075 });
          break;
      }
    } catch (_) {
      // Never break navigation or gallery interactions because of audio support.
    }
  }

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(storageKey, String(enabled)); } catch (_) {}
    renderToggle();
    if (enabled) play('select'); // A deliberate user click unlocks audio.
  });

  const projectPages = /(?:^|\/)(?:next-campaigns|matchday-design|street-kicks|football-editorial|kids-collection|visual-experiments|sportswear-archive|training-tops-editorial|fuzy-fruit-soda)\.html$/i;

  // Event delegation works on the home page and every project detail page.
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target || target.closest('.arcade-sound-toggle')) return;

    // Make the existing "Enlarge" labels open the same gallery as their images.
    const zoomButton = target.closest('.zoom-hint-btn');
    if (zoomButton) {
      const galleryLink = zoomButton.closest('.gallery-item')?.querySelector('.gallery-image-link');
      if (galleryLink) {
        galleryLink.click();
        return;
      }
    }

    if (target.closest('.lightbox-close-btn') || target.classList.contains('lightbox-modal')) {
      play('close');
    } else if (target.closest('.lightbox-prev, .lightbox-next')) {
      play('next');
    } else if (target.closest('.gallery-image-link')) {
      play('popup');
    } else if (target.closest('.filter-btn')) {
      play('select');
    } else if (target.closest('.mobile-toggle')) {
      play('menu');
    } else {
      const link = target.closest('a[href]');
      if (link) {
        let destination;
        try { destination = new URL(link.href, location.href); } catch (_) {}
        const isProject = destination && destination.origin === location.origin &&
          projectPages.test(destination.pathname);
        if (isProject && enabled && !event.defaultPrevented &&
            event.button === 0 && !event.ctrlKey && !event.metaKey &&
            !event.shiftKey && !event.altKey &&
            !link.hasAttribute('download') && (!link.target || link.target === '_self')) {
          // Let the recognizable arcade start chime finish before page navigation.
          event.preventDefault();
          play('open');
          window.setTimeout(() => { window.location.assign(destination.href); }, 320);
        } else {
          play(isProject ? 'open' : 'select');
        }
      } else if (target.closest('button')) {
        play('select');
      }
    }
  });

  // Give keyboard-operated lightboxes the same sounds as pointer interactions.
  document.addEventListener('keydown', (event) => {
    const modal = document.querySelector('.lightbox-modal.is-active');
    if (modal) {
      if (event.key === 'Escape') play('close');
      else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') play('next');
    } else if (event.key === 'Escape' &&
               document.querySelector('.nav-menu-wrapper.is-open')) {
      play('close');
    }
  }, true);
}

/* Load anonymous analytics on every portfolio page. */
(function () {
  const script = document.createElement('script');
  script.src = new URL('analytics.js', document.currentScript.src).href;
  script.defer = true;
  document.head.appendChild(script);
})();
