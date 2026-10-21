const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const mediaUrls = window.MEDIA_URLS || {};

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
    navigation.classList.toggle('is-open', !open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }));
}

document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());

// Die Medienpfade aus media-config.js verweisen auf lokale Website-Dateien.
document.querySelectorAll('[data-media]').forEach(image => {
  const url = mediaUrls[image.dataset.media];
  if (url) image.src = url;
});
document.querySelectorAll('[data-media-background]').forEach(element => {
  const url = mediaUrls[element.dataset.mediaBackground];
  if (url) element.style.backgroundImage = `linear-gradient(90deg,rgba(13,37,29,.72),rgba(13,37,29,.2)),url("${url}")`;
});

// Das Hero-Video lädt nur auf größeren Bildschirmen und ohne reduzierte Bewegung.
const heroVideo = document.querySelector('.hero-video');
if (heroVideo && mediaUrls.heroPoster) heroVideo.poster = mediaUrls.heroPoster;
if (heroVideo && !window.matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce), (save-data: reduce)').matches) {
  const source = heroVideo.querySelector('source[data-src]');
  const videoUrl = mediaUrls.heroVideo || source?.dataset.src;
  if (source && videoUrl) {
    source.src = videoUrl;
    source.removeAttribute('data-src');
    heroVideo.load();
    heroVideo.play().catch(() => {});
  }
}

// Lokale Platzhalter zeigen bis zum Einsetzen der Fotos eine ruhige Fläche.
document.querySelectorAll('.gallery-item img, .teaser-image img, .about-photo img').forEach(image => {
  image.addEventListener('error', () => {
    image.hidden = true;
    image.parentElement.classList.add('is-empty');
  }, { once: true });
});

