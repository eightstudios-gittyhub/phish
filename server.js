const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  Safe training endpoint
// ─────────────────────────────────────────────
// This endpoint is intentionally designed not to collect, print, store, or
// forward passwords. It models what defenders should look for while keeping
// the exercise safe for a controlled classroom or awareness session.
app.post('/report-demo', (req, res) => {
  const { email = '' } = req.body || {};
  const submittedAt = new Date().toISOString();
  const ipAddress = req.ip || 'unknown';

  console.log('\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      🎓 PHISHING AWARENESS EVENT        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  📧 Identifier: ${padRight(maskIdentifier(email), 25)}║`);
  console.log('║  🔐 Password  : [discarded by design]   ║');
  console.log(`║  🕐 Time      : ${padRight(submittedAt, 25)}║`);
  console.log(`║  🌐 IP        : ${padRight(ipAddress, 25)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('\n✅ Safe lab behavior: no credentials were captured or stored.\n');

  res.status(200).json({
    ok: true,
    message: 'Demo submitted safely. No password was collected or stored.',
  });
});

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function padRight(value, length) {
  const text = String(value);
  return text.length >= length ? text.substring(0, length) : text + ' '.repeat(length - text.length);
}

function maskIdentifier(value) {
  const text = String(value || '').trim();
  if (!text) {
    return 'not provided';
  }

  const [localPart, domain] = text.split('@');
  if (!domain) {
    return localPart.length <= 2 ? '*'.repeat(localPart.length) : `${localPart[0]}***${localPart.at(-1)}`;
  }

  const maskedLocal = localPart.length <= 2 ? `${localPart[0] || '*'}***` : `${localPart[0]}***${localPart.at(-1)}`;
  return `${maskedLocal}@${domain}`;
}

// ─────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🎓 PHISHING LAB — DEFENDER MODULE     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  ✅ Server running on:                  ║');
  console.log(`║     http://localhost:${PORT}${' '.repeat(Math.max(0, 22 - String(PORT).length))}║`);
  console.log('║                                          ║');
  console.log('║  🛡️  Safe mode: passwords discarded     ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n📌 Open http://localhost:${PORT} in your browser\n`);
});
