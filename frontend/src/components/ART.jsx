import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ART.css';

const ART = () => {
	const location = useLocation();
	const scrapedData = location.state?.scrapedData;

	// Form state
	const [formData, setFormData] = useState({
		title: '',
		firstName: '',
		lastName: '',
		email: '',
		priority: 'Medium',
		status: 'Open',
		notes: '',
		// New fields
		ticket_category: 'REQ-HR-ONBOARD',
		requested_resource: '',
		access_level: 'Read',
		simba_id: '',
		art_id: '',
	});

	// UI state
	const [loading, setLoading] = useState(false);
	const [autoFilled, setAutoFilled] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [error, setError] = useState(null);

	// Use effect to populate form with scraped data if available
	useEffect(() => {
		if (scrapedData) {
			console.log('Scraped data received:', scrapedData);

			// Extract first and last name from requesterName
			let firstName = '';
			let lastName = '';

			if (scrapedData.requesterName) {
				const nameParts = scrapedData.requesterName.split(' ');
				firstName = nameParts[0] || '';
				lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
			}

			// Map ticket data to form fields
			const mappedData = {
				title: scrapedData.title || '',
				firstName: firstName,
				lastName: lastName,
				email: scrapedData.requesterEmail || '',
				priority: scrapedData.priority || 'Medium',
				status: scrapedData.status || 'Open',
				notes: scrapedData.description || '',
				// New fields
				ticket_category: scrapedData.ticket_category || 'REQ-HR-ONBOARD',
				requested_resource: scrapedData.requested_resource || '',
				access_level: scrapedData.access_level || 'Read',
				simba_id: scrapedData.simba_id || scrapedData.simbaId || '',
				art_id: scrapedData.art_id || '',
			};

			setFormData(mappedData);
			setAutoFilled(true);

			// Reset auto-filled indicator after 5 seconds
			setTimeout(() => {
				setAutoFilled(false);
			}, 5000);
		}
	}, [scrapedData]);

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	// No longer needed since we removed the Load Sample Data button

	const navigate = useNavigate();

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Submit the ART form to the server
			if (!formData.simba_id) {
				throw new Error('SIMBA ID is required');
			}

			// Call the backend API to submit the ART form
			const response = await fetch(
				`http://localhost:5000/api/tickets/${formData.simba_id}/art`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to submit ART form');
			}

			const data = await response.json();
			console.log('Form submitted successfully:', data);

			// Show success message
			setSubmitSuccess(true);

			// Get the ART ID from the response
			const artTicketId = data.data.art_id;

			// Wait 2 seconds to show the success message before redirecting
			setTimeout(() => {
				// Navigate to the ART ticket detail page
				navigate(`/art-tickets/${artTicketId}`);
			}, 2000);
		} catch (err) {
			setError(err.message || 'Failed to submit ART form');
			setSubmitSuccess(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="art-container">
			<div className="art-header">
				<h2>ART</h2>
				<p>This form is auto-filled with data from the selected ticket</p>
			</div>

			{error && <div className="error-message">Error: {error}</div>}

			{autoFilled && scrapedData && (
				<div className="success-message">
					Form has been auto-filled with data from ticket:{' '}
					{scrapedData.simba_id || scrapedData.simbaId}
				</div>
			)}

			{submitSuccess && (
				<div className="success-message">Form submitted successfully!</div>
			)}

			<form
				onSubmit={handleSubmit}
				className={autoFilled ? 'form-autofilled' : ''}
			>
				<div className="form-section">
					<h3>Personal Information</h3>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="firstName">First Name</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleInputChange}
								required
								className={autoFilled && formData.firstName ? 'autofilled' : ''}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="lastName">Last Name</label>
							<input
								type="text"
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleInputChange}
								required
								className={autoFilled && formData.lastName ? 'autofilled' : ''}
							/>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							required
							className={autoFilled && formData.email ? 'autofilled' : ''}
						/>
					</div>
				</div>

				<div className="form-section">
					<h3>Ticket Information</h3>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="title">Title</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
								className={autoFilled && formData.title ? 'autofilled' : ''}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="simba_id">SIMBA ID</label>
							<input
								type="text"
								id="simba_id"
								name="simba_id"
								value={formData.simba_id}
								onChange={handleInputChange}
								readOnly
								className={autoFilled && formData.simba_id ? 'autofilled' : ''}
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="priority">Priority</label>
							<select
								id="priority"
								name="priority"
								value={formData.priority}
								onChange={handleInputChange}
								className={autoFilled && formData.priority ? 'autofilled' : ''}
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
							<label htmlFor="ticket_category">Request Type</label>
							<select
								id="ticket_category"
								name="ticket_category"
								value={formData.ticket_category}
								onChange={handleInputChange}
								className={
									autoFilled && formData.ticket_category ? 'autofilled' : ''
								}
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
								onChange={handleInputChange}
								className={
									autoFilled && formData.requested_resource ? 'autofilled' : ''
								}
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="access_level">Access Level</label>
							<input
								type="text"
								id="access_level"
								name="access_level"
								value={formData.access_level}
								readOnly
								className={
									autoFilled && formData.access_level ? 'autofilled' : ''
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="status">Status</label>
							<input
								type="text"
								id="status"
								name="status"
								value={formData.status}
								readOnly
								className={autoFilled && formData.status ? 'autofilled' : ''}
							/>
							<p className="field-note">Only IAM can update this field</p>
						</div>
					</div>

					{/* Removed ART ID field as it will be generated after form submission */}

					<div className="form-group">
						<label htmlFor="notes">Description</label>
						<textarea
							id="notes"
							name="notes"
							value={formData.notes}
							onChange={handleInputChange}
							rows="6"
							className={autoFilled && formData.notes ? 'autofilled' : ''}
						></textarea>
					</div>
				</div>

				<div className="form-actions">
					<button type="submit" className="submit-button">
						Submit Form
					</button>
				</div>
			</form>
		</div>
	);
};

export default ART;
