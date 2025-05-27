import { useState } from 'react';
import '../../styles/SimbaForm.css';

const SimbaForm = () => {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		priority: 'Medium',
		category: '',
		requesterName: '',
		requesterEmail: '',
		// New fields
		ticket_category: 'REQ-HR-ONBOARD',
		requested_resource: '',
		// Status will be automatically set to 'Open' on the server
		// current_status will be automatically set to 'Pending Approval' on the server
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [ticketId, setTicketId] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const response = await fetch('http://localhost:5000/api/tickets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create ticket');
			}

			setSuccess(true);
			setTicketId(data.data.ticketId);
			setFormData({
				title: '',
				description: '',
				priority: 'Medium',
				category: '',
				requesterName: '',
				requesterEmail: '',
				ticket_category: 'REQ-HR-ONBOARD',
				requested_resource: '',
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="simba-form-container">
			<h2>SIMBA Ticketing System</h2>
			<p className="form-description">
				Create a new support ticket by filling out the form below.
			</p>

			{error && <div className="error-message">{error}</div>}

			{success && (
				<div className="success-message">
					Ticket created successfully! Ticket ID: {ticketId}
				</div>
			)}

			<form onSubmit={handleSubmit} className="simba-form">
				<div className="form-group">
					<label htmlFor="title">Title *</label>
					<input
						type="text"
						id="title"
						name="title"
						value={formData.title}
						onChange={handleChange}
						required
						placeholder="Brief description of the issue"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="description">Description *</label>
					<textarea
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						required
						rows="5"
						placeholder="Detailed description of the issue or request"
					></textarea>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="priority">Priority</label>
						<select
							id="priority"
							name="priority"
							value={formData.priority}
							onChange={handleChange}
						>
							<option value="Low">Low</option>
							<option value="Medium">Medium</option>
							<option value="High">High</option>
						</select>
					</div>
				</div>

				{/* New fields */}
				<div className="form-row">
					<div className="form-group">
						<label htmlFor="ticket_category">Request Type *</label>
						<select
							id="ticket_category"
							name="ticket_category"
							value={formData.ticket_category}
							onChange={handleChange}
							required
						>
							<option value="REQ-HR-ONBOARD">HR Onboarding</option>
							<option value="REQ-DEV-REPO">Developer Repository</option>
							<option value="REQ-MARKETING-CRM">Marketing CRM</option>
							<option value="REQ-FIN-APP">Finance Application</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="requested_resource">Requested Resource</label>
						<input
							type="text"
							id="requested_resource"
							name="requested_resource"
							value={formData.requested_resource}
							onChange={handleChange}
							placeholder="e.g., GitHub Repo, Salesforce Account"
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="requesterName">Your Name *</label>
						<input
							type="text"
							id="requesterName"
							name="requesterName"
							value={formData.requesterName}
							onChange={handleChange}
							required
							placeholder="Your full name"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="requesterEmail">Your Email *</label>
						<input
							type="email"
							id="requesterEmail"
							name="requesterEmail"
							value={formData.requesterEmail}
							onChange={handleChange}
							required
							placeholder="Your email address"
						/>
					</div>
				</div>

				{/* Status is automatically set to 'Open' when a ticket is created */}

				<div className="form-actions">
					<button type="submit" className="submit-button" disabled={loading}>
						{loading ? 'Creating Ticket...' : 'Create Ticket'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default SimbaForm;
