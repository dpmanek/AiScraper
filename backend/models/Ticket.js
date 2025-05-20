const mongoose = require('mongoose');

// Define the ticket schema
const ticketSchema = new mongoose.Schema(
	{
		ticketId: {
			type: String,
			required: true,
			unique: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		priority: {
			type: String,
			enum: ['Low', 'Medium', 'High'],
			default: 'Medium',
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		requesterName: {
			type: String,
			required: true,
			trim: true,
		},
		requesterEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		status: {
			type: String,
			enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
			default: 'Open',
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true, // This will automatically update the createdAt and updatedAt fields
	}
);

// Create a method to generate a unique ticket ID
ticketSchema.statics.generateTicketId = async function () {
	try {
		// Get the count of all tickets and add 1 to create a new ID
		// Use a timeout of 15 seconds for this operation
		const count = await this.countDocuments().maxTimeMS(15000);
		const newId = `SIMBA-${(count + 1).toString().padStart(4, '0')}`;
		return newId;
	} catch (error) {
		console.error('Error generating ticket ID:', error);
		// Fallback to a timestamp-based ID if counting fails
		const timestamp = new Date().getTime();
		const randomSuffix = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0');
		return `SIMBA-${timestamp.toString().slice(-4)}-${randomSuffix}`;
	}
};

// Create the Ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
