require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Puppeteer with stealth mode for Cloudflare bypass
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google AI for Gemini
const googleAI = new GoogleGenerativeAI(
	process.env.GEMINI_API_KEY || 'dummy-key'
);

// Middleware
app.use(cors());
app.use(express.json());

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

// OCR endpoint - Process uploaded image
app.post('/api/process-image', upload.single('image'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No image file uploaded' });
		}

		const imagePath = req.file.path;
		const provider =
			req.body.provider || process.env.DEFAULT_AI_PROVIDER || 'openai';

		// Perform OCR on the image
		const result = await Tesseract.recognize(imagePath, 'eng');
		const extractedText = result.data.text;

		// Process with LLM if text was extracted
		if (extractedText.trim()) {
			const llmResponse = await processWithLLM(extractedText, provider);

			// Clean up the uploaded file
			fs.unlinkSync(imagePath);

			return res.json({
				extractedText,
				llmResponse,
				provider,
			});
		} else {
			// Clean up the uploaded file
			fs.unlinkSync(imagePath);

			return res
				.status(400)
				.json({ error: 'No text could be extracted from the image' });
		}
	} catch (error) {
		console.error('Error processing image:', error);
		return res.status(500).json({ error: 'Error processing image' });
	}
});

// URL scraping endpoint
app.post('/api/scrape-url', async (req, res) => {
	try {
		const { url, provider, headless, bypassCloudflare } = req.body;
		const selectedProvider =
			provider || process.env.DEFAULT_AI_PROVIDER || 'openai';

		if (!url) {
			return res.status(400).json({ error: 'URL is required' });
		}

		// Validate URL format
		try {
			new URL(url);
		} catch (error) {
			return res.status(400).json({ error: 'Invalid URL format' });
		}

		// Scrape the URL with the specified options
		console.log(
			`Scraping URL with options: headless=${headless}, bypassCloudflare=${bypassCloudflare}`
		);
		const scrapedText = await scrapeWebsite(url, {
			headless: headless === true,
			bypassCloudflare: bypassCloudflare !== false,
		});

		if (!scrapedText.trim()) {
			return res
				.status(400)
				.json({ error: 'No content could be scraped from the URL' });
		}

		// Process with LLM
		const llmResponse = await processWithLLM(scrapedText, selectedProvider);

		return res.json({
			scrapedText,
			llmResponse,
			provider: selectedProvider,
		});
	} catch (error) {
		console.error('Error scraping URL:', error);
		return res.status(500).json({ error: 'Error scraping URL' });
	}
});

// Function to scrape website content with Cloudflare bypass
async function scrapeWebsite(url, options = {}) {
	const { headless = false, bypassCloudflare = true } = options;

	console.log(`Starting to scrape ${url} with options:
	- Headless mode: ${headless ? 'Enabled' : 'Disabled'}
	- Cloudflare bypass: ${bypassCloudflare ? 'Enabled' : 'Disabled'}`);

	// Check if this is a known difficult site
	const isStrictSite =
		url.includes('bonfirehub.com') || url.includes('cloudflare');
	console.log(
		`Site identified as ${
			isStrictSite ? 'strict' : 'standard'
		} protection level`
	);

	// Browser configuration based on options
	const browserOptions = {
		headless: isStrictSite ? false : headless ? 'new' : false, // Force non-headless for strict sites
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-web-security',
			'--disable-features=IsolateOrigins,site-per-process',
			'--window-size=1920,1080', // Set a common screen resolution
			'--disable-blink-features=AutomationControlled', // Hide automation
			'--disable-infobars',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--disable-gpu',
			'--hide-scrollbars',
			'--mute-audio',
		],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
		ignoreHTTPSErrors: true,
	};

	// Launch browser with appropriate options
	const browser = await puppeteerExtra.launch(browserOptions);

	try {
		const page = await browser.newPage();

		// Set a realistic user agent
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
		);

		// Set extra HTTP headers to appear more like a real browser
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US,en;q=0.9',
			Accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate, br',
			Connection: 'keep-alive',
			'Upgrade-Insecure-Requests': '1',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'none',
			'Sec-Fetch-User': '?1',
		});

		// Enable JavaScript and cookies
		await page.setJavaScriptEnabled(true);

		console.log(`Navigating to ${url}...`);

		// Navigate to the URL with a longer timeout and wait for network idle
		await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 90000, // Longer timeout for Cloudflare challenges
		});

		// Wait a bit to allow any Cloudflare challenges to resolve
		console.log('Waiting for Cloudflare challenges to resolve...');
		// Use setTimeout with Promise for universal compatibility
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Check if we're on a Cloudflare page and if bypass is enabled
		if (bypassCloudflare) {
			const cloudflareDetected = await page.evaluate(() => {
				return (
					document.body.textContent.includes('Checking your browser') ||
					document.body.textContent.includes('DDoS protection by Cloudflare') ||
					document.title.includes('Cloudflare') ||
					document.querySelector('div[class*="cf-"]') !== null
				);
			});

			if (cloudflareDetected) {
				console.log('Cloudflare challenge detected, attempting to solve...');

				// Try to solve Cloudflare challenge with human-like interactions
				await handleCloudflareChallenge(page);
			}
		} else if (
			await page.evaluate(() => document.title.includes('Cloudflare'))
		) {
			console.log(
				'Cloudflare detected but bypass is disabled. Continuing without bypass attempt.'
			);
		}

		console.log('Extracting content...');

		// Extract visible text from the page
		const text = await page.evaluate(() => {
			// Remove script and style elements
			document.querySelectorAll('script, style').forEach((el) => el.remove());

			// Get all visible text
			return document.body.innerText;
		});

		return text;
	} catch (error) {
		console.error('Error during scraping:', error);
		throw error;
	} finally {
		await browser.close();
	}
}

