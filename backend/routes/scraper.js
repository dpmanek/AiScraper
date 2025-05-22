const express = require('express');
const router = express.Router();
const { scrapeTicket } = require('../controllers/scraperController');

// Route for scraping
router.post('/scrape/:id', scrapeTicket);

module.exports = router;
