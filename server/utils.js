/**
 * Helper utilities for the SeWenta/Tâb server
 */

/**
 * Parse JSON body from request
 * @param {http.IncomingMessage} req
 * @returns {Promise<Object>}
 */
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

/**
 * Send JSON response
 * @param {http.ServerResponse} res
 * @param {Object} data
 * @param {number} statusCode
 */
function sendJson(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

/**
 * Send error response
 * @param {http.ServerResponse} res
 * @param {string} message
 * @param {number} statusCode
 */
function sendError(res, message, statusCode = 400) {
    sendJson(res, { error: message }, statusCode);
}

/**
 * Parse URL query parameters
 * @param {string} url
 * @returns {Object}
 */
function parseQuery(url) {
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = url.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params) {
        // Only parse as number if the WHOLE string is a number
        const isInteger = /^-?\d+$/.test(value);
        result[key] = isInteger ? parseInt(value, 10) : value;
    }

    return result;
}

/**
 * Get path without query string
 * @param {string} url
 * @returns {string}
 */
function getPath(url) {
    const queryIndex = url.indexOf('?');
    return queryIndex === -1 ? url : url.substring(0, queryIndex);
}

module.exports = {
    parseBody,
    sendJson,
    sendError,
    parseQuery,
    getPath
};
