import { useState, useEffect } from 'react';
import '../styles/FormFeeder.css';

const FormFeeder = () => {
	// Form state
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		zipCode: '',
		country: '',
		occupation: '',
		interests: [],
		subscribeNewsletter: false,
		preferredContact: '',
		notes: '',
	});

	// UI state
	const [loading, setLoading] = useState(false);
	const [autoFilled, setAutoFilled] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [error, setError] = useState(null);

	// Available options for select fields
	const occupationOptions = [
		'Software Developer',
		'Designer',
		'Product Manager',
		'Data Scientist',
		'Marketing Specialist',
		'Sales Representative',
		'Student',
		'Other',
	];

	const interestOptions = [
		'technology',
		'reading',
		'travel',
		'sports',
		'music',
		'cooking',
		'photography',
		'art',
	];

	const contactOptions = ['email', 'phone', 'mail'];

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (type === 'checkbox' && name !== 'subscribeNewsletter') {
			// Handle interests checkboxes
			const updatedInterests = [...formData.interests];
			if (checked) {
				updatedInterests.push(value);
			} else {
				const index = updatedInterests.indexOf(value);
				if (index > -1) {
					updatedInterests.splice(index, 1);
				}
			}
			setFormData({ ...formData, interests: updatedInterests });
		} else {
			// Handle other inputs
			setFormData({
				...formData,
				[name]: type === 'checkbox' ? checked : value,
			});
		}
	};

	// Fetch data from API
	const fetchFormData = async () => {
		setLoading(true);
		setError(null);
		setAutoFilled(false);

		try {
			const response = await fetch('http://localhost:5000/api/form-data');
			if (!response.ok) {
				throw new Error('Failed to fetch form data');
			}

			const data = await response.json();
			setFormData(data);
			setAutoFilled(true);

			// Reset auto-filled indicator after 3 seconds
			setTimeout(() => {
				setAutoFilled(false);
			}, 3000);
		} catch (err) {
			setError(err.message || 'An error occurred while fetching data');
		} finally {
			setLoading(false);
		}
	};

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
		<div className="form-feeder-container">
			<div className="form-header">
				<h2>Form Feeder Demo</h2>
				<p>This form demonstrates auto-filling from a mock API endpoint</p>

				<button
					type="button"
					className="load-data-button"
					onClick={fetchFormData}
					disabled={loading}
				>
					{loading ? 'Loading...' : 'Load Data from API'}
				</button>
			</div>

			{error && <div className="error-message">Error: {error}</div>}

			{autoFilled && (
				<div className="success-message">
					Form has been auto-filled with data from the API!
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

					<div className="form-row">
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

						<div className="form-group">
							<label htmlFor="phone">Phone</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleInputChange}
								className={autoFilled && formData.phone ? 'autofilled' : ''}
							/>
						</div>
					</div>
				</div>

				<div className="form-section">
					<h3>Address</h3>

					<div className="form-group">
						<label htmlFor="address">Street Address</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleInputChange}
							className={autoFilled && formData.address ? 'autofilled' : ''}
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="city">City</label>
							<input
								type="text"
								id="city"
								name="city"
								value={formData.city}
								onChange={handleInputChange}
								className={autoFilled && formData.city ? 'autofilled' : ''}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="state">State/Province</label>
							<input
								type="text"
								id="state"
								name="state"
								value={formData.state}
								onChange={handleInputChange}
								className={autoFilled && formData.state ? 'autofilled' : ''}
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="zipCode">Zip/Postal Code</label>
							<input
								type="text"
								id="zipCode"
								name="zipCode"
								value={formData.zipCode}
								onChange={handleInputChange}
								className={autoFilled && formData.zipCode ? 'autofilled' : ''}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="country">Country</label>
							<input
								type="text"
								id="country"
								name="country"
								value={formData.country}
								onChange={handleInputChange}
								className={autoFilled && formData.country ? 'autofilled' : ''}
							/>
						</div>
					</div>
				</div>

				<div className="form-section">
					<h3>Additional Information</h3>

					<div className="form-group">
						<label htmlFor="occupation">Occupation</label>
						<select
							id="occupation"
							name="occupation"
							value={formData.occupation}
							onChange={handleInputChange}
							className={autoFilled && formData.occupation ? 'autofilled' : ''}
						>
							<option value="">Select an occupation</option>
							{occupationOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label>Interests</label>
						<div className="checkbox-group">
							{interestOptions.map((interest) => (
								<div key={interest} className="checkbox-item">
									<input
										type="checkbox"
										id={`interest-${interest}`}
										name={`interest-${interest}`}
										value={interest}
										checked={formData.interests.includes(interest)}
										onChange={handleInputChange}
										className={
											autoFilled && formData.interests.includes(interest)
												? 'autofilled'
												: ''
										}
									/>
									<label htmlFor={`interest-${interest}`}>
										{interest.charAt(0).toUpperCase() + interest.slice(1)}
									</label>
								</div>
							))}
						</div>
					</div>

					<div className="form-group">
						<div className="checkbox-item">
							<input
								type="checkbox"
								id="subscribeNewsletter"
								name="subscribeNewsletter"
								checked={formData.subscribeNewsletter}
								onChange={handleInputChange}
								className={autoFilled ? 'autofilled' : ''}
							/>
							<label htmlFor="subscribeNewsletter">
								Subscribe to newsletter
							</label>
						</div>
					</div>

					<div className="form-group">
						<label>Preferred Contact Method</label>
						<div className="radio-group">
							{contactOptions.map((method) => (
								<div key={method} className="radio-item">
									<input
										type="radio"
										id={`contact-${method}`}
										name="preferredContact"
										value={method}
										checked={formData.preferredContact === method}
										onChange={handleInputChange}
										className={
											autoFilled && formData.preferredContact === method
												? 'autofilled'
												: ''
										}
									/>
									<label htmlFor={`contact-${method}`}>
										{method.charAt(0).toUpperCase() + method.slice(1)}
									</label>
								</div>
							))}
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="notes">Additional Notes</label>
						<textarea
							id="notes"
							name="notes"
							value={formData.notes}
							onChange={handleInputChange}
							rows="4"
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

export default FormFeeder;
