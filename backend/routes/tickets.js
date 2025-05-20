const express = require('express');
const router = express.Router();
const {
	createTicket,
	getTickets,
	getTicket,
	updateTicket,
	deleteTicket,
} = require('../controllers/ticketController');

// Routes for /api/tickets
router.route('/').get(getTickets).post(createTicket);

router.route('/:id').get(getTicket).put(updateTicket).delete(deleteTicket);

module.exports = router;