// Function to process text with LLM (OpenAI or Gemini)
async function processWithLLM(text, provider = 'openai') {
	// Truncate text if it's too long (LLMs have token limits)
	const truncatedText =
		text.length > 15000 ? text.substring(0, 15000) + '...' : text;

	// Use the selected provider
	if (provider.toLowerCase() === 'gemini') {
		return processWithGemini(truncatedText);
	} else {
		return processWithOpenAI(truncatedText);
	}
}

// Function to process text with OpenAI
async function processWithOpenAI(text) {
	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'You are a helpful assistant that summarizes web content and highlights key information. Provide your response in two sections: 1) Summary and 2) Key Information',
					},
					{
						role: 'user',
						content: `Summarize the following web content and highlight key information (like product details, pricing, descriptions, etc.): ${text}`,
					},
				],
				temperature: 0.5,
				max_tokens: 500,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);

		return response.data.choices[0].message.content;
	} catch (error) {
		console.error('Error processing with OpenAI:', error.message);
		if (error.response) {
			console.error(
				'OpenAI API Error:',
				error.response.status,
				error.response.data
			);
		}
		return 'Error processing content with OpenAI. Please try again or switch to a different AI provider.';
	}
}

// Function to process text with Gemini
async function processWithGemini(text) {
	try {
		// Get the generative model (Gemini Pro)
		const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });

		// Create the prompt
		const prompt = `Summarize the following web content and highlight key information (like product details, pricing, descriptions, etc.): ${text}
		
		Provide your response in two sections:
		1) Summary
		2) Key Information`;

		// Generate content
		const result = await model.generateContent(prompt);
		const response = await result.response;

		return response.text();
	} catch (error) {
		console.error('Error processing with Gemini:', error);
		return 'Error processing content with Gemini. Please try again or switch to a different AI provider.';
	}
}

// Text analysis endpoint - Process text with a specific AI provider
app.post('/api/analyze-text', async (req, res) => {
	try {
		const { text, provider } = req.body;

		if (!text || !text.trim()) {
			return res.status(400).json({ error: 'Text content is required' });
		}

		const selectedProvider =
			provider || process.env.DEFAULT_AI_PROVIDER || 'openai';

		// Process with the selected LLM
		const llmResponse = await processWithLLM(text, selectedProvider);

		return res.json({
			llmResponse,
			provider: selectedProvider,
		});
	} catch (error) {
		console.error('Error analyzing text:', error);
		return res.status(500).json({ error: 'Error analyzing text' });
	}
});

// Mock API endpoint for form data
app.get('/api/form-data', (req, res) => {
	// Mock data that would normally come from a database
	const formData = {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		phone: '555-123-4567',
		address: '123 Main St',
		city: 'Anytown',
		state: 'CA',
		zipCode: '12345',
		country: 'USA',
		occupation: 'Software Developer',
		interests: ['technology', 'reading', 'travel'],
		subscribeNewsletter: true,
		preferredContact: 'email',
		notes: 'This is sample data from our mock API endpoint.',
	};

	// Simulate network delay
	setTimeout(() => {
		res.json(formData);
	}, 500);
});

