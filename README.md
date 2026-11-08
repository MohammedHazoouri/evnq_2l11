# Wish Upon a Feeling ✧

A romantic, atmospheric little website where visitors write a wish, release it to the stars, and receive a gentle message in return.

Built with plain **HTML, CSS and vanilla JavaScript**. No frameworks, no build step, no dependencies.

```
wish-upon-a-feeling/
├── index.html              the page
├── styles.css              all styling
├── script.js               behaviour, messages, config
├── google-apps-script.gs   optional Google Sheets backend
├── README.md               this file
└── assets/
    ├── logo.jpg            your EvnQ logo (used by the floating Instagram circle)
    ├── logo-full.jpg       the full, uncropped logo
    └── favicon.png         browser tab icon
```

---

## 1. Run it locally

**Easiest:** double-click `index.html`. It works straight from your computer.

**Or with a local server** (closer to real hosting):

```bash
cd wish-upon-a-feeling
python3 -m http.server 8000
# then open http://localhost:8000
```

The site works fully without Google Sheets. Fonts (Cormorant Garamond and Inter) load from Google Fonts when online; offline, elegant system serif and sans fonts are used instead.

---

## 2. Publish it online

Because it's just static files, any static host works. Upload the **whole folder contents** (keep `assets/` next to `index.html`).

- **Netlify Drop:** go to app.netlify.com/drop and drag the folder in. Done in seconds.
- **GitHub Pages:** push the files to a repo, then Settings → Pages → deploy from the `main` branch.
- **Cloudflare Pages / Vercel / any web hosting:** upload the files; no build command needed.

Note: the Web Share button needs HTTPS (all of the hosts above provide it). Without it, the site falls back to copying the message.

---

## 3. Connect Google Sheets (optional)

Without this, wishes are **not saved anywhere**. They stay in the visitor's browser tab and disappear. Saving is optional and **consent-based**: once you connect a sheet, visitors see an unticked box, "Privately save my wish", and a wish is only sent if they tick it.

### Step by step

1. **Create a Google Sheet** (sheets.new). Name it anything, e.g. "Wishes".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code and **paste the entire contents of `google-apps-script.gs`**. Save.
4. (Recommended) Run the function **`testSetup`** once: choose it in the toolbar, click Run, and approve the permissions. A tab named `Wishes` with headers appears.
5. Click **Deploy → New deployment → ⚙ Select type → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy** and copy the **Web app URL** (ends with `/exec`).
7. Open `script.js` and paste it into the one configuration variable near the top:

   ```js
   var GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   ```

8. Re-upload/refresh the site. The consent checkbox now appears under the wish box.

**Whenever you edit the Apps Script later**, use Deploy → *Manage deployments* → edit (pencil) → *New version* → Deploy. The URL stays the same.

### What gets saved

| Column | Content |
|---|---|
| Timestamp | when it was received |
| Submission ID | random unique ID |
| Wish | the wish text (max 500 characters) |
| Category | the type of message shown (e.g. "Hope & Dreams") |
| Source | `wish-upon-a-feeling` |

### Protection against abuse

- Server-side validation of length, format, and source; links are rejected.
- Hidden **honeypot** field and a minimum time-on-page check.
- **Rate limits:** 20 saves per minute and 500 per day across the site (adjustable at the top of the `.gs` file), plus a client-side cooldown.
- **De-duplication** of identical wishes within 10 minutes.
- **Formula-injection protection:** text starting with `=`, `+`, `-` or `@` is neutralized before it reaches the sheet.
- Optional `SITE_KEY` (set the same value in `script.js` and the `.gs`). This is a light filter, **not a secret**, since anyone can read page source. No real credentials are ever in the frontend.

### Honest status messages

After a wish is sent, the visitor is told it was saved **only if** your script replies with an explicit confirmation matching their submission ID. If the response can't be verified (network error, misconfiguration), the site says it couldn't confirm the save instead of claiming success. The message itself is always shown either way.

### Privacy reminder

Wishes can be deeply personal. Keep the sheet private, share it with nobody who doesn't need it, and consider deleting old entries regularly. The site already includes a privacy note; adapt it to your local legal requirements if needed.

---

## 4. Replace the watermark logo

The floating circle at the bottom-right (on every page, always visible, linking to Instagram) uses your **EvnQ logo** at `assets/logo.jpg`.

To change it: replace `assets/logo.jpg` with your own image, **square and at least 256×256 px** (JPG or PNG; if you use PNG, also update `LOGO_PATH` in `script.js` and the `src` in `index.html`). The CSS crops it into a circle automatically.

