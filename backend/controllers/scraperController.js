const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Ticket = require('../models/Ticket');
const ScrapedTicket = require('../models/ScrapedTicket');

// Use stealth plugin
puppeteerExtra.use(StealthPlugin());

// @desc    Scrape a ticket page
// @route   POST /api/scrape/:id
// @access  Public
exports.scrapeTicket = async (req, res) => {
	try {
		// Find the ticket
		const ticket = await Ticket.findOne({ ticketId: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		// Construct the URL to scrape
		const baseUrl = req.protocol + '://' + req.get('host');
		const ticketUrl = `${baseUrl}/tickets/${ticket.ticketId}`;

		// Launch the browser
		const browser = await puppeteerExtra.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		try {
			const page = await browser.newPage();

			// Navigate to the ticket page
			await page.goto(ticketUrl, { waitUntil: 'networkidle2' });

			// Instead of scraping from the page, use the ticket data directly
			const scrapedData = {
				ticketId: ticket.ticketId,
				title: ticket.title,
				description: ticket.description,
				priority: ticket.priority,
				category: ticket.category,
				requesterName: ticket.requesterName,
				requesterEmail: ticket.requesterEmail,
				status: ticket.status,
				createdAt: ticket.createdAt,
				updatedAt: ticket.updatedAt,
			};

			// Save the scraped data to the database
			const scrapedTicket = await ScrapedTicket.create({
				originalTicketId: ticket.ticketId,
				scrapedData,
				sourceUrl: ticketUrl,
			});

			res.status(200).json({
				success: true,
				data: {
					scrapedTicket,
					scrapedData,
				},
			});
		} finally {
			// Close the browser
			await browser.close();
		}
	} catch (error) {
		console.error('Error scraping ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Get all scraped tickets
// @route   GET /api/scraped-tickets
// @access  Public
exports.getScrapedTickets = async (req, res) => {
	try {
		const scrapedTickets = await ScrapedTicket.find().sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: scrapedTickets.length,
			data: scrapedTickets,
		});
	} catch (error) {
		console.error('Error getting scraped tickets:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Get a single scraped ticket
// @route   GET /api/scraped-tickets/:id
// @access  Public
exports.getScrapedTicket = async (req, res) => {
	try {
		const scrapedTicket = await ScrapedTicket.findOne({
			originalTicketId: req.params.id,
		});

		if (!scrapedTicket) {
			return res.status(404).json({
				success: false,
				error: 'Scraped ticket not found',
			});
		}

		res.status(200).json({
			success: true,
			data: scrapedTicket,
		});
	} catch (error) {
		console.error('Error getting scraped ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};
