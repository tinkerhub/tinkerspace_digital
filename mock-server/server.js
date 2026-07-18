const http = require('http');
const { URL } = require('url');
const { getMockMakers, getMockCalendarDisplay } = require('./data');

const PORT = Number(process.env.MOCK_SERVER_PORT || 4010);
const API_KEY = process.env.MOCK_SPACECALENDAR_API_KEY || 'tinkerspace-local-dev';

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function writeText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    writeText(res, 400, 'Missing request URL');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/health') {
    writeJson(res, 200, {
      ok: true,
      service: 'tinkerspace-digital-mock-server',
      port: PORT,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/checkin/active') {
    writeJson(res, 200, getMockMakers());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/display') {
    if (req.headers['x-api-key'] !== API_KEY) {
      writeJson(res, 401, {
        success: false,
        error: 'Invalid X-API-Key for mock SpaceCalendar endpoint',
      });
      return;
    }

    writeJson(res, 200, {
      success: true,
      data: getMockCalendarDisplay(new Date()),
    });
    return;
  }

  writeJson(res, 404, {
    success: false,
    error: `No mock route for ${req.method} ${url.pathname}`,
  });
});

server.listen(PORT, () => {
  console.log(`[mock-server] listening on http://localhost:${PORT}`);
  console.log('[mock-server] routes: GET /health, GET /checkin/active, GET /api/v1/display');
});

function shutdown(signal) {
  console.log(`[mock-server] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
