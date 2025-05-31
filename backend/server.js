require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import MongoDB connection
const connectDB = require('./db');

// Import routes
const ticketRoutes = require('./routes/tickets');
const scraperRoutes = require('./routes/scraper');
const analyzerRoutes = require('./routes/analyzer');

// Import Swagger configuration
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// No longer need Google AI initialization since it's in analyzerController.js

// Middleware
// Configure CORS with specific options to handle preflight requests properly
const corsOptions = {
	origin: [
		'http://localhost:5173',
		'https://d1v9dmgp4scf60.cloudfront.net',
		// Allow both with and without www
		'https://www.d1v9dmgp4scf60.cloudfront.net',
	],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
	],
	credentials: true,
	preflightContinue: false,
	optionsSuccessStatus: 204,
	maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Trust proxy headers from CloudFront
app.set('trust proxy', true);

// Add a specific handler for OPTIONS requests
app.options('*', cors(corsOptions));

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, 'uploads');
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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

// Removed OCR and URL scraping endpoints - now handled by analyzer routes

// Moved all helper functions to analyzerController.js

// Removed text analysis endpoint - now handled by analyzer routes

// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routes
app.use('/api/tickets', ticketRoutes);
app.use('/api', scraperRoutes);
app.use('/api', analyzerRoutes);

// Serve static files for ticket pages in production
// This will be useful when we deploy the application
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../frontend/dist')));

	// Handle React routing, return all requests to React app
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
	});
}

// Moved all Cloudflare-related functions to analyzerController.js

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
