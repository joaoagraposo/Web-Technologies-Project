/**
 * Tâb Game Server - Group 18
 * Entry point - index.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleRequest } = require('./server/controller');
const data = require('./server/data');

// Configuration
const PORT = 8118; // Group 18 → Port 8118

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

/**
 * Serve static files
 */
function serveStatic(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query string
    const queryIndex = filePath.indexOf('?');
    if (queryIndex !== -1) {
        filePath = filePath.substring(0, queryIndex);
    }

    // Security: prevent directory traversal
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath).toLowerCase();

    // Check if file exists
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return false;
    }

    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = fs.readFileSync(fullPath);
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Main request handler
 */
function mainHandler(req, res) {
    const url = req.url;

    // API endpoints start with /register, /join, etc.
    const apiEndpoints = ['/register', '/join', '/leave', '/roll', '/pass', '/notify', '/update', '/ranking'];
    const isApiRequest = apiEndpoints.some(ep => url.startsWith(ep));

    if (isApiRequest) {
        // Handle API request
        handleRequest(req, res);
    } else {
        // Try to serve static file
        if (!serveStatic(req, res)) {
            // Not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Not Found</h1>');
        }
    }
}

// Load persisted data
console.log('Loading data...');
data.loadData();

// Create and start server
const server = http.createServer(mainHandler);

server.listen(PORT, () => {
    console.log(`Server running at http://twserver.alunos.dcc.fc.up.pt:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close other applications using this port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
