/**
 * Netlify Function: Image Generation Proxy
 * Proxies requests to the image generation service
 */

const https = require('https');

// The URL of the deployed image generation service
const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL || 'https://appraisily-image-generation-service.uc.r.appspot.com';

exports.handler = async (event, context) => {
  // Set up CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS requests (preflight CORS requests)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    console.log(`Received ${event.httpMethod} request to ${event.path}`);
    
    // Determine the target endpoint based on the request path
    const targetPath = event.path.replace('/.netlify/functions/image-generation-proxy', '');
    const targetEndpoint = targetPath || '/api/generate';
    
    // Forward the request to the image generation service
    const response = await makeRequest({
      method: event.httpMethod,
      url: `${IMAGE_SERVICE_URL}${targetEndpoint}`,
      headers: {
        'Content-Type': 'application/json',
        // Forward the authorization header if present
        ...(event.headers.authorization && { 
          'Authorization': event.headers.authorization 
        })
      },
      body: event.body
    });
    
    // Return the response from the image generation service
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify(response.body)
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        error: 'Error proxying request to image generation service',
        message: error.message
      })
    };
  }
};

/**
 * Make an HTTP request to the specified URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response object
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method,
      headers: options.headers || {}
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let body;
        try {
          body = JSON.parse(data);
        } catch (e) {
          body = data;
        }
        
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
} 