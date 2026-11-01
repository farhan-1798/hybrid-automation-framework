const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const REPORT_DIR = path.resolve(__dirname, '../allure-report');
const RESULTS_DIR = path.resolve(__dirname, '../allure-results');
const DEFAULT_PORT = 5050;

/**
 * Clean environment variables that cause GLIBC / pthread conflicts
 * when running inside snap environments (e.g. VS Code Snap on Ubuntu).
 */
function getCleanEnv() {
  const cleanEnv = { ...process.env };
  delete cleanEnv.LD_LIBRARY_PATH;
  delete cleanEnv.LD_PRELOAD;
  return cleanEnv;
}

// 1. Generate Allure Report if results exist
function generateReport() {
  if (fs.existsSync(RESULTS_DIR)) {
    console.log('[INFO] Generating fresh Allure HTML report from allure-results...');
    const result = spawnSync('npx', ['allure', 'generate', RESULTS_DIR, '--clean', '-o', REPORT_DIR], {
      env: getCleanEnv(),
      stdio: 'inherit',
      shell: true,
    });

    if (result.status !== 0) {
      console.warn('[WARNING] Allure generate command exited with status code:', result.status);
    }
  } else if (!fs.existsSync(REPORT_DIR)) {
    console.log('[WARN] No allure-results or allure-report found. Run a test first (e.g., "npm run web").');
    process.exit(0);
  }
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// 2. Open default browser cross-platform without snap glibc leakage
function openBrowser(url) {
  const cleanEnv = getCleanEnv();
  const platform = process.platform;

  console.log(`[INFO] Launching default browser to: ${url}`);

  try {
    if (platform === 'linux') {
      spawn('xdg-open', [url], { env: cleanEnv, detached: true, stdio: 'ignore' }).unref();
    } else if (platform === 'darwin') {
      spawn('open', [url], { env: cleanEnv, detached: true, stdio: 'ignore' }).unref();
    } else if (platform === 'win32') {
      spawn('cmd.exe', ['/c', 'start', '""', url], { env: cleanEnv, detached: true, stdio: 'ignore' }).unref();
    }
  } catch (err) {
    console.warn('[WARNING] Could not auto-launch browser. Please navigate manually to:', url);
  }
}

// 3. Serve report via lightweight Node HTTP server
function serveReport(port = DEFAULT_PORT) {
  if (!fs.existsSync(REPORT_DIR)) {
    console.error(`[ERROR] Report directory does not exist at: ${REPORT_DIR}`);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const filePath = path.join(REPORT_DIR, reqPath);

    // Prevent directory traversal
    if (!filePath.startsWith(REPORT_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });

      fs.createReadStream(filePath).pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[INFO] Port ${port} is occupied, trying port ${port + 1}...`);
      serveReport(port + 1);
    } else {
      console.error('[ERROR] Server error:', err);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`;
    console.log('\n==================================================');
    console.log(`📊 Allure Report is Live!`);
    console.log(`🌐 URL: ${url}`);
    console.log(`⌨️  Press Ctrl+C in terminal when done`);
    console.log('==================================================\n');

    openBrowser(url);
  });
}

// Execute
generateReport();
serveReport();
