const Ticket = require('../models/Ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Public
exports.createTicket = async (req, res) => {
	try {
		const {
			title,
			description,
			priority,
			category,
			requesterName,
			requesterEmail,
		} = req.body;

		// Generate a unique ticket ID
		const ticketId = await Ticket.generateTicketId();

		// Create the ticket - always set status to 'Open' for new tickets
		const ticket = await Ticket.create({
			ticketId,
			title,
			description,
			priority,
			category,
			requesterName,
			requesterEmail,
			status: 'Open', // Always set to 'Open' for new tickets
		});

		res.status(201).json({
			success: true,
			data: ticket,
		});
	} catch (error) {
		console.error('Error creating ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Public
exports.getTickets = async (req, res) => {
	try {
		const tickets = await Ticket.find().sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: tickets.length,
			data: tickets,
		});
	} catch (error) {
		console.error('Error getting tickets:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Get a single ticket
// @route   GET /api/tickets/:id
// @access  Public
exports.getTicket = async (req, res) => {
	try {
		const ticket = await Ticket.findOne({ ticketId: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		res.status(200).json({
			success: true,
			data: ticket,
		});
	} catch (error) {
		console.error('Error getting ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Public
exports.updateTicket = async (req, res) => {
	try {
		let ticket = await Ticket.findOne({ ticketId: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		// Update the ticket
		ticket = await Ticket.findOneAndUpdate(
			{ ticketId: req.params.id },
			{ ...req.body, updatedAt: Date.now() },
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			success: true,
			data: ticket,
		});
	} catch (error) {
		console.error('Error updating ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Public
exports.deleteTicket = async (req, res) => {
	try {
		const ticket = await Ticket.findOne({ ticketId: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		await ticket.deleteOne();

		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		console.error('Error deleting ticket:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};
