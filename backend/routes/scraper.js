const express = require('express');
const router = express.Router();
const {
	scrapeTicket,
	getScrapedTickets,
	getScrapedTicket,
} = require('../controllers/scraperController');

// Routes for scraping
router.post('/scrape/:id', scrapeTicket);

// Routes for scraped tickets
router.get('/scraped-tickets', getScrapedTickets);
router.get('/scraped-tickets/:id', getScrapedTicket);

module.exports = router;
