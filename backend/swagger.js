const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger configuration
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'AIScraper API',
			description: 'API Documentation for AIScraper application',
			version: '1.0.0',
			contact: {
				name: 'API Support',
				email: 'support@aiscraper.com',
			},
			license: {
				name: 'MIT',
				url: 'https://opensource.org/licenses/MIT',
			},
		},
		servers: [
			{
				url: 'http://localhost:5000',
				description: 'Development server',
			},
		],
		components: {
			schemas: {
				Ticket: {
					type: 'object',
					required: ['title', 'description', 'requesterName', 'requesterEmail'],
					properties: {
						simba_id: {
							type: 'string',
							description: 'Unique identifier for the ticket',
						},
						art_id: {
							type: 'string',
							description:
								'ART identifier for the ticket, generated when ART form is submitted',
							nullable: true,
						},
						art_status: {
							type: 'string',
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
							description: 'Current status of the ART process',
							nullable: true,
						},
						title: {
							type: 'string',
							description: 'Title of the ticket',
						},
						description: {
							type: 'string',
							description: 'Detailed description of the ticket',
						},
						priority: {
							type: 'string',
							enum: ['Low', 'Medium', 'High'],
							description: 'Priority level of the ticket',
						},
						ticket_category: {
							type: 'string',
							enum: [
								'REQ-HR-ONBOARD',
								'REQ-DEV-REPO',
								'REQ-MARKETING-CRM',
								'REQ-FIN-APP',
							],
							description: 'Category/type of the ticket request',
						},
						requested_resource: {
							type: 'string',
							description: 'Resource being requested',
						},
						access_level: {
							type: 'string',
							enum: ['Read', 'Write', 'Admin', 'Member'],
							description: 'Access level for the requested resource',
						},
						current_status: {
							type: 'string',
							enum: ['Pending Approval', 'Approved', 'Approval Rejected'],
							description: 'Current approval status of the ticket',
						},
						requesterName: {
							type: 'string',
							description: 'Name of the person requesting the ticket',
						},
						requesterEmail: {
							type: 'string',
							description: 'Email of the person requesting the ticket',
						},
						status: {
							type: 'string',
							enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
							description: 'Current status of the ticket',
						},
					},
				},
				ScrapedTicket: {
					type: 'object',
					properties: {
						originalSimbaId: {
							type: 'string',
							description: 'Reference to the original ticket ID',
						},
						scrapedData: {
							type: 'object',
							description: 'Data scraped from the ticket',
						},
						sourceUrl: {
							type: 'string',
							description: 'URL from which the data was scraped',
						},
					},
				},
				Error: {
					type: 'object',
					properties: {
						success: {
							type: 'boolean',
							example: false,
						},
						error: {
							type: 'string',
							example: 'Error message',
						},
					},
				},
			},
		},
	},
	apis: [path.join(__dirname, './routes/*.js')], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
	swaggerUi,
	swaggerDocs,
};
