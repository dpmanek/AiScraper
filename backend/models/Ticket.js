const mongoose = require('mongoose');

// Define the Error Schema
const ErrorSchema = new mongoose.Schema(
	{
		code: { type: String, required: true },
		message: { type: String, required: true },
	},
	{ _id: false }
); // _id: false prevents automatic _id for nested schema

// Define the Approver Schema
const ApproverSchema = new mongoose.Schema(
	{
		approver_id: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		approval_for: { type: [String], default: ['SIMBA'] },
	},
	{ _id: false }
);

// Define the Workflow State Schema
const WorkflowStateSchema = new mongoose.Schema(
	{
		current_node: { type: String, required: true },
		steps_completed: { type: [String], default: [] },
	},
	{ _id: false }
);

// Define the ticket schema
const ticketSchema = new mongoose.Schema(
	{
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
		// New fields based on requirements
		ticket_category: {
			type: String,
			enum: [
				'REQ-HR-ONBOARD',
				'REQ-DEV-REPO',
				'REQ-MARKETING-CRM',
				'REQ-FIN-APP',
			],
			required: false,
		},
		requested_resource: String,
		access_level: {
			type: String,
			enum: ['Read', 'Write', 'Admin', 'Member'],
			required: false,
			default: 'Read',
		},
		current_status: {
			type: String,
			enum: ['Pending Approval', 'Approved', 'Approval Rejected'],
			required: false,
			default: 'Pending Approval',
		},
		created_timestamp: {
			type: Date,
			default: Date.now,
		},
		last_updated_timestamp: {
			type: Date,
			default: Date.now,
		},
		approver: {
			type: ApproverSchema,
			default: () => ({
				approver_id: 'approver-001',
				first_name: 'Jane',
				last_name: 'Smith',
				approval_for: ['SIMBA'],
			}),
		},
		simba_id: {
			type: String,
			required: true,
			default: function () {
				return `SIMBA-${Math.floor(Math.random() * 10000)
					.toString()
					.padStart(4, '0')}`;
			},
		},
		simba_status: {
			type: String,
			enum: [
				'Submitted',
				'InProgress',
				'InReview',
				'Pending',
				'Provisioned',
				'Provisioned Failed',
				'Closed',
			],
			required: false,
			default: 'InProgress',
		},
		art_id: {
			type: String,
			default: null,
		},
		art_status: {
			type: String,
			enum: [
				'Submitted',
				'InProgress',
				'InReview',
				'Pending',
				'Provisioned',
				'Provisioned Failed',
				'Closed',
				null,
			],
			required: false,
			default: null,
		},
		provisioning_outcome: {
			type: String,
			enum: ['Success', 'Failed', 'None'],
			required: false,
			default: 'None',
		},
		remediation_needed: {
			type: String,
			enum: ['Yes', 'No', 'None'],
			required: false,
			default: 'None',
		},
		error_details: {
			type: ErrorSchema,
			default: null,
		},
		workflow_state: {
			type: [WorkflowStateSchema],
			default: function () {
				return [
					{
						current_node: 'submission',
						steps_completed: ['validate_request', 'log_ticket'],
					},
					{
						current_node: 'approval',
						steps_completed: [],
					},
				];
			},
		},
		// Original fields (category removed as it's redundant with ticket_category)
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
		// Add ticketId field to fix duplicate key error
		ticketId: {
			type: Number,
			default: function () {
				return Math.floor(Math.random() * 1000000);
			},
		},
	},
	{
		timestamps: true, // This will automatically update the createdAt and updatedAt fields
	}
);

// Create a method to generate a unique SIMBA ID
ticketSchema.statics.generateSimbaId = async function () {
	try {
		// Get the count of all tickets and add 1 to create a new ID
		// Use a timeout of 15 seconds for this operation
		const count = await this.countDocuments().maxTimeMS(15000);
		const newId = `SIMBA-${(count + 1).toString().padStart(4, '0')}`;
		return newId;
	} catch (error) {
		console.error('Error generating SIMBA ID:', error);
		// Fallback to a timestamp-based ID if counting fails
		const timestamp = new Date().getTime();
		const randomSuffix = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0');
		return `SIMBA-${timestamp.toString().slice(-4)}-${randomSuffix}`;
	}
};

// Pre-save middleware to update timestamps
ticketSchema.pre('save', function (next) {
	// Update the created_timestamp and last_updated_timestamp
	if (!this.created_timestamp) {
		this.created_timestamp = new Date();
	}
	this.last_updated_timestamp = new Date();
	next();
});

// Drop all indexes and recreate only the ones we need
ticketSchema.index({ simba_id: 1 }, { unique: true });
// Remove unique constraint from art_id index to allow multiple null values
ticketSchema.index({ art_id: 1 }, { sparse: true, background: true });

// Add a pre-init hook to drop any existing ticketId index
ticketSchema.pre('init', function () {
	const collection = this.collection;
	collection.dropIndex('ticketId_1', function (err) {
		// Ignore errors if the index doesn't exist
		console.log('Dropped ticketId_1 index if it existed');
	});
});

// Create the Ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
