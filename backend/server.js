require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
		const { url, provider } = req.body;
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

		// Scrape the URL
		const scrapedText = await scrapeWebsite(url);

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

// Function to scrape website content
async function scrapeWebsite(url) {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	try {
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

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

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
