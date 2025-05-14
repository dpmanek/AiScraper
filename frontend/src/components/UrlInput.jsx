import { useState } from 'react';

const UrlInput = ({ onProcessComplete }) => {
	const [url, setUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleUrlChange = (e) => {
		setUrl(e.target.value);
		setError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Basic URL validation
		if (!url.trim()) {
			setError('Please enter a URL');
			return;
		}

		// Check if URL has a protocol
		let processUrl = url;
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			processUrl = 'https://' + url;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('http://localhost:5000/api/scrape-url', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: processUrl,
					// No provider selection here - it will be selected after extraction
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to scrape URL');
			}

			const data = await response.json();
			onProcessComplete(data);
		} catch (err) {
			setError(err.message || 'An error occurred while scraping the URL');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="url-input">
			<h2>Enter Website URL</h2>
			<form onSubmit={handleSubmit}>
				<div className="input-container">
					<input
						type="text"
						value={url}
						onChange={handleUrlChange}
						placeholder="Enter website URL (e.g., example.com)"
						disabled={isLoading}
						className="url-input-field"
					/>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button
					type="submit"
					disabled={!url.trim() || isLoading}
					className="submit-button"
				>
					{isLoading ? 'Processing...' : 'Scrape URL'}
				</button>
			</form>
		</div>
	);
};

export default UrlInput;