If the file is ever missing, a clearly marked dashed "LOGO" circle appears in its place so you notice immediately.

**Instagram link:** it's set in `index.html` (the `.evnq-watermark` link) and in `INSTAGRAM_URL` in `script.js`, with `target="_blank"` and `rel="noopener noreferrer"`.

**Adding new pages:** copy the same two lines into the new page and the watermark appears automatically, even without copying its HTML:

```html
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
```

(`script.js` injects the circle if it isn't already present.)

---

## 5. Customize the messages

Open `script.js` and find the `MESSAGES` object (section 1). It holds **40 messages in 10 categories**:

```js
var MESSAGES = {
  'Romantic': [ 'Your message here...', '...' ],
  'On Love':  [ ... ],
  ...
};
```

- Add a line to any category by adding a string to its array (don't forget the comma).
- Add a new category by adding a new key with its own array.
- `CATEGORY_HINTS` links keywords in a wish (e.g. "miss", "dream") to a category, so messages can feel more personal. The matching happens privately in the browser; nothing is sent anywhere.
- Quote cards in "A Little Inspiration" come from the `QUOTES` array just below.

---

## Features at a glance

- Animated aurora background with drifting stars, with a sparkle burst on reveal
- Wish card with live 500-character counter and friendly validation
- Magical loading sequence, then a word-by-word message reveal (never repeats until the pool is used up)
- **Give Me Another Message / Make Another Wish / Share This Moment** (Web Share API with copy fallback; only the message is shared, never the wish)
- Ambient sound toggle built with the Web Audio API: **off by default, never autoplays**
- Fully responsive, keyboard accessible, `prefers-reduced-motion` respected

## Browser support

Current versions of Chrome, Edge, Firefox, Safari (desktop and mobile).

## 6. The romantic layer (what's new)

- **Tonight's moon:** a small chip under the heart shows the real moon phase, calculated privately in the browser.
- **Wish starters:** tappable chips ("to be loved gently", "a love that stays"...) that begin the wish for shy hearts. Placeholders also rotate softly.
- **Release animation:** after pressing the button, the wish rises from the card as a glowing star and bursts into hearts.
- **Letter from the stars:** the answer arrives sealed with a wax heart and signed "with love, the stars".
- **Keep It as a Postcard:** downloads the message (never the wish) as a 1080x1350 image.
- **Atmosphere:** drifting rose petals and tiny hearts, rare shooting stars, a sparkle trail on desktop, hearts where you tap.
- **Music box:** when the visitor turns sound on, soft chimes drift over the pad, and a little phrase plays when a message arrives. Still off by default.
- **Heart constellation** that draws itself at the end of the page.
- **More messages:** 3 new categories (Soulmates & Fate, Late-Night Longing, Tender Words) plus extra lines in the love categories.

Nothing in the Google Sheets flow was changed: `GOOGLE_SHEETS_ENDPOINT`, `SITE_KEY`, the consent checkbox, `saveWish()` and `google-apps-script.gs` are exactly as before. If you already have your live URL, paste it into `GOOGLE_SHEETS_ENDPOINT` at the top of `script.js` (it is empty in the zip you sent).

## 6. The romantic layer (what's new)

- **Tonight's moon:** a small chip under the heart shows the real moon phase, calculated privately in the browser.
- **Wish starters:** tappable chips ("to be loved gently", "a love that stays"...) that begin the wish for shy hearts. Placeholders also rotate softly.
- **Release animation:** after pressing the button, the wish rises from the card as a glowing star and bursts into hearts.
- **Letter from the stars:** the answer arrives sealed with a wax heart and signed "with love, the stars".
- **Keep It as a Postcard:** downloads the message (never the wish) as a 1080x1350 image.
- **Atmosphere:** drifting rose petals and tiny hearts, rare shooting stars, a sparkle trail on desktop, hearts where you tap.
- **Music box:** when the visitor turns sound on, soft chimes drift over the pad, and a little phrase plays when a message arrives. Still off by default.
- **Heart constellation** that draws itself at the end of the page.
- **More messages:** 3 new categories (Soulmates & Fate, Late-Night Longing, Tender Words) plus extra lines in the love categories.

Nothing in the Google Sheets flow was changed: `GOOGLE_SHEETS_ENDPOINT`, `SITE_KEY`, the consent checkbox, `saveWish()` and `google-apps-script.gs` are exactly as before. If you already have your live URL, paste it into `GOOGLE_SHEETS_ENDPOINT` at the top of `script.js` (it is empty in the zip you sent).

---

*Messages are gentle companions, not promises.*
