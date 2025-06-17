import { useState } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/SimbaForm.css';

const SimbaForm = () => {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		priority: 'Medium',
		firstName: '',
		lastName: '',
		user_id: '',
		// New fields
		ticket_category: 'REQ-HR-ONBOARD',
		requested_resource: '',
		// Status will be automatically set to 'Open' on the server
		// current_status will be automatically set to 'Pending Approval' on the server
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [simbaId, setSimbaId] = useState(null);
	const [enableBedrock, setEnableBedrock] = useState(false);

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
			const response = await fetch(`${API_BASE_URL}/api/tickets`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
					enableBedrock: enableBedrock,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create ticket');
			}

			setSuccess(true);
			setSimbaId(data.data.simba_id);
			setFormData({
				title: '',
				description: '',
				priority: 'Medium',
				firstName: '',
				lastName: '',
				user_id: '',
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
					Ticket created successfully! SIMBA ID: {simbaId}
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
						<label htmlFor="firstName">First Name *</label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							required
							placeholder="Your first name"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="lastName">Last Name *</label>
						<input
							type="text"
							id="lastName"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							required
							placeholder="Your last name"
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="user_id">Email/User ID *</label>
						<input
							type="email"
							id="user_id"
							name="user_id"
							value={formData.user_id}
							onChange={handleChange}
							required
							placeholder="Your email address"
						/>
					</div>
				</div>

				{/* Bedrock Agent Toggle */}
				<div className="form-row">
					<div className="form-group bedrock-toggle">
						<label
							className="toggle-label"
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '1rem',
								cursor: 'pointer',
							}}
						>
							<input
								type="checkbox"
								checked={enableBedrock}
								onChange={(e) => setEnableBedrock(e.target.checked)}
								className="toggle-checkbox"
								style={{ display: 'none' }}
							/>
							<span
								className="toggle-slider"
								style={{
									position: 'relative',
									width: '50px',
									height: '26px',
									backgroundColor: enableBedrock ? '#27ae60' : '#ccc',
									borderRadius: '26px',
									transition: 'background-color 0.3s',
									flexShrink: 0,
								}}
							>
								<span
									style={{
										content: '',
										position: 'absolute',
										top: '3px',
										left: enableBedrock ? '27px' : '3px',
										width: '20px',
										height: '20px',
										backgroundColor: 'white',
										borderRadius: '50%',
										transition: 'left 0.3s',
										boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
									}}
								></span>
							</span>
							<span className="toggle-text">
								<span
									style={{
										fontWeight: '600',
										color: '#34495e',
										fontSize: '1rem',
									}}
								>
									Enable Bedrock Agent Automation
								</span>
								<small
									className="toggle-description"
									style={{
										color: '#7f8c8d',
										fontSize: '0.85rem',
										fontWeight: 'normal',
										lineHeight: '1.4',
									}}
								>
									Automatically process ART ticket creation using AI agents
								</small>
							</span>
						</label>
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
