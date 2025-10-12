// Absolute minimal serverless function
// This should work on Vercel without any issues

export default function handler(req, res) {
  try {
    // Basic response
    res.status(200).json({
      message: 'Hello from Vercel!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}