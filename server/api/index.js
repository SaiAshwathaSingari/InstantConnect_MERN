// Ultra-minimal serverless function for Vercel
// This should work without any external dependencies

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different routes
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/' || pathname === '') {
    res.status(200).json({
      message: 'InstantConnect API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      method: req.method
    });
  } else if (pathname === '/api/status') {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } else if (pathname === '/api/test') {
    res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      path: pathname
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: pathname
    });
  }
}