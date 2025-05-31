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
		const simbaId = req.params.id;

		// Construct the URL to scrape - use the deployed frontend URL
		const frontendUrl = 'https://d1v9dmgp4scf60.cloudfront.net';
		// For local development:
		// const frontendUrl = 'http://localhost:5173';
		const ticketUrl = `${frontendUrl}/tickets/${simbaId}`;

		// Launch the browser
		const browser = await puppeteerExtra.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		try {
			const page = await browser.newPage();

			// Set viewport size to ensure all elements are visible
			await page.setViewport({ width: 1280, height: 800 });

			// Navigate to the ticket page and wait for it to be fully loaded
			await page.goto(ticketUrl, {
				waitUntil: 'networkidle2',
				timeout: 30000,
			});

			// Wait for critical elements to be available
			await page
				.waitForSelector('.ticket-content', { timeout: 5000 })
				.catch((e) => console.log('Warning: .ticket-content not found'));

			// Wait an additional 2 seconds for all content to render
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Actually scrape the data from the page using Puppeteer with exact selectors
			const scrapedData = await page.evaluate(() => {
				// Helper function to safely get text content
				const getText = (selector) => {
					const element = document.querySelector(selector);
					return element ? element.textContent.trim() : '';
				};

				// Extract data using the exact structure from the TicketDetail.jsx component
				// SIMBA ID is in a span with class 'ticket-id' inside an h2 element
				const simbaId = getText('h2 .ticket-id');

				// Title is in a p with class 'ticket-title'
				const title = getText('p.ticket-title');

				// Description is in a p with class 'ticket-description'
				const description = getText('p.ticket-description');

				// Priority is in a span with classes 'priority-badge' and 'ticket-priority'
				const priority =
					getText('span.priority-badge.ticket-priority') || 'Medium';

				// Status is in a span with classes 'status-badge' and 'ticket-status'
				const status = getText('span.status-badge.ticket-status') || 'Open';

				// Category is in a span with class 'detail-value ticket-category'
				const category = getText('.detail-value.ticket-category');

				// Requester name is in a span with class 'detail-value ticket-requester-name'
				const requesterName = getText('.detail-value.ticket-requester-name');

				// Requester email is in a span with class 'detail-value ticket-requester-email'
				const requesterEmail = getText('.detail-value.ticket-requester-email');

				// Created date is in a span with class 'detail-value ticket-created-at'
				const createdAtText = getText('.detail-value.ticket-created-at');

				// Updated date is in a span with class 'detail-value ticket-updated-at'
				const updatedAtText = getText('.detail-value.ticket-updated-at');

				// Convert date strings to Date objects
				const createdAt = createdAtText
					? new Date(createdAtText).toISOString()
					: new Date().toISOString();
				const updatedAt = updatedAtText
					? new Date(updatedAtText).toISOString()
					: new Date().toISOString();

				// New fields - try to scrape them if they exist
				const ticket_category =
					getText('.detail-value.ticket-ticket-category') || '';
				const requested_resource =
					getText('.detail-value.ticket-requested-resource') || '';
				const access_level =
					getText('.detail-value.ticket-access-level') || 'Read';
				const current_status =
					getText('.detail-value.ticket-current-status') || 'Pending Approval';

				// System fields - these might not be visible on the frontend
				const simba_id = getText('.detail-value.ticket-simba-id') || simbaId;
				const simba_status =
					getText('.detail-value.ticket-simba-status') || 'InProgress';
				// Don't generate an ART ID when scraping, use the existing one if available
				const art_id = getText('.detail-value.ticket-art-id') || null;
				const art_status = getText('.detail-value.ticket-art-status') || null;
				const provisioning_outcome =
					getText('.detail-value.ticket-provisioning-outcome') || 'None';
				const remediation_needed =
					getText('.detail-value.ticket-remediation-needed') || 'None';

				// For complex fields, we'll use defaults if not found
				// These would typically be handled by backend logic
				const error_details = {
					code: getText('.detail-value.ticket-error-code') || 'NO_ERROR',
					message: getText('.detail-value.ticket-error-message') || 'No error',
				};

				// Split requester name into first and last name for approver
				const nameParts = requesterName
					? requesterName.split(' ')
					: ['Jane', 'Smith'];
				const firstName = nameParts[0] || 'Jane';
				const lastName =
					nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Smith';

				const approver = {
					approver_id:
						getText('.detail-value.ticket-approver-id') || 'approver-001',
					first_name:
						getText('.detail-value.ticket-approver-first-name') || firstName,
					last_name:
						getText('.detail-value.ticket-approver-last-name') || lastName,
					approval_for: ['SIMBA'],
				};

				// Workflow state - use default if not found
				const workflow_state = [
					{
						current_node:
							getText('.detail-value.ticket-workflow-current-node') ||
							'submission',
						steps_completed: ['validate_request', 'log_ticket'],
					},
					{
						current_node: 'approval',
						steps_completed: [],
					},
				];

				// Timestamps
				const created_timestamp = createdAt;
				const last_updated_timestamp = updatedAt;

				return {
					simbaId,
					title,
					description,
					priority,
					category,
					requesterName,
					requesterEmail,
					status,
					createdAt,
					updatedAt,
					// New fields
					ticket_category,
					requested_resource,
					access_level,
					current_status,
					simba_id,
					simba_status,
					art_id,
					art_status,
					provisioning_outcome,
					remediation_needed,
					error_details,
					approver,
					workflow_state,
					created_timestamp,
					last_updated_timestamp,
				};
			});

			// Save the scraped data to the database
			const scrapedTicket = await ScrapedTicket.create({
				originalSimbaId: simbaId,
				scrapedData,
				sourceUrl: ticketUrl,
			});

			// Return both the scraped data and the database record
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

// Removed unused functions for getting scraped tickets
