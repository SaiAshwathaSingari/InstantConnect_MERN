// Alternative serverless function in root directory
export default function handler(req, res) {
  try {
    res.status(200).json({
      message: 'InstantConnect API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      method: req.method
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
