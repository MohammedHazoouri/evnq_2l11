/* =========================================================
   WISH UPON A FEELING — script.js
   Vanilla JS, no dependencies.

   Sections:
   0. CONFIG  (the ONLY place you need to edit to connect Google Sheets)
   1. Messages (edit/add your own here)
   2. Inspiration quotes
   3. Global watermark
   4. Helpers
   5. Wish flow
   6. Google Sheets (optional)
   7. Share
   8. UI: nav, reveal, header
   9. Particles
   10. Ambient sound
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     0. CONFIG
     --------------------------------------------------------- */

  /**
   * GOOGLE_SHEETS_ENDPOINT
   * Paste your deployed Google Apps Script Web App URL between the quotes
   * (it looks like https://script.google.com/macros/s/XXXXXXXX/exec).
   * Leave it as an empty string '' and the website works perfectly without saving anything.
   * No secrets belong here: this URL is public by nature. See README.md.
   */
  var GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxC8VxCOffCZ_hDzm5ovtyuGLSLRoPfmGLcKdp1RwzPcwATKGjnDOcVeP6m9ME6VBk-/exec';

  /** Optional shared "site key" that must match SITE_KEY in google-apps-script.gs.
   *  This is NOT a secret (anyone can read it); it only filters out casual junk traffic. */
  var SITE_KEY = '';

  var SITE_SOURCE = 'wish-upon-a-feeling';
  var MAX_LENGTH = 500;
  var MIN_LENGTH = 3;
  var MIN_SECONDS_ON_PAGE = 3;       // anti-bot: a human needs a moment to write
  var CLIENT_COOLDOWN_MS = 20000;    // anti-spam: minimum time between saved wishes

  var INSTAGRAM_URL = 'https://www.instagram.com/invites/contact/?utm_content=10y5v4es&srtk=2od0mn8c877b';
  var LOGO_PATH = 'assets/logo.jpg';

  /* ---------------------------------------------------------
     1. MESSAGES — 10 categories, 4+ messages each
     --------------------------------------------------------- */
  var MESSAGES = {
    'Romantic': [
      'Somewhere between your wish and the stars, a quiet kind of magic is paying attention. Love often arrives like that: softly, and exactly when you have stopped bracing for it.',
      'You deserve to be chosen gently, every single day. Not as an afterthought, not as a maybe, but as a certain, warm yes.',
      'Some hearts are like lanterns. They do not chase anyone; they simply glow until the right person finds their way to the light.',
      'May someone look at you the way the night looks at the moon: with wonder, with patience, and with no desire to change a thing.'
    ],
    'On Love': [
      'Love is not always fireworks. Sometimes it is a hand reaching for yours in the dark, without a word, as if it had always known where to find you.',
      'The love you are hoping for begins with the way you speak to yourself. Be the first to say something kind.',
      'To love and be loved is a quiet kind of wealth. Keep your heart open, even when it trembles.',
      'Real love makes room. It listens twice, forgives gracefully, and stays curious about who you are becoming.'
    ],
    'Hope & Dreams': [
      'Dreams are not too big. Sometimes they are simply waiting for you to grow into the courage they require.',
      'Even the longest night is only a pause between two sunrises. Your wish is already leaning toward the light.',
      'Keep the dream, even if it stays small and unseen for now. Seeds do their finest work in the dark.',
      'There is a version of tomorrow that you have not met yet. It is kinder than you fear, and it has your name in it.'
    ],
    'Personal Growth': [
      'You are not behind. You are becoming. Some gardens bloom late and bloom most beautifully.',
      'Every time you chose to continue, even imperfectly, you were already changing. Notice how far you have come.',
      'Let yourself outgrow old fears the way you outgrow old coats: with a little gratitude, and without shame.',
      'The person you are hoping to become is built from small, ordinary choices. Today can be one of them.'
    ],
    'Healing & Inner Peace': [
      'Healing is not a straight line. It is a slow turning toward the sun, one tender day at a time.',
      'Rest is not giving up. Let your shoulders fall, let your breath lengthen. You are allowed to be unfinished and still be loved.',
      'Some storms pass quietly, leaving the sky washed and the air new. Yours is learning to pass.',
      'Be as patient with your heart as you would be with a friend in pain. It is doing its very best.'
    ],
    'Courage & New Beginnings': [
      'A new beginning rarely announces itself. It often looks like an ordinary morning and one brave, small step.',
      'You do not have to see the whole staircase. Just take the first step, and the next one will appear.',
      'Courage is not the absence of trembling. It is trembling and walking forward anyway.',
      'Close the door gently if you must. What waits beyond it has been hoping you would come.'
    ],
    'Missing Someone': [
      'Missing someone is only love with nowhere to land yet. Let it be soft; it is proof of how deeply you can care.',
      'Distance cannot undo what is real. Somewhere, a thought of you is travelling just as far as yours is.',
      'If you miss them tonight, let the feeling pass through you like a tide. It leaves gentleness behind when it goes.',
      'Some people live in our hearts long after the moment has passed. Keep their warmth, and let it carry you forward.'
    ],
    'Long-Distance Love': [
      'The same moon is rising over both of you tonight. Love does not measure itself in miles, only in how often it returns.',
      'Between two cities there is a thread of small messages, patient hours, and faith. It is stronger than it looks.',
      'Long-distance love is a promise written in the future tense. Every sunrise brings you a little closer to it.',
      'Time zones divide the clocks, never the hearts. Hold on to the little rituals; they are bridges.'
    ],
    'Happiness & Gratitude': [
      'Happiness often hides in the smallest rooms: a warm cup, a familiar laugh, a window full of light. May you notice them.',
      'Gratitude turns what we have into enough, and enough into abundance. May your day be full of small, golden things.',
      'You are allowed to be happy without earning it first. Let joy find you exactly as you are.',
      'Look closely at today. Someone, somewhere, is quietly grateful for you, and even more for the way you show up.'
    ],
    'Inspiration': [
      'You were not made to shrink. Take up the space your dreams require, and let the world adjust.',
      'Begin where you are, with what you have. Most beautiful things started as an unremarkable first attempt.',
      'The universe loves a sincere effort. Keep going, and keep your heart soft while you do.',
      'Stars do not compete with one another. They simply shine. Be yourself, and let that be light enough.'
    ],
    'Soulmates & Fate': [
      'Some people are not met by chance, but recognised, like a song you somehow already know the words to.',
      'The universe is patient with love. It rearranges whole years, quietly, so two people can finally arrive at the same doorway.',
      'If it is meant for you, it will feel like coming home to a house you have never been inside.',
      'Fate is a gentle hand at the small of your back. It does not push; it simply turns you, again and again, toward the light you were made for.'
    ],
    'Late-Night Longing': [
      'It is the hour when wishes are loudest and the world is softest. Say it plainly; the dark is a kind listener.',
      'Longing is only love practising for the day it is allowed to arrive. You are not waiting in vain, you are rehearsing joy.',
      'Tonight, hold yourself the way you wish to be held. Tomorrow, someone may learn how.',
      'The night keeps secrets beautifully. Yours is safe here, folded small and pressed against the stars.'
    ],
    'Tender Words': [
      'You are doing better than you think, loving harder than you admit, and you are more lovable than you were ever told.',
      'May someone tuck a strand of hair behind your ear and say nothing at all, because the silence between you is already full.',
      'Soft is not the same as fragile. The sea is soft, and it has shaped every shore it has ever touched.',
      'Whatever you wished tonight, know this: wanting love so tenderly is already a beautiful way to live.'
    ]
  };

  /* A few extra, more intimate lines for the love categories */
  MESSAGES['Romantic'].push(
    'Somewhere, someone is learning the sound of your laugh by heart, even before they know your name. Be patient with the hours; they are carrying you toward each other.',
    'You are the kind of person people write letters to in their heads at night. Let yourself be that tender, that wanted.',
    'Love will not ask you to be smaller, quieter, or less. It will lean in and say: stay exactly as you are.',
    'May the next hand that holds yours hold it like the last warm thing in a cold world, and never once let go.'
  );
  MESSAGES['On Love'].push(
    'The tenderest love is made of small, repeated things: a message at midnight, a coat held open, a name said softly into the dark.',
    'To be known and still chosen, that is the whole of it. May you be known gently, and chosen loudly.'
  );
  MESSAGES['Missing Someone'].push(
    'Tonight your heart is a window left open for someone. Let the breeze carry in whatever it will; it is all a form of love.',
    'Some names stay warm on the tongue for years. That is not weakness, it is a heart that remembers how to be tender.'
  );
  MESSAGES['Long-Distance Love'].push(
    'Every goodnight you send across the miles is a small lantern lit in someone else\u2019s dark. Keep lighting them.',
    'One day the distance will be only a story you tell with your heads together, laughing softly, fingers intertwined.'
  );

  /* Light, private, in-browser keyword hints so messages can feel more personal.
     The wish text is never sent anywhere by this step. */
  var CATEGORY_HINTS = [
    { cat: 'Soulmates & Fate',   words: ['soulmate', 'destiny', 'fate', 'meant to be', 'twin flame'] },
    { cat: 'Long-Distance Love', words: ['distance', 'far away', 'abroad', 'long distance', 'long-distance', 'overseas', 'miles'] },
    { cat: 'Missing Someone',    words: ['miss', 'missing', 'gone', 'lost someone', 'come back', 'passed away'] },
    { cat: 'Romantic',           words: ['crush', 'boyfriend', 'girlfriend', 'partner', 'husband', 'wife', 'romance', 'kiss', 'soulmate', 'someone special'] },
    { cat: 'On Love',            words: ['love', 'loved', 'relationship', 'marriage', 'heart'] },
    { cat: 'Late-Night Longing', words: ['tonight', 'midnight', 'cant sleep', 'can\'t sleep', 'lonely', 'longing', 'alone', 'insomnia'] },
    { cat: 'Healing & Inner Peace', words: ['heal', 'peace', 'calm', 'anxiety', 'tired', 'stress', 'hurt', 'pain', 'rest'] },
    { cat: 'Courage & New Beginnings', words: ['start', 'begin', 'new job', 'move', 'change', 'brave', 'fresh', 'leave'] },
    { cat: 'Personal Growth',    words: ['grow', 'better', 'myself', 'confidence', 'learn', 'improve', 'discipline'] },
    { cat: 'Happiness & Gratitude', words: ['happy', 'happiness', 'joy', 'thank', 'grateful', 'smile'] },
    { cat: 'Hope & Dreams',      words: ['dream', 'hope', 'wish', 'future', 'someday', 'career', 'success'] }
  ];

  /* ---------------------------------------------------------
     2. INSPIRATION QUOTES (original lines)
     --------------------------------------------------------- */
  var QUOTES = [
    { t: 'Love is simply attention, offered with great care.', by: 'On love' },
    { t: 'To miss someone is to carry a small, warm lantern for them through the dark.', by: 'On longing' },
    { t: 'The heart knows its own direction long before the mind finds the words.', by: 'On wishes' },
    { t: 'Some people feel like a quiet song you have always known the words to.', by: 'On finding each other' },
    { t: 'Tenderness is a kind of courage that the world forgets to applaud.', by: 'On tenderness' },
    { t: 'Even a whispered wish has the power to turn a heart toward the light.', by: 'On dreams' }
  ];

  /* ---------------------------------------------------------
     3. GLOBAL WATERMARK
     Guarantees the Instagram circle exists on every page that loads this script,
     including future pages, even if the markup was not copied in.
     --------------------------------------------------------- */
  function ensureWatermark() {
    var wm = document.getElementById('evnqWatermark');
    if (!wm) {
      wm = document.createElement('a');
      wm.className = 'evnq-watermark';
      wm.id = 'evnqWatermark';
      wm.href = INSTAGRAM_URL;
      wm.target = '_blank';
      wm.rel = 'noopener noreferrer';
      wm.setAttribute('aria-label', 'EvnQ on Instagram (opens in a new tab)');
      wm.innerHTML =
        '<span class="wm-halo" aria-hidden="true"></span>' +
        '<img src="' + LOGO_PATH + '" alt="EvnQ logo" width="64" height="64" decoding="async">' +
        '<span class="wm-tip" role="tooltip">Follow EvnQ on Instagram</span>';
      document.body.appendChild(wm);
    }
    // Keep the contract even if someone edits the markup
    wm.href = INSTAGRAM_URL;
    wm.target = '_blank';
    wm.rel = 'noopener noreferrer';

    // If the logo file is missing, show a clearly marked placeholder
    var img = wm.querySelector('img');
    if (img) {
      var flag = function () { wm.classList.add('no-logo'); img.style.visibility = 'hidden'; };
      img.addEventListener('error', flag);
      if (img.complete && img.naturalWidth === 0) flag();
    }
  }

  /* ---------------------------------------------------------
     4. HELPERS
     --------------------------------------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageLoadedAt = Date.now();

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'w-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduceMotion ? Math.min(ms, 250) : ms); }); }

  function flatMessages() {
    var out = [];
    Object.keys(MESSAGES).forEach(function (cat) {
      MESSAGES[cat].forEach(function (text) { out.push({ cat: cat, text: text }); });
    });
    return out;
  }

  /* Avoid immediate repeats: keep a "recently shown" list until the pool is nearly used up */
  var recent = [];
  function nextMessage(preferredCat) {
    var all = flatMessages();
    var pool = all;
    if (preferredCat && MESSAGES[preferredCat]) {
      pool = all.filter(function (m) { return m.cat === preferredCat; });
    }
    var fresh = pool.filter(function (m) { return recent.indexOf(m.text) === -1; });
    if (!fresh.length) {              // preferred category exhausted: widen to everything not yet seen
      fresh = all.filter(function (m) { return recent.indexOf(m.text) === -1; });
    }
    if (!fresh.length) { recent = []; fresh = all; }
    var chosen = pick(fresh);
    recent.push(chosen.text);
    return chosen;
  }

  function detectCategory(text) {
    var t = (' ' + text.toLowerCase() + ' ');
    for (var i = 0; i < CATEGORY_HINTS.length; i++) {
      var h = CATEGORY_HINTS[i];
      for (var j = 0; j < h.words.length; j++) {
        if (t.indexOf(h.words[j]) !== -1) return h.cat;
      }
    }
    return null;
  }

  /* Remove control characters, collapse long whitespace; textContent is used for output so no HTML is ever injected */
  function sanitize(text) {
    return String(text)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/[ \t]{3,}/g, '  ')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }

  /* Friendly validation. Returns an error string, or '' if fine. */
  function validate(text) {
    if (!text) return 'Your wish is waiting to be written. Even a few words will do.';
    if (text.length < MIN_LENGTH) return 'Just a little more, please. A wish needs at least a few characters.';
    if (text.length > MAX_LENGTH) return 'Your wish is a little long. Please keep it within ' + MAX_LENGTH + ' characters.';
    if (/https?:\/\/|www\./i.test(text)) return 'Please leave links out. A wish is best when it comes from the heart.';
    if (/(.)\1{14,}/.test(text)) return 'That looks like a lot of repeated characters. Could you put it into words?';
    return '';
  }

  /* ---------------------------------------------------------
     5. WISH FLOW
     --------------------------------------------------------- */
  var els = {};
  var state = { busy: false, category: null, message: null };

  var LOADING_LINES = [
    'Folding your wish into a tiny star...',
    'Whispering it to the moon...',
    'Waiting for the night to answer...'
  ];

  function show(panel) {
    ['panelForm', 'panelLoading', 'panelResult'].forEach(function (k) {
      els[k].hidden = (k !== panel);
    });
  }

  function updateCounter() {
    var n = els.input.value.length;
    els.count.textContent = n + ' / ' + MAX_LENGTH;
    els.count.classList.toggle('near', n >= MAX_LENGTH * 0.9 && n < MAX_LENGTH);
    els.count.classList.toggle('max', n >= MAX_LENGTH);
  }

  function setError(msg) {
    if (msg) {
      els.error.textContent = msg;
      els.error.hidden = false;
      els.input.classList.add('invalid');
      els.input.setAttribute('aria-invalid', 'true');
    } else {
      els.error.hidden = true;
      els.error.textContent = '';
      els.input.classList.remove('invalid');
      els.input.removeAttribute('aria-invalid');
    }
  }

  /* Reveal the message word by word */
  function renderMessage(msg) {
    state.message = msg;
    els.message.textContent = '';
    var words = msg.text.split(' ');
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      span.style.animationDelay = (reduceMotion ? 0 : i * 0.06) + 's';
      els.message.appendChild(span);
      if (i < words.length - 1) els.message.appendChild(document.createTextNode(' '));
    });
    els.category.textContent = msg.cat;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (state.busy) return;

    // Honeypot: silently pretend all is well if a bot filled the hidden field
    var isBot = els.honeypot.value.trim() !== '';

    var text = sanitize(els.input.value);
    var err = validate(text);
    setError(err);
    if (err) { els.input.focus(); return; }

    state.busy = true;
    els.submit.disabled = true;

    var hint = detectCategory(text);
    var msg = nextMessage(hint);
    state.category = msg.cat;

    // Optional, consent-based save. Runs in parallel with the animation.
    var wantsSave = !isBot && isSheetsConfigured() && els.consent.checked;
    var savePromise = wantsSave ? saveWish(text, msg.cat) : Promise.resolve({ status: 'skipped' });

    // The magical transformation
    launchWish();
    show('panelLoading');
    for (var i = 0; i < LOADING_LINES.length; i++) {
      els.loadingText.textContent = LOADING_LINES[i];
      await sleep(1100);
    }
    var saveResult = await savePromise;

    renderMessage(msg);
    showSaveStatus(saveResult);
    show('panelResult');
    els.message.focus({ preventScroll: true });
    burst();
    ambient.sparkle();

    // The wish itself is cleared from the page right away: nothing is kept in the browser
    els.input.value = '';
    updateCounter();

    state.busy = false;
    els.submit.disabled = false;
  }

  function showSaveStatus(r) {
    if (!r || r.status === 'skipped') { els.saveStatus.hidden = true; return; }
    els.saveStatus.hidden = false;
    if (r.status === 'saved') {
      els.saveStatus.textContent = 'Your wish was safely and privately saved to the keeper\'s notebook.';
    } else if (r.status === 'throttled') {
      els.saveStatus.textContent = 'You are wishing quickly. Your message is here, but this wish was not saved. Please wait a moment before saving another.';
    } else {
      els.saveStatus.textContent = 'Your message is here, but we couldn\'t confirm that your wish was saved, so please don\'t count on it.';
    }
  }

  function anotherMessage() {
    var msg = nextMessage(null);   // any category, never the one just shown while others remain
    // Re-run the gentle reveal
    renderMessage(msg);
    els.saveStatus.hidden = true;
    toast('');
    els.message.focus({ preventScroll: true });
    burst();
    ambient.sparkle();
  }

  function anotherWish() {
    setError('');
    toast('');
    show('panelForm');
    els.input.focus();
  }

  var toastTimer;
  function toast(msg) {
    clearTimeout(toastTimer);
    if (!msg) { els.toast.hidden = true; els.toast.textContent = ''; return; }
    els.toast.textContent = msg;
    els.toast.hidden = false;
    toastTimer = setTimeout(function () { els.toast.hidden = true; }, 3500);
  }

  /* ---------------------------------------------------------
     6. GOOGLE SHEETS (optional)
     --------------------------------------------------------- */
  function isSheetsConfigured() {
    return typeof GOOGLE_SHEETS_ENDPOINT === 'string' && /^https:\/\/script\.google(usercontent)?\.com\//.test(GOOGLE_SHEETS_ENDPOINT);
  }

  /* Returns {status: 'saved' | 'unverified' | 'throttled'}.
     'saved' is ONLY returned when the server's reply explicitly confirms it. */
  async function saveWish(text, category) {
    var lastSaved = Number(safeGet('wuaf_last_save') || 0);
    if (Date.now() - lastSaved < CLIENT_COOLDOWN_MS) return { status: 'throttled' };
    if ((Date.now() - pageLoadedAt) / 1000 < MIN_SECONDS_ON_PAGE) return { status: 'unverified' };

    var payload = {
      id: uid(),
      wish: text,
      category: category || '',
      source: SITE_SOURCE,
      key: SITE_KEY,
      sentAt: new Date().toISOString(),
      elapsed: Math.round((Date.now() - pageLoadedAt) / 1000),
      website: ''                       // honeypot field mirrored for the server
    };

    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 12000);
      // text/plain keeps this a "simple" request, so no CORS preflight (Apps Script can't answer one)
      var res = await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
        redirect: 'follow'
      });
      clearTimeout(timer);
      var data = await res.json();
      if (data && data.ok === true && data.id === payload.id) {
        safeSet('wuaf_last_save', String(Date.now()));
        return { status: 'saved' };
      }
      if (data && data.error === 'rate_limited') return { status: 'throttled' };
      return { status: 'unverified' };
    } catch (e) {
      // Network error, blocked response, timeout: we cannot verify, so we say so honestly
      return { status: 'unverified' };
    }
  }

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  /* ---------------------------------------------------------
     7. SHARE
     --------------------------------------------------------- */
  async function share() {
    if (!state.message) return;
    var text = '“' + state.message.text + '” — from Wish Upon a Feeling';
    var url = location.href.split('#')[0];
    // Only the message is shared, never the visitor's wish
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Wish Upon a Feeling', text: text, url: url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;   // user closed the share sheet
      }
    }
    var full = text + (url.indexOf('http') === 0 ? '\n' + url : '');
    try {
      await navigator.clipboard.writeText(full);
      toast('Copied. You can paste it anywhere you like.');
    } catch (e) {
      // Old-browser fallback
      var ta = document.createElement('textarea');
      ta.value = full; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
      toast(ok ? 'Copied. You can paste it anywhere you like.' : 'Sorry, copying isn\'t available here. You can select the message and copy it manually.');
    }
  }

  /* ---------------------------------------------------------
     8. UI: nav, reveal, header, quote cards
     --------------------------------------------------------- */
  function initNav() {
    var toggle = $('navToggle'), nav = $('nav'), header = document.querySelector('.site-header');
    function setOpen(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 820) setOpen(false); });

    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the current section in the nav
    if ('IntersectionObserver' in window) {
      var links = {};
      nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && links[en.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
            links[en.target.id].classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(links).forEach(function (id) { var s = $(id); if (s) io.observe(s); });
    }
  }

  function renderQuotes() {
    var wrap = $('quoteCards');
    if (!wrap) return;
    QUOTES.forEach(function (q, i) {
      var card = document.createElement('figure');
      card.className = 'quote-card glass reveal';
      card.style.setProperty('--d', (i % 3) * 0.12 + 's');
      card.style.margin = '0';
      var bq = document.createElement('blockquote'); bq.textContent = q.t;
      var cite = document.createElement('cite'); cite.textContent = q.by;
      card.appendChild(bq); card.appendChild(cite);
      wrap.appendChild(card);
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     9. PARTICLES (stars + drifting glow dust) on a canvas
     --------------------------------------------------------- */
  var particleAPI = { burst: function () {}, launch: function () {}, hearts: function () {}, trail: function () {} };
  function burst() { particleAPI.burst(); }
  function launchWish() { particleAPI.launch(); }

  function initParticles() {
    var canvas = $('stars');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, stars = [], sparks = [], petals = [], shooters = [], rockets = [];
    var running = true, raf = 0, nextShooter = Date.now() + 5000;
    var HEART_COLS = ['255,158,199', '255,120,160', '232,211,162', '255,214,230'];

    function makePetal(initial) {
      return {
        x: Math.random() * W, y: initial ? Math.random() * H : -24,
        s: Math.random() * 6 + 5, rot: Math.random() * 6.283, vr: (Math.random() - .5) * .025,
        vy: Math.random() * .35 + .16, vx: (Math.random() - .5) * .25, sw: Math.random() * 6.283,
        a: Math.random() * .22 + .12, heart: Math.random() > .62,
        c: Math.random() > .5 ? '255,158,199' : '236,170,190'
      };
    }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(130, Math.max(45, (W * H) / 14000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4 + .3,
          tw: Math.random() * Math.PI * 2, sp: Math.random() * .02 + .005,
          vy: -(Math.random() * .12 + .02), vx: (Math.random() - .5) * .05,
          warm: Math.random() > .55
        });
      }
      var pc = W < 600 ? 9 : 16;
      petals = [];
      for (var k = 0; k < pc; k++) petals.push(makePetal(true));
    }

    function heartGlyph(x, y, size, rgb, a, rot) {
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.font = size + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(' + rgb + ',' + Math.max(0, a) + ')';
      ctx.fillText('\u2665', 0, 0);
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var now = Date.now();

      stars.forEach(function (s) {
        s.tw += s.sp;
        if (!reduceMotion) { s.x += s.vx; s.y += s.vy; if (s.y < -5) { s.y = H + 5; s.x = Math.random() * W; } }
        var a = .35 + Math.sin(s.tw) * .35 + .15;
        ctx.beginPath();
        ctx.fillStyle = s.warm ? 'rgba(232,211,162,' + a + ')' : 'rgba(255,230,245,' + a + ')';
        ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fill();
      });

      // drifting rose petals and tiny hearts
      petals.forEach(function (p, i) {
        if (!reduceMotion) {
          p.sw += .012; p.rot += p.vr;
          p.y += p.vy; p.x += p.vx + Math.sin(p.sw) * .45;
          if (p.y > H + 24 || p.x < -30 || p.x > W + 30) petals[i] = makePetal(false);
        }
        if (p.heart) { heartGlyph(p.x, p.y, p.s * 1.7, p.c, p.a + .06, p.rot * .25); return; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(1, .6 + Math.abs(Math.sin(p.sw)) * .4);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283);
        ctx.fill();
        ctx.restore();
      });

      // a rare shooting star
      if (!reduceMotion && now > nextShooter) {
        shooters.push({ x: Math.random() * W * .7, y: Math.random() * H * .35, vx: 9 + Math.random() * 4, vy: 3.5 + Math.random() * 2, life: 1 });
        nextShooter = now + 9000 + Math.random() * 9000;
      }
      for (var si = shooters.length - 1; si >= 0; si--) {
        var sh = shooters[si];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= .018;
        if (sh.life <= 0) { shooters.splice(si, 1); continue; }
        var g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        g.addColorStop(0, 'rgba(255,246,217,' + sh.life + ')');
        g.addColorStop(1, 'rgba(255,158,199,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9); ctx.stroke();
      }

      // wish rockets: a glowing star that rises from the card
      for (var ri = rockets.length - 1; ri >= 0; ri--) {
        var r = rockets[ri];
        r.t += 1;
        r.y += r.vy; r.x = r.x0 + Math.sin(r.t * .07) * 26;
        sparks.push({ x: r.x, y: r.y, vx: (Math.random() - .5) * .6, vy: Math.random() * .6, r: Math.random() * 1.6 + .5, life: .9, c: pick(['255,246,217', '255,158,199', '232,211,162']), g: .004 });
        var glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 26);
        glow.addColorStop(0, 'rgba(255,246,217,.95)'); glow.addColorStop(.4, 'rgba(255,158,199,.35)'); glow.addColorStop(1, 'rgba(255,158,199,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(r.x, r.y, 26, 0, 6.283); ctx.fill();
        if (r.y < r.endY) {
          rockets.splice(ri, 1);
          for (var n = 0; n < 26; n++) {
            var ang = Math.random() * 6.283, spd = Math.random() * 2.4 + .6;
            sparks.push({ x: r.x, y: r.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: Math.random() * 1.8 + .5, life: 1, c: pick(HEART_COLS), g: .012, h: n % 3 === 0, size: 12 + Math.random() * 8 });
          }
        }
      }

      for (var i = sparks.length - 1; i >= 0; i--) {
        var p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.vy += (p.g === undefined ? .02 : p.g); p.life -= (p.decay || .014);
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        if (p.h) { heartGlyph(p.x, p.y, p.size || 14, p.c, p.life); continue; }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.life + ')';
        ctx.arc(p.x, p.y, p.r * p.life + .4, 0, 6.283);
        ctx.fill();
      }

      raf = 0;
      if (running && (!reduceMotion || sparks.length || rockets.length)) start();
    }

    function start() { if (!raf) raf = requestAnimationFrame(draw); }

    particleAPI.burst = function () {
      if (reduceMotion) return;
      var card = $('wishCard'); if (!card) return;
      var r = card.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 220);
      for (var i = 0; i < 80; i++) {
        var ang = Math.random() * 6.283, sp = Math.random() * 3.2 + .8, isHeart = i % 4 === 0;
        sparks.push({ x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, r: Math.random() * 2 + .6, life: 1, c: pick(HEART_COLS), h: isHeart, size: 12 + Math.random() * 10, g: isHeart ? -.004 : .02, decay: isHeart ? .009 : .014 });
      }
      start();
    };

    particleAPI.launch = function () {
      if (reduceMotion) return;
      var card = $('wishCard'); if (!card) return;
      var r = card.getBoundingClientRect();
      var x0 = r.left + r.width / 2;
      rockets.push({ x0: x0, x: x0, y: Math.min(r.top + r.height * .55, H - 40), vy: -4.2, t: 0, endY: Math.max(70, r.top - 120) });
      start();
    };

    particleAPI.hearts = function (x, y, n) {
      if (reduceMotion) return;
      for (var i = 0; i < n; i++) {
        sparks.push({ x: x, y: y, vx: (Math.random() - .5) * 1.6, vy: -(Math.random() * 1.4 + .6), r: 1, life: 1, c: pick(HEART_COLS), h: true, size: 11 + Math.random() * 10, g: -.002, decay: .011 });
      }
      start();
    };

    particleAPI.trail = function (x, y) {
      if (reduceMotion) return;
      sparks.push({ x: x + (Math.random() - .5) * 6, y: y + (Math.random() - .5) * 6, vx: (Math.random() - .5) * .4, vy: Math.random() * .3, r: Math.random() * 1.4 + .6, life: .7, c: pick(['255,246,217', '255,158,199', '232,211,162']), g: .005, decay: .02 });
      start();
    };

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) start();
    });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(resize, 150); });
    resize();
    start();
  }

  /* Pointer magic: a soft sparkle trail (mouse only) and little hearts where you tap */
  function initPointerMagic() {
    if (reduceMotion) return;
    var last = 0;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var n = Date.now(); if (n - last < 40) return; last = n;
      particleAPI.trail(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('textarea, input, button, a, label, .starters')) return;
      particleAPI.hearts(e.clientX, e.clientY, 5);
    });
  }

  /* ---------------------------------------------------------
     MOON: tonight's moon phase, computed privately in the browser
     --------------------------------------------------------- */
  function initMoon() {
    var el = $('moonChip');
    if (!el) return;
    var SYNODIC = 29.530588853;
    var ref = Date.UTC(2000, 0, 6, 18, 14);
    var age = (((Date.now() - ref) / 86400000) % SYNODIC + SYNODIC) % SYNODIC;
    var phases = [
      { max: 1.85,  icon: '\uD83C\uDF11', name: 'New moon',        line: 'a night for quiet beginnings' },
      { max: 5.54,  icon: '\uD83C\uDF12', name: 'Waxing crescent', line: 'a night for planting wishes' },
      { max: 9.22,  icon: '\uD83C\uDF13', name: 'First quarter',   line: 'a night for brave little steps' },
      { max: 12.91, icon: '\uD83C\uDF14', name: 'Waxing gibbous',  line: 'a night for trusting what is coming' },
      { max: 16.61, icon: '\uD83C\uDF15', name: 'Full moon',       line: 'the brightest night to be heard' },
      { max: 20.30, icon: '\uD83C\uDF16', name: 'Waning gibbous',  line: 'a night for gratitude and soft goodbyes' },
      { max: 23.99, icon: '\uD83C\uDF17', name: 'Last quarter',    line: 'a night for letting go, gently' },
      { max: 27.68, icon: '\uD83C\uDF18', name: 'Waning crescent', line: 'a night for rest and tenderness' },
      { max: 99,    icon: '\uD83C\uDF11', name: 'New moon',        line: 'a night for quiet beginnings' }
    ];
    var ph = phases[phases.length - 1];
    for (var i = 0; i < phases.length; i++) { if (age < phases[i].max) { ph = phases[i]; break; } }
    el.textContent = '';
    var ic = document.createElement('span'); ic.className = 'moon-icon'; ic.setAttribute('aria-hidden', 'true'); ic.textContent = ph.icon;
    var tx = document.createElement('span'); tx.textContent = 'Tonight: ' + ph.name.toLowerCase() + ', ' + ph.line;
    el.appendChild(ic); el.appendChild(tx);
  }

  /* ---------------------------------------------------------
     WISH STARTERS and rotating placeholders
     --------------------------------------------------------- */
  function initStarters() {
    var wrap = $('starters');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-text]') : null;
      if (!b) return;
      var txt = b.getAttribute('data-text');
      var cur = els.input.value.trim();
      els.input.value = cur ? (cur + ' ' + txt) : txt;
      els.input.focus();
      var n = els.input.value.length;
      els.input.setSelectionRange(n, n);
      updateCounter();
      setError('');
    });
  }

  var PLACEHOLDERS = [
    'Write the wish your heart has been holding onto...',
    'Tell the moon what you have not told anyone...',
    'Is there a name you keep wishing on?',
    'What would make your heart feel at home?',
    'Whisper it here. The night will not repeat it...'
  ];
  function initPlaceholders() {
    var i = 0;
    setInterval(function () {
      if (document.activeElement === els.input || els.input.value) return;
      i = (i + 1) % PLACEHOLDERS.length;
      els.input.placeholder = PLACEHOLDERS[i];
    }, 5200);
  }

  /* ---------------------------------------------------------
     POSTCARD: draws the message (never the wish) onto a keepsake image
     --------------------------------------------------------- */
  function wrapLines(g, text, maxW) {
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else { line = test; }
    });
    if (line) lines.push(line);
    return lines;
  }

  async function savePostcard() {
    if (!state.message) return;
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load('italic 500 54px "Cormorant Garamond"'),
          document.fonts.load('400 64px "Great Vibes"')
        ]);
      }
    } catch (e) { /* fonts optional */ }

    var W = 1080, H = 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    var SERIF = '"Cormorant Garamond","Iowan Old Style","Palatino Linotype",Georgia,serif';
    var SCRIPT = '"Great Vibes","Snell Roundhand","Brush Script MT",cursive';

    var bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#170b2c'); bg.addColorStop(.55, '#2a1240'); bg.addColorStop(1, '#3b1a55');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    var glow = g.createRadialGradient(W / 2, H * .42, 40, W / 2, H * .42, 700);
    glow.addColorStop(0, 'rgba(255,158,199,.22)'); glow.addColorStop(1, 'rgba(255,158,199,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);

    for (var i = 0; i < 110; i++) {
      g.beginPath();
      g.fillStyle = 'rgba(' + (Math.random() > .5 ? '232,211,162' : '255,230,245') + ',' + (Math.random() * .6 + .15) + ')';
      g.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8 + .3, 0, 6.283); g.fill();
    }

    g.strokeStyle = 'rgba(232,211,162,.65)'; g.lineWidth = 2;
    g.strokeRect(52, 52, W - 104, H - 104);
    g.strokeStyle = 'rgba(232,211,162,.25)'; g.lineWidth = 1;
    g.strokeRect(70, 70, W - 140, H - 140);

    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ff9ec7'; g.font = '84px serif'; g.fillText('\u2665', W / 2, 200);
    g.fillStyle = 'rgba(217,163,180,1)'; g.font = '500 28px ' + SERIF;
    if ('letterSpacing' in g) g.letterSpacing = '6px';
    g.fillText('A LITTLE MESSAGE FOR YOU', W / 2, 290);
    if ('letterSpacing' in g) g.letterSpacing = '0px';

    var size = 58, lines;
    do {
      g.font = 'italic 500 ' + size + 'px ' + SERIF;
      lines = wrapLines(g, state.message.text, 790);
      size -= 2;
    } while (lines.length > 9 && size > 36);
    var lh = (size + 2) * 1.42;
    var blockH = lines.length * lh;
    var y0 = 700 - blockH / 2 + lh / 2;
    g.fillStyle = '#f6eef8';
    lines.forEach(function (ln, k) { g.fillText(ln, W / 2, y0 + k * lh); });

    g.fillStyle = 'rgba(217,163,180,1)'; g.font = '500 24px ' + SERIF;
    if ('letterSpacing' in g) g.letterSpacing = '5px';
    g.fillText(state.message.cat.toUpperCase(), W / 2, y0 + blockH + 30);
    if ('letterSpacing' in g) g.letterSpacing = '0px';

    g.fillStyle = '#e8d3a2'; g.font = '400 78px ' + SCRIPT;
    g.fillText('with love, the stars', W / 2, H - 230);
    g.fillStyle = 'rgba(246,238,248,.55)'; g.font = '500 26px ' + SERIF;
    g.fillText('\u2727  Wish Upon a Feeling  \u2727', W / 2, H - 140);

    var done = function (url, revoke) {
      var a = document.createElement('a');
      a.href = url; a.download = 'a-little-message-for-you.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      if (revoke) setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast('Your postcard is saved. Keep it close.');
    };
    if (c.toBlob) c.toBlob(function (b) { if (b) done(URL.createObjectURL(b), true); }, 'image/png');
    else done(c.toDataURL('image/png'), false);
  }

  /* ---------------------------------------------------------
     10. AMBIENT SOUND: generated with the Web Audio API.
     Warm pad + soft music-box chimes. OFF by default. Never starts without a click/tap.
     --------------------------------------------------------- */
  var ambient = (function () {
    var ctx = null, master = null, nodes = [], on = false, chimeTimer = null;
    // A soft, open chord (A minor add9-ish) played as slow-breathing sine pads
    var FREQS = [110, 164.81, 220, 261.63, 329.63, 493.88];
    // Pentatonic bell notes for the music box
    var SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];

    function build() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 2600;
      master.connect(filter); filter.connect(ctx.destination);

      FREQS.forEach(function (f, i) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = (Math.random() - .5) * 8;
        var g = ctx.createGain();
        g.gain.value = 0.05 / (1 + i * .25);
        // slow breathing via an LFO on each voice's gain
        var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
        lfo.frequency.value = 0.05 + Math.random() * 0.09;
        lfoGain.gain.value = g.gain.value * 0.6;
        lfo.connect(lfoGain); lfoGain.connect(g.gain);
        osc.connect(g); g.connect(master);
        osc.start(); lfo.start();
        nodes.push(osc, lfo);
      });
      return true;
    }

    function note(freq, delay, vol, len) {
      if (!ctx || !master) return;
      var t = ctx.currentTime + (delay || 0);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || .08, t + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t + (len || 2.4));
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + (len || 2.4) + .1);
    }

    function chime() {
      if (!on) return;
      note(SCALE[Math.floor(Math.random() * SCALE.length)], 0, .07, 2.8);
      chimeTimer = setTimeout(chime, 2200 + Math.random() * 4200);
    }

    return {
      toggle: async function () {
        if (!ctx && !build()) return null;
        if (!on) {
          if (ctx.state === 'suspended') await ctx.resume();
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);
          on = true;
          chimeTimer = setTimeout(chime, 1500);
        } else {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
          on = false;
          clearTimeout(chimeTimer);
          setTimeout(function () { if (!on && ctx && ctx.state === 'running') ctx.suspend(); }, 1400);
        }
        return on;
      },
      // a little rising phrase when a message arrives (only if the person turned sound on)
      sparkle: function () {
        if (!on) return;
        note(659.25, 0, .08, 2.2); note(783.99, .18, .08, 2.4); note(987.77, .36, .07, 2.8); note(1318.5, .56, .05, 3);
      }
    };
  })();

  function initSound() {
    var btn = $('soundToggle');
    if (!btn) return;
    var supported = !!(window.AudioContext || window.webkitAudioContext);
    if (!supported) { btn.hidden = true; return; }
    btn.addEventListener('click', async function () {
      var isOn = await ambient.toggle();
      if (isOn === null) return;
      btn.setAttribute('aria-pressed', String(isOn));
      btn.setAttribute('aria-label', isOn ? 'Turn ambient sound off' : 'Turn ambient sound on');
      btn.title = isOn ? 'Ambient sound (on)' : 'Ambient sound (off)';
    });
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  function init() {
    ensureWatermark();

    els = {
      form: $('wishForm'), input: $('wishInput'), count: $('wishCount'), error: $('wishError'),
      honeypot: $('website'), consentRow: $('consentRow'), consent: $('consent'), submit: $('submitBtn'),
      panelForm: $('wishForm'), panelLoading: $('panelLoading'), panelResult: $('panelResult'),
      loadingText: $('loadingText'), message: $('messageText'), category: $('messageCategory'),
      saveStatus: $('saveStatus'), toast: $('toast')
    };

    renderQuotes();
    initMoon();
    initNav();
    initReveal();
    initParticles();
    initSound();
    initPointerMagic();

    if (!els.form) return;    // other pages that only carry the watermark stop here

    // The consent checkbox only appears when Google Sheets is actually configured
    els.consentRow.hidden = !isSheetsConfigured();

    els.input.addEventListener('input', function () { updateCounter(); if (!els.error.hidden) setError(''); });
    els.input.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') els.form.requestSubmit();
    });
    els.form.addEventListener('submit', onSubmit);
    $('anotherMessage').addEventListener('click', anotherMessage);
    $('anotherWish').addEventListener('click', anotherWish);
    $('shareBtn').addEventListener('click', share);
    if ($('postcardBtn')) $('postcardBtn').addEventListener('click', savePostcard);
    initStarters();
    initPlaceholders();
    updateCounter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