function renderImageGallery(targetId, imagePaths, label) {
  const gallery = document.getElementById(targetId);
  if (!gallery || !Array.isArray(imagePaths)) return;
  imagePaths.forEach((path, index) => {
    const figure = document.createElement('figure');
    figure.className = `gallery-item${index === 0 && targetId === 'place-gallery' ? ' gallery-large' : ''}`;
    const image = document.createElement('img');
    image.src = path;
    image.alt = `${label} ${index + 1}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.hidden = true;
      figure.classList.add('is-empty');
    }, { once: true });
    figure.append(image);
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback';
    fallback.textContent = `${label} ${index + 1}`;
    figure.append(fallback);
    gallery.append(figure);
  });
}
renderImageGallery('place-gallery', mediaUrls.placeGallery, 'Golfplatzaufnahme');
renderImageGallery('trainer-gallery', mediaUrls.trainerGallery, 'Oliver beim Golf');

// Externe Inhalte (Google Fonts und Maps) werden nur nach Einwilligung geladen.
const CONSENT_STORAGE_KEY = 'oliver-eckstein-cookie-einstellungen-v1';
const readConsent = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY));
    return saved && saved.necessary === true && typeof saved.externalMedia === 'boolean' ? saved : null;
  } catch { return null; }
};
let consentState = readConsent();

document.body.insertAdjacentHTML('beforeend', `
  <section class="cookie-banner" id="cookie-banner" aria-labelledby="cookie-title" hidden>
    <div class="cookie-copy"><p class="eyebrow">Deine Privatsphäre</p><h2 id="cookie-title">Deine Auswahl für externe Inhalte</h2><p>Notwendige Funktionen sind immer aktiv. Google Fonts und Google Maps laden wir nur, wenn du externe Inhalte erlaubst. Deine Auswahl kannst du jederzeit ändern.</p></div>
    <div class="cookie-actions"><button class="cookie-button cookie-secondary" id="cookie-reject" type="button">Ablehnen</button><button class="cookie-button cookie-secondary" id="cookie-customize" type="button">Einstellungen</button><button class="cookie-button cookie-primary" id="cookie-accept" type="button">Alle erlauben</button></div>
  </section>
  <dialog class="consent-dialog" id="consent-dialog" aria-labelledby="consent-title">
    <form method="dialog" class="consent-dialog-inner">
      <button class="consent-close" id="consent-close" type="button" aria-label="Einstellungen schließen">×</button>
      <p class="eyebrow">Privatsphäre</p><h2 id="consent-title">Cookie-Einstellungen</h2>
      <p>Diese Website verwendet keine Analyse- oder Werbe-Cookies. Deine Auswahl wird lokal auf diesem Gerät gespeichert.</p>
      <div class="consent-option"><div><strong>Notwendig</strong><p>Speichert deine Datenschutzauswahl und ermöglicht grundlegende Funktionen.</p></div><span class="consent-always">Immer aktiv</span></div>
      <label class="consent-option" for="consent-external"><div><strong>Externe Inhalte</strong><p>Lädt Google Fonts und Google Maps. Dabei kann deine IP-Adresse an Google übermittelt werden.</p></div><input id="consent-external" type="checkbox"></label>
      <div class="consent-dialog-actions"><button class="cookie-button cookie-secondary" id="consent-reject" type="button">Nur notwendige</button><button class="cookie-button cookie-secondary" id="consent-all" type="button">Alles erlauben</button><button class="cookie-button cookie-primary" id="consent-save" type="button">Auswahl speichern</button></div>
    </form>
  </dialog>
  <dialog class="image-viewer" id="image-viewer" aria-label="Bildansicht">
    <button class="image-viewer-close" type="button" aria-label="Bildansicht schließen">×</button>
    <button class="image-viewer-nav image-viewer-prev" type="button" aria-label="Vorheriges Bild">‹</button>
    <figure class="image-viewer-figure"><img class="image-viewer-image" alt=""><figcaption class="image-viewer-caption"></figcaption></figure>
    <button class="image-viewer-nav image-viewer-next" type="button" aria-label="Nächstes Bild">›</button>
    <span class="image-viewer-counter" aria-live="polite"></span>
  </dialog>
  <a class="whatsapp-float" id="whatsapp-float" href="https://wa.me/?text=Moin%21%20Ich%20interessiere%20mich%20f%C3%BCr%20ein%20Golftraining%20und%20freue%20mich%20%C3%BCber%20weitere%20Informationen." target="_blank" rel="noopener noreferrer" aria-label="Oliver Eckstein per WhatsApp kontaktieren" title="Per WhatsApp anfragen">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.38L3.3 28.8l6.57-1.72A12.7 12.7 0 1 0 16.02 3.2Zm0 23.2c-1.92 0-3.8-.51-5.44-1.48l-.39-.23-3.9 1.02 1.04-3.8-.25-.4a10.5 10.5 0 1 1 8.94 4.89Zm5.76-7.87c-.32-.16-1.89-.93-2.18-1.04-.29-.1-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.31-.02-.49.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.1-.21.05-.4-.03-.56-.08-.15-.71-1.72-.97-2.36-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.31-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.26-.75.26-1.39.18-1.52-.08-.13-.29-.21-.61-.37Z"/></svg>
  </a>
`);

const cookieBanner = document.querySelector('#cookie-banner');
const consentDialog = document.querySelector('#consent-dialog');
const externalConsentToggle = document.querySelector('#consent-external');
const whatsappButton = document.querySelector('#whatsapp-float');
const positionWhatsApp = () => {
  if (!whatsappButton) return;
  if (cookieBanner.hidden) {
    whatsappButton.style.removeProperty('bottom');
    return;
  }
  const gap = 16;
  const freeSpaceAboveBanner = window.innerHeight - cookieBanner.getBoundingClientRect().top;
  whatsappButton.style.bottom = `${freeSpaceAboveBanner + gap}px`;
};
const showCookieBanner = visible => {
  cookieBanner.hidden = !visible;
  document.body.classList.toggle('cookie-banner-visible', visible);
  positionWhatsApp();
};
window.addEventListener('resize', positionWhatsApp, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(positionWhatsApp).observe(cookieBanner);
const openConsentDialog = () => {
  externalConsentToggle.checked = Boolean(consentState?.externalMedia);
  if (typeof consentDialog.showModal === 'function') consentDialog.showModal();
  else consentDialog.setAttribute('open', '');
};
const loadGoogleFonts = () => {
  if (document.querySelector('#google-fonts-consent')) return;
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  document.head.append(preconnect);
  const fontLink = document.createElement('link');
  fontLink.id = 'google-fonts-consent';
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap';
  document.head.append(fontLink);
};
const renderMapPlaceholder = () => {
  const mapBox = document.querySelector('#map-box');
  if (!mapBox) return;
  mapBox.innerHTML = '<div class="map-placeholder"><span class="map-mark">⌖</span><h3>Lemgow · Wendland</h3><p>Google Maps wird erst nach deiner Einwilligung zu externen Inhalten geladen.</p><button class="button button-dark" id="load-map" type="button">Karte laden <span>↗</span></button></div>';
  document.querySelector('#load-map').addEventListener('click', () => {
    if (!consentState?.externalMedia) {
      openConsentDialog();
      return;
    }
    mapBox.innerHTML = '<iframe title="Google Maps – Trainingsort bei Lemgow" src="https://www.google.com/maps?q=52.9220670221492,11.323511711316815&z=16&output=embed" width="600" height="450" style="border:0" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  });
};
const saveConsent = externalMedia => {
  consentState = { necessary: true, externalMedia, savedAt: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentState)); } catch { /* Auswahl bleibt bis zum Neuladen im Arbeitsspeicher erhalten. */ }
  showCookieBanner(false);
  if (consentDialog.open) consentDialog.close();
  if (externalMedia) loadGoogleFonts();
  else {
    document.querySelector('#google-fonts-consent')?.remove();
    if (document.querySelector('#map-box iframe')) renderMapPlaceholder();
  }
};

document.querySelectorAll('.site-footer nav').forEach(nav => {
  const settingsButton = document.createElement('button');
  settingsButton.className = 'cookie-settings-trigger';
  settingsButton.type = 'button';
  settingsButton.textContent = 'Cookie-Einstellungen';
  settingsButton.addEventListener('click', openConsentDialog);
  nav.append(settingsButton);
});
document.querySelector('#cookie-accept').addEventListener('click', () => saveConsent(true));
document.querySelector('#cookie-reject').addEventListener('click', () => saveConsent(false));
document.querySelector('#cookie-customize').addEventListener('click', openConsentDialog);
document.querySelector('#consent-save').addEventListener('click', () => saveConsent(externalConsentToggle.checked));
document.querySelector('#consent-reject').addEventListener('click', () => saveConsent(false));
document.querySelector('#consent-all').addEventListener('click', () => saveConsent(true));
document.querySelector('#consent-close').addEventListener('click', () => consentDialog.close());
consentDialog.addEventListener('click', event => { if (event.target === consentDialog) consentDialog.close(); });
if (consentState?.externalMedia) loadGoogleFonts();
else if (!consentState) showCookieBanner(true);

const whatsappNumber = String(mediaUrls.whatsappNumber || '').replace(/\D/g, '');
if (whatsappNumber) document.querySelector('#whatsapp-float').href = `https://wa.me/${whatsappNumber}?text=Moin%21%20Ich%20interessiere%20mich%20f%C3%BCr%20ein%20Golftraining%20und%20freue%20mich%20%C3%BCber%20weitere%20Informationen.`;

renderMapPlaceholder();

// Bilder lassen sich vergrößern; innerhalb einer Galerie ist Blättern möglich.
const imageViewer = document.querySelector('#image-viewer');
const viewerImage = imageViewer.querySelector('.image-viewer-image');
const viewerCaption = imageViewer.querySelector('.image-viewer-caption');
const viewerCounter = imageViewer.querySelector('.image-viewer-counter');
const viewerPrev = imageViewer.querySelector('.image-viewer-prev');
const viewerNext = imageViewer.querySelector('.image-viewer-next');
let viewerImages = [];
let viewerIndex = 0;
let touchStartX = null;

const showViewerImage = index => {
  viewerIndex = (index + viewerImages.length) % viewerImages.length;
  const image = viewerImages[viewerIndex];
  viewerImage.src = image.currentSrc || image.src;
  viewerImage.alt = image.alt || 'Vergrößertes Golfbild';
  viewerCaption.textContent = image.alt || '';
  const hasMultipleImages = viewerImages.length > 1;
  viewerPrev.hidden = !hasMultipleImages;
  viewerNext.hidden = !hasMultipleImages;
  viewerCounter.hidden = !hasMultipleImages;
  viewerCounter.textContent = `${viewerIndex + 1} / ${viewerImages.length}`;
};

const openImageViewer = image => {
  const gallery = image.closest('.gallery-grid');
  viewerImages = gallery
    ? [...gallery.querySelectorAll('img:not([hidden])')]
    : [image];
  viewerIndex = Math.max(0, viewerImages.indexOf(image));
  showViewerImage(viewerIndex);
  if (!imageViewer.open) imageViewer.showModal();
};

document.querySelectorAll('.gallery-grid img, .teaser-image img, .about-photo img').forEach(image => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Bild vergrößern: ${image.alt || 'Golfbild'}`);
  image.title = 'Bild vergrößern';
  image.addEventListener('click', event => {
    event.preventDefault();
    openImageViewer(image);
  });
  image.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openImageViewer(image);
  });
});

document.querySelector('.image-viewer-close').addEventListener('click', () => imageViewer.close());
viewerPrev.addEventListener('click', () => showViewerImage(viewerIndex - 1));
viewerNext.addEventListener('click', () => showViewerImage(viewerIndex + 1));
imageViewer.addEventListener('click', event => {
  if (event.target === imageViewer) imageViewer.close();
});
imageViewer.addEventListener('keydown', event => {
  if (viewerImages.length < 2) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showViewerImage(viewerIndex - 1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    showViewerImage(viewerIndex + 1);
  }
});
viewerImage.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0]?.clientX ?? null;
}, { passive: true });
viewerImage.addEventListener('touchend', event => {
  if (touchStartX === null || viewerImages.length < 2) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 45) showViewerImage(viewerIndex + (distance < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });

// Dezente Scroll-Einblendungen und Lesefortschritt, mit Rücksicht auf reduzierte Bewegung.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  const revealSelector = [
    'main > section:not(.offer-section):not(.gallery-section):not(.trainer-gallery-section):not(.contact-page)',
    '.offer-card',
    '.gallery-item',
    '.trainer-gallery-section > .eyebrow',
    '.trainer-gallery-section > h2',
    '.contact-page > *',
    '.legal-page > .eyebrow',
    '.legal-page > h1',
    '.legal-page > .legal-notice',
    '.legal-page > h2',
    '.legal-page > p'
  ].join(',');
  const revealItems = [...document.querySelectorAll(revealSelector)];

  if ('IntersectionObserver' in window && revealItems.length) {
    document.documentElement.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealItems.forEach((item, index) => {
      item.dataset.reveal = '';
      item.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 65}ms`);
      revealObserver.observe(item);
    });
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let progressFrame = 0;
  const updateProgress = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
      progressFrame = 0;
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

const form = document.querySelector('#contact-form');
if (form) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('paket')) document.querySelector('#package').value = params.get('paket');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const subject = `Golftraining-Anfrage von ${fields.get('name')}`;
    const body = [`Name: ${fields.get('name')}`, `E-Mail: ${fields.get('email')}`, `Telefon: ${fields.get('phone') || '—'}`, `Training: ${fields.get('package') || 'Noch offen'}`, '', 'Nachricht:', fields.get('message')].join('\n');
    document.querySelector('#form-status').textContent = 'Dein E-Mail-Programm öffnet sich mit deiner Anfrage.';
    window.location.href = `mailto:KONTAKT-EMAIL-HIER-EINTRAGEN?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
