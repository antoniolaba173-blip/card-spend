/**
 * Card Spend Log — Google Apps Script backend.
 * Paste this into Extensions > Apps Script of your Google Sheet, set TOKEN, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const TOKEN = 'CHANGE-ME-TO-A-SECRET';   // the same PIN you type in the app
const SHEET = 'Spending';
const HEADERS = ['id', 'logged_at', 'date', 'who', 'amount_aed', 'category', 'merchant', 'card', 'note'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('E:E').setNumberFormat('#,##0.00');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rows_() {
  const values = sheet_().getDataRange().getValues();
  values.shift();
  return values.filter(r => r[0]).map(r => ({
    id: String(r[0]),
    logged_at: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
    date: r[2] instanceof Date ? Utilities.formatDate(r[2], 'Asia/Dubai', 'yyyy-MM-dd') : String(r[2]),
    who: r[3], amount: Number(r[4]), category: r[5], merchant: r[6], card: r[7], note: r[8]
  }));
}

function doGet(e) {
  if ((e.parameter.token || '') !== TOKEN) return json_({ ok: false, error: 'Wrong PIN' });
  const month = e.parameter.month || '';            // 'yyyy-MM', or empty for everything
  const list = rows_().filter(r => !month || r.date.slice(0, 7) === month);
  return json_({ ok: true, rows: list });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  if ((body.token || '') !== TOKEN) return json_({ ok: false, error: 'Wrong PIN' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    if (body.action === 'delete') {
      const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0]));
      const i = ids.indexOf(String(body.id));
      if (i >= 0) sh.deleteRow(i + 2);
      return json_({ ok: true, deleted: i >= 0 });
    }
    const items = Array.isArray(body.items) ? body.items : [body.item];
    const existing = new Set(sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0])));
    let added = 0;
    items.forEach(it => {
      if (!it || !it.id || existing.has(String(it.id))) return;   // ignore duplicates from offline retries
      const amt = Number(it.amount);
      if (!(amt > 0)) return;
      sh.appendRow([String(it.id), new Date(), it.date, it.who, amt, it.category || 'Other', it.merchant || '', it.card || '', it.note || '']);
      existing.add(String(it.id)); added++;
    });
    return json_({ ok: true, added: added });
  } finally {
    lock.releaseLock();
  }
}