// Function to handle Cloudflare challenges
async function handleCloudflareChallenge(page) {
	try {
		console.log('Attempting to solve Cloudflare challenge...');

		// Wait for any potential iframes or challenge elements to load
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Look for common Cloudflare challenge elements
		const challengeSelectors = [
			'input[type="checkbox"]', // Checkbox challenge
			'iframe[src*="cloudflare"]', // Iframe challenge
			'#challenge-form', // Challenge form
			'.ray_id', // Ray ID element
			'#cf-please-wait', // Please wait message
			'#cf-content', // Cloudflare content
			'#challenge-running', // Challenge running message
			'#challenge-stage', // Challenge stage
			'#challenge-error-title', // Error title
		];

		// Check for challenge elements
		for (const selector of challengeSelectors) {
			const element = await page.$(selector);
			if (element) {
				console.log(`Found Cloudflare element: ${selector}`);

				// If it's a checkbox, click it with human-like behavior
				if (selector === 'input[type="checkbox"]') {
					await simulateHumanInteraction(page, element);
					await new Promise((resolve) => setTimeout(resolve, 2000));
				}

				// If it's an iframe, try to interact with it
				if (selector === 'iframe[src*="cloudflare"]') {
					const frameUrl = await element.evaluate((el) => el.src);
					console.log(`Found Cloudflare iframe: ${frameUrl}`);

					const frame = page
						.frames()
						.find((f) => f.url().includes('cloudflare'));
					if (frame) {
						const checkbox = await frame.$('input[type="checkbox"]');
						if (checkbox) {
							await frame.evaluate((el) => el.click(), checkbox);
							await new Promise((resolve) => setTimeout(resolve, 2000));
						}
					}
				}
			}
		}

		// Perform some random mouse movements to appear more human-like
		await simulateHumanMouseMovement(page);

		// Wait for navigation or timeout
		try {
			// Use a Promise race to handle navigation with timeout
			await Promise.race([
				page.waitForNavigation(),
				new Promise((resolve) => setTimeout(resolve, 15000)),
			]);
			console.log('Navigation completed or timeout reached');
		} catch (e) {
			console.log('No navigation occurred after challenge interaction');
		}

		// Wait a bit more to ensure the page is fully loaded
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Check if we're still on a Cloudflare page
		const stillOnCloudflare = await page.evaluate(() => {
			return (
				document.body.textContent.includes('Checking your browser') ||
				document.body.textContent.includes('DDoS protection by Cloudflare') ||
				document.title.includes('Cloudflare') ||
				document.querySelector('div[class*="cf-"]') !== null
			);
		});

		if (stillOnCloudflare) {
			console.log(
				'Still on Cloudflare page after challenge attempt. Waiting longer...'
			);
			await new Promise((resolve) => setTimeout(resolve, 10000));
		} else {
			console.log('Successfully bypassed Cloudflare challenge!');
		}
	} catch (error) {
		console.error('Error handling Cloudflare challenge:', error);
	}
}

// Function to simulate human-like mouse movements
async function simulateHumanMouseMovement(page) {
	console.log('Simulating human mouse movements...');

	// Get page dimensions
	const dimensions = await page.evaluate(() => {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
		};
	});

	// Generate random points for mouse movement
	const points = [];
	const numPoints = Math.floor(Math.random() * 10) + 5; // 5-15 points

	for (let i = 0; i < numPoints; i++) {
		points.push({
			x: Math.floor(Math.random() * dimensions.width),
			y: Math.floor(Math.random() * dimensions.height),
		});
	}

	// Move mouse through the random points with random delays
	for (const point of points) {
		await page.mouse.move(point.x, point.y);
		await new Promise((resolve) =>
			setTimeout(resolve, Math.random() * 200 + 100)
		); // 100-300ms delay
	}
}

// Function to simulate human interaction with an element
async function simulateHumanInteraction(page, element) {
	// Get element position and dimensions
	const box = await element.boundingBox();
	if (!box) return;

	// Move to element with a slight curve (human-like)
	const startPoint = { x: Math.random() * 100, y: Math.random() * 100 };
	const controlPoint = {
		x: (startPoint.x + box.x + box.width / 2) / 2 + (Math.random() * 100 - 50),
		y: (startPoint.y + box.y + box.height / 2) / 2 + (Math.random() * 100 - 50),
	};
	const endPoint = {
		x: box.x + box.width / 2 + (Math.random() * 10 - 5),
		y: box.y + box.height / 2 + (Math.random() * 10 - 5),
	};

	// Start from a random position
	await page.mouse.move(startPoint.x, startPoint.y);
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50));

	// Simulate a curved movement (approximated with multiple linear movements)
	const steps = Math.floor(Math.random() * 5) + 5; // 5-10 steps
	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		const t1 = 1 - t;

		// Quadratic Bezier curve formula
		const x =
			t1 * t1 * startPoint.x + 2 * t1 * t * controlPoint.x + t * t * endPoint.x;
		const y =
			t1 * t1 * startPoint.y + 2 * t1 * t * controlPoint.y + t * t * endPoint.y;

		await page.mouse.move(x, y);
		await new Promise((resolve) =>
			setTimeout(resolve, Math.random() * 20 + 10)
		);
	}

	// Slight pause before clicking (human-like)
	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 200 + 100)
	);

	// Click the element
	await page.mouse.click(endPoint.x, endPoint.y);
}

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
