/**
 * WISH UPON A FEELING — google-apps-script.gs
 * ------------------------------------------------------------------
 * Receives optional, consent-based wish submissions from the website
 * and appends them to a Google Sheet.
 *
 * SETUP (full version in README.md):
 *   1. Create a Google Sheet. Copy its ID from the URL:
 *        https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
 *   2. In the sheet: Extensions -> Apps Script. Paste this whole file.
 *   3. Put the ID into SPREADSHEET_ID below (or leave '' if the script is
 *      bound to the sheet via step 2, which is the easiest way).
 *   4. Deploy -> New deployment -> type "Web app"
 *        Execute as: Me
 *        Who has access: Anyone
 *   5. Copy the Web App URL (ends in /exec) into GOOGLE_SHEETS_ENDPOINT in script.js.
 *
 * SECURITY NOTES
 *   - No secrets live in the website. Access to your sheet is limited to this script,
 *     which runs as YOU, server-side.
 *   - SITE_KEY is a light filter against random junk, NOT a password: anyone who views
 *     the site's source can read it. The real protections are validation, the honeypot,
 *     the rate limit and de-duplication below.
 */

// ---------- CONFIG ----------
var SPREADSHEET_ID = '';            // '' = use the spreadsheet this script is attached to
var SHEET_NAME     = 'Wishes';
var SITE_KEY       = '';            // optional; must equal SITE_KEY in script.js if you set it
var ALLOWED_SOURCE = 'wish-upon-a-feeling';

var MAX_WISH_LENGTH   = 500;
var MIN_WISH_LENGTH   = 3;
var MIN_SECONDS       = 3;          // reject submissions faster than a human could write
var MAX_PER_MINUTE    = 20;         // global cap across all visitors (Apps Script can't see IPs)
var MAX_PER_DAY       = 500;        // global daily cap, protects your sheet and quota
var DEDUPE_SECONDS    = 600;        // identical wish text within this window is ignored

var HEADERS = ['Timestamp', 'Submission ID', 'Wish', 'Category', 'Source'];

// ---------- ENTRY POINTS ----------

/** POST: the website sends JSON as text/plain (avoids CORS preflight). */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ ok: false, error: 'empty' });
    if (e.postData.contents.length > 4000) return json_({ ok: false, error: 'too_large' });

    var data;
    try { data = JSON.parse(e.postData.contents); }
    catch (err) { return json_({ ok: false, error: 'bad_json' }); }

    // --- Validation ---
    if (data.website) return json_({ ok: false, error: 'rejected' });                     // honeypot
    if (SITE_KEY && data.key !== SITE_KEY) return json_({ ok: false, error: 'forbidden' });
    if (data.source !== ALLOWED_SOURCE) return json_({ ok: false, error: 'bad_source' });
    if (typeof data.id !== 'string' || !/^[A-Za-z0-9\-_]{8,64}$/.test(data.id)) return json_({ ok: false, error: 'bad_id' });
    if (typeof data.wish !== 'string') return json_({ ok: false, error: 'bad_wish' });
    if (Number(data.elapsed) < MIN_SECONDS) return json_({ ok: false, error: 'too_fast' });

    var wish = clean_(data.wish);
    if (wish.length < MIN_WISH_LENGTH || wish.length > MAX_WISH_LENGTH) return json_({ ok: false, error: 'bad_length' });
    if (/https?:\/\/|www\./i.test(wish)) return json_({ ok: false, error: 'links_not_allowed' });

    var category = clean_(String(data.category || '')).slice(0, 60);

    // --- Rate limiting + de-duplication (CacheService) ---
    var cache = CacheService.getScriptCache();
    var minuteKey = 'm_' + Math.floor(Date.now() / 60000);
    var minuteCount = Number(cache.get(minuteKey) || 0);
    if (minuteCount >= MAX_PER_MINUTE) return json_({ ok: false, error: 'rate_limited' });

    var props = PropertiesService.getScriptProperties();
    var today = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
    var dayKey = 'day_' + today;
    var dayCount = Number(props.getProperty(dayKey) || 0);
    if (dayCount >= MAX_PER_DAY) return json_({ ok: false, error: 'rate_limited' });

    var digest = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, wish.toLowerCase()));
    var dupKey = 'd_' + digest.slice(0, 40);
    if (cache.get(dupKey)) {
      // Treat as success without writing again, so a double-tap doesn't create two rows
      return json_({ ok: true, id: data.id, duplicate: true });
    }

    // --- Save ---
    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),                 // Timestamp (the sheet's own timezone applies when displayed)
      data.id,
      neutralize_(wish),          // stops =FORMULA() injection
      neutralize_(category),
      data.source
    ]);

    cache.put(minuteKey, String(minuteCount + 1), 120);
    cache.put(dupKey, '1', DEDUPE_SECONDS);
    props.setProperty(dayKey, String(dayCount + 1));
    cleanupOldDayKeys_(props, dayKey);

    // The website only tells the visitor "saved" if it gets this exact reply back
    return json_({ ok: true, id: data.id });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

/** GET: simple health check you can open in a browser. Reveals nothing about stored wishes. */
function doGet() {
  return json_({ ok: true, service: 'wish-upon-a-feeling', status: 'ready' });
}

// ---------- HELPERS ----------

function getSheet_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** Strip control characters and trim. */
function clean_(s) {
  return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

/** Prevent spreadsheet formula injection: a leading = + - @ would be executed as a formula. */
function neutralize_(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function cleanupOldDayKeys_(props, currentKey) {
  var all = props.getKeys();
  for (var i = 0; i < all.length; i++) {
    if (all[i].indexOf('day_') === 0 && all[i] !== currentKey) props.deleteProperty(all[i]);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to test that the sheet is writable (no website needed). */
function testSetup() {
  var sheet = getSheet_();
  Logger.log('Sheet ready: ' + sheet.getName() + ' (' + sheet.getLastRow() + ' rows)');
}
