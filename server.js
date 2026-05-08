const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY_BYTES = 10 * 1024;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/report-demo') {
    return handleReportDemo(req, res);
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res);
  }

  sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
});

// ─────────────────────────────────────────────
//  Safe training endpoint
// ─────────────────────────────────────────────
// This endpoint is intentionally designed not to collect, print, store, or
// forward passwords. It models what defenders should look for while keeping
// the exercise safe for a controlled classroom or awareness session.
async function handleReportDemo(req, res) {
  let body;

  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { ok: false, message: error.message });
  }

  const { email = '' } = body || {};
  const submittedAt = new Date().toISOString();
  const ipAddress = req.socket.remoteAddress || 'unknown';

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

  sendJson(res, 200, {
    ok: true,
    message: 'Demo submitted safely. No password was collected or stored.',
  });
}

// ─────────────────────────────────────────────
//  Static file serving
// ─────────────────────────────────────────────
function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const normalizedPath = path.normalize(requestPath).replace(/^([/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalizedPath || 'index.html');

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendText(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      return sendText(res, 404, 'Not found');
    }

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    if (req.method === 'HEAD') {
      res.end();
      stream.destroy();
      return;
    }
    stream.pipe(res);
  });
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  }[extension] || 'application/octet-stream';
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;
      if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
        const error = new Error('Request body too large.');
        error.statusCode = 413;
        reject(error);
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        const error = new Error('Invalid JSON body.');
        error.statusCode = 400;
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

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
server.listen(PORT, () => {
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
