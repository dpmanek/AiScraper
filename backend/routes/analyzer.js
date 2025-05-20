const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controller
const {
	processImage,
	scrapeUrl,
	analyzeText,
} = require('../controllers/analyzerController');

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, '../uploads');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		// Accept only image files
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'));
		}
	},
});

// Routes
router.post('/process-image', upload.single('image'), processImage);
router.post('/scrape-url', scrapeUrl);
router.post('/analyze-text', analyzeText);

module.exports = router;
