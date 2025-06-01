const express = require('express');
const router = express.Router();

// @desc    Test endpoint for debugging
// @route   GET /api/test
// @access  Public
router.get('/', (req, res) => {
	try {
		res.status(200).json({
			success: true,
			message: 'Test endpoint working',
			timestamp: new Date().toISOString(),
			headers: req.headers,
			cloudfront: req.headers['x-forwarded-for'] ? true : false,
			origin: req.headers.origin || 'No origin header',
			host: req.headers.host || 'No host header',
		});
	} catch (error) {
		console.error('Test endpoint error:', error);
		res.status(500).json({
			success: false,
			error: 'Test endpoint error',
			errorMessage: error.message,
		});
	}
});

module.exports = router;
