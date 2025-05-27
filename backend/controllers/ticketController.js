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
			// New fields
			ticket_category,
			requested_resource,
			access_level,
			current_status,
		} = req.body;

		// Generate a unique SIMBA ID
		const simbaId = await Ticket.generateSimbaId();

		// Split requesterName into first and last name for approver
		const nameParts = requesterName ? requesterName.split(' ') : ['', ''];
		const firstName = nameParts[0] || '';
		const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

		// Create the ticket with all fields
		const ticket = await Ticket.create({
			simba_id: simbaId,
			title,
			description,
			priority,
			// category field removed as it's redundant with ticket_category
			requesterName,
			requesterEmail,
			status: 'Open', // Always set to 'Open' for new tickets

			// New fields
			ticket_category: ticket_category || undefined,
			requested_resource: requested_resource || undefined,
			access_level: access_level || 'Read',
			current_status: current_status || 'Pending Approval',

			// System-generated fields with defaults
			created_timestamp: new Date(),
			last_updated_timestamp: new Date(),

			// Set approver with requester's name if available
			approver: {
				approver_id: 'approver-001',
				first_name: firstName || 'Jane',
				last_name: lastName || 'Smith',
				approval_for: ['SIMBA'],
			},

			// These will use the default values from the schema
			simba_status: 'InProgress',
			// Set ART-related fields to null initially
			art_id: null, // Will be set when ART form is submitted
			art_status: null, // Will be set when ART form is submitted
			provisioning_outcome: 'None',
			remediation_needed: 'None',
			error_details: null,
			workflow_state: undefined, // Will use the default function
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
		const ticket = await Ticket.findOne({ simba_id: req.params.id });

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
		let ticket = await Ticket.findOne({ simba_id: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		// Always update the last_updated_timestamp
		req.body.last_updated_timestamp = new Date();

		// Update the ticket
		ticket = await Ticket.findOneAndUpdate(
			{ simba_id: req.params.id },
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
		const ticket = await Ticket.findOne({ simba_id: req.params.id });

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

// @desc    Submit ART form for a ticket
// @route   POST /api/tickets/:id/art
// @access  Public
exports.submitArtForm = async (req, res) => {
	try {
		const ticket = await Ticket.findOne({ simba_id: req.params.id });

		if (!ticket) {
			return res.status(404).json({
				success: false,
				error: 'Ticket not found',
			});
		}

		// Generate a random ART ID
		const artId = `ART-${Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0')}`;

		// Update the ticket with ART-related fields
		ticket.art_id = artId;
		ticket.art_status = 'InProgress';
		ticket.last_updated_timestamp = new Date();

		// Save the updated ticket
		await ticket.save();

		res.status(200).json({
			success: true,
			data: {
				ticket,
				art_id: artId,
			},
		});
	} catch (error) {
		console.error('Error submitting ART form:', error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};
