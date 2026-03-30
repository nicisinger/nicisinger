/**
 * Cookie Consent – nicisinger.de
 * Blockiert Google Fonts, YouTube, Google Maps und Instagram embed.js
 * bis der Nutzer einwilligt. Bilingual DE/EN.
 */
(function () {
  var KEY  = 'nicisinger-cookie-consent';
  var FONT = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap';

  /* ── Hilfsfunktionen ─────────────────────────────────────────── */

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(KEY, val); } catch (e) {}
  }
  function getLang() {
    try { return localStorage.getItem('nicisinger-lang') || 'de'; } catch (e) { return 'de'; }
  }

  /* ── Übersetzungen ───────────────────────────────────────────── */

  var T = {
    de: {
      bannerText : 'Diese Website nutzt externe Dienste (Google Fonts, YouTube, Google Maps, Instagram). Beim Laden dieser Inhalte werden Daten wie Ihre IP-Adresse an die jeweiligen Anbieter übermittelt – auch in Drittländer wie die USA. Mehr Infos in unserer',
      privacy    : 'Datenschutzerklärung',
      accept     : 'Alle akzeptieren',
      decline    : 'Nur notwendige',
      mapsText   : 'Google Maps ist deaktiviert. Bitte Cookie-Einstellungen anpassen, um die Karte zu laden.',
      mapsBtn    : 'Karte laden (Cookies akzeptieren)',
      mapsAddr   : 'Adresse: Bertramstraße 47, 51103 Köln',
      ytText     : 'Dieses Video ist deaktiviert. Bitte Cookie-Einstellungen anpassen, um YouTube-Videos zu laden.',
      ytBtn      : 'Video laden (Cookies akzeptieren)',
    },
    en: {
      bannerText : 'This website uses external services (Google Fonts, YouTube, Google Maps, Instagram). When loading this content, data such as your IP address is transmitted to the respective providers – including to third countries such as the USA. More info in our',
      privacy    : 'Privacy Policy',
      accept     : 'Accept all',
      decline    : 'Only necessary',
      mapsText   : 'Google Maps is disabled. Please update your cookie settings to load the map.',
      mapsBtn    : 'Load map (accept cookies)',
      mapsAddr   : 'Address: Bertramstraße 47, 51103 Cologne',
      ytText     : 'This video is disabled. Please update your cookie settings to load YouTube videos.',
      ytBtn      : 'Load video (accept cookies)',
    }
  };

  function t(key) {
    var lang = getLang();
    return (T[lang] || T.de)[key];
  }

  /* ── Google Fonts ────────────────────────────────────────────── */

  function loadGoogleFonts() {
    if (document.querySelector('link[href*="fonts.googleapis.com/css"]')) return;
    var pc1 = document.createElement('link');
    pc1.rel = 'preconnect'; pc1.href = 'https://fonts.googleapis.com';
    document.head.insertBefore(pc1, document.head.firstChild);
    var pc2 = document.createElement('link');
    pc2.rel = 'preconnect'; pc2.href = 'https://fonts.gstatic.com'; pc2.crossOrigin = '';
    document.head.insertBefore(pc2, pc1.nextSibling);
    var lnk = document.createElement('link');
    lnk.rel = 'stylesheet'; lnk.href = FONT;
    document.head.appendChild(lnk);
  }

  /* ── Embeds aktivieren ───────────────────────────────────────── */

  function activateEmbeds() {
    /* Iframes mit data-consent-src (Google Maps) */
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      f.src = f.getAttribute('data-consent-src');
      f.style.display = '';
    });

    /* Maps-Placeholder ausblenden */
    document.querySelectorAll('.cc-maps-placeholder').forEach(function (el) {
      el.style.display = 'none';
    });

    /* Instagram embed.js */
    var instaPlaceholder = document.getElementById('instagram-embed-placeholder');
    if (instaPlaceholder) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    }

    /* YouTube-Overlay entfernen */
    document.querySelectorAll('.cc-yt-overlay').forEach(function (el) { el.remove(); });
  }

  /* ── YouTube blockieren ──────────────────────────────────────── */

  function blockYouTube() {
    document.querySelectorAll('.youtube-preview').forEach(function (item) {
      /* Overlay direkt über das Thumbnail legen */
      if (item.querySelector('.cc-yt-overlay')) return;
      var overlay = document.createElement('div');
      overlay.className = 'cc-yt-overlay';
      overlay.innerHTML =
        '<p>' + t('ytText') + '</p>' +
        '<button class="cc-yt-btn">' + t('ytBtn') + '</button>';
      overlay.querySelector('.cc-yt-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        accept();
      });
      /* position: relative auf Parent sicherstellen */
      var pos = getComputedStyle(item).position;
      if (pos === 'static') item.style.position = 'relative';
      item.appendChild(overlay);

      /* Klick aufs Element abfangen */
      item.addEventListener('click', function (e) {
        if (getConsent() !== 'accepted') {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);
    });
  }

  /* ── Maps-Placeholder einfügen ───────────────────────────────── */

  function insertMapsPlaceholders() {
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      if (f.parentNode.querySelector('.cc-maps-placeholder')) return;
      f.style.display = 'none';
      var ph = document.createElement('div');
      ph.className = 'cc-maps-placeholder';
      ph.innerHTML =
        '<p class="cc-maps-text">' + t('mapsText') + '</p>' +
        '<p class="cc-maps-addr">' + t('mapsAddr') + '</p>' +
        '<button class="cc-maps-btn">' + t('mapsBtn') + '</button>';
      ph.querySelector('.cc-maps-btn').addEventListener('click', accept);
      f.parentNode.insertBefore(ph, f);
    });
  }

  /* ── Banner ──────────────────────────────────────────────────── */

  function showBanner() {
    var privacyHref = window.location.pathname.indexOf('datenschutz') > -1
      ? '#' : 'datenschutz.html';

    var banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', getLang() === 'de' ? 'Cookie-Einstellungen' : 'Cookie settings');
    banner.innerHTML =
      '<div class="cc-inner">' +
        '<p class="cc-text">' + t('bannerText') +
        ' <a href="' + privacyHref + '" class="cc-link">' + t('privacy') + '</a>.</p>' +
        '<div class="cc-btns">' +
          '<button class="cc-btn cc-btn-decline" id="cc-decline">' + t('decline') + '</button>' +
          '<button class="cc-btn cc-btn-accept" id="cc-accept">' + t('accept') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
    /* Fade-in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('cc-visible'); });
    });

    document.getElementById('cc-accept').addEventListener('click', accept);
    document.getElementById('cc-decline').addEventListener('click', decline);
  }

  function hideBanner() {
    var b = document.getElementById('cc-banner');
    if (!b) return;
    b.classList.remove('cc-visible');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 350);
  }

  /* ── Aktionen ────────────────────────────────────────────────── */

  function accept() {
    setConsent('accepted');
    hideBanner();
    loadGoogleFonts();
    activateEmbeds();
  }

  function decline() {
    setConsent('declined');
    hideBanner();
  }

  /* ── Init ────────────────────────────────────────────────────── */

  function init() {
    var consent = getConsent();
    if (consent === 'accepted') {
      loadGoogleFonts();
      activateEmbeds();
    } else {
      insertMapsPlaceholders();
      blockYouTube();
      if (consent === null) {
        showBanner();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Globale API (für Datenschutz-Seite o.ä.) */
  window.CookieConsent = {
    getConsent : getConsent,
    accept     : accept,
    decline    : decline,
    reset      : function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
