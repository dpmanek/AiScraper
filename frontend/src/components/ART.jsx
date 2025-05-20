import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/ART.css';

const ART = () => {
	const location = useLocation();
	const scrapedData = location.state?.scrapedData;

	// Form state
	const [formData, setFormData] = useState({
		ticketId: '',
		title: '',
		firstName: '',
		lastName: '',
		email: '',
		priority: 'Medium',
		category: '',
		status: 'Open',
		notes: '',
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
				ticketId: scrapedData.ticketId || '',
				title: scrapedData.title || '',
				firstName: firstName,
				lastName: lastName,
				email: scrapedData.requesterEmail || '',
				priority: scrapedData.priority || 'Medium',
				category: scrapedData.category || '',
				status: scrapedData.status || 'Open',
				notes: scrapedData.description || '',
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

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Here you would typically send the form data to a server
		console.log('Form submitted with data:', formData);

		// Show success message
		setSubmitSuccess(true);

		// Reset success message after 3 seconds
		setTimeout(() => {
			setSubmitSuccess(false);
		}, 3000);
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
					{scrapedData.ticketId}
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
							<label htmlFor="ticketId">Ticket ID</label>
							<input
								type="text"
								id="ticketId"
								name="ticketId"
								value={formData.ticketId}
								onChange={handleInputChange}
								readOnly
								className={autoFilled && formData.ticketId ? 'autofilled' : ''}
							/>
						</div>

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

						<div className="form-group">
							<label htmlFor="category">Category</label>
							<input
								type="text"
								id="category"
								name="category"
								value={formData.category}
								onChange={handleInputChange}
								className={autoFilled && formData.category ? 'autofilled' : ''}
							/>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="status">Status</label>
						<select
							id="status"
							name="status"
							value={formData.status}
							onChange={handleInputChange}
							className={autoFilled && formData.status ? 'autofilled' : ''}
						>
							<option value="Open">Open</option>
							<option value="In Progress">In Progress</option>
							<option value="Resolved">Resolved</option>
							<option value="Closed">Closed</option>
						</select>
					</div>

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
