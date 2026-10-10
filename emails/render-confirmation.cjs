// Server-side renderer only. This module prepares content; it does not send mail.
const fs = require('node:fs');
const path = require('node:path');
const subject = 'You’re on the BOXZY list!';
function renderConfirmation({ unsubscribeUrl }) {
  let url;
  try { url = new URL(unsubscribeUrl); } catch { throw new Error('A valid unsubscribe URL is required'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Unsubscribe URL must use HTTPS without credentials');
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = ext => fs.readFileSync(path.join(__dirname, `signup-confirmation.${ext}`), 'utf8');
  return { subject, html: read('html').replace('{{unsubscribe_url}}', escape(url.href)), text: read('txt').replace('{{unsubscribe_url}}', url.href) };
}
module.exports = { renderConfirmation };
