const mongoose = require('mongoose');

// Define the scraped ticket schema
const scrapedTicketSchema = new mongoose.Schema(
	{
		originalTicketId: {
			type: String,
			required: true,
			ref: 'Ticket', // Reference to the original ticket
		},
		scrapedData: {
			type: Object,
			required: true,
		},
		scrapedAt: {
			type: Date,
			default: Date.now,
		},
		sourceUrl: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Create the ScrapedTicket model
const ScrapedTicket = mongoose.model('ScrapedTicket', scrapedTicketSchema);

module.exports = ScrapedTicket;
