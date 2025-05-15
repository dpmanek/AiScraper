import { useState } from 'react';

const UrlInput = ({ onProcessComplete }) => {
	const [url, setUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [headlessMode, setHeadlessMode] = useState(false);
	const [bypassCloudflare, setBypassCloudflare] = useState(true);

	const handleUrlChange = (e) => {
		setUrl(e.target.value);
		setError(null);
	};

	const toggleAdvancedOptions = () => {
		setShowAdvanced(!showAdvanced);
	};

	const handleHeadlessModeChange = (e) => {
		setHeadlessMode(e.target.checked);
	};

	const handleBypassCloudflareChange = (e) => {
		setBypassCloudflare(e.target.checked);
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
					headless: headlessMode,
					bypassCloudflare: bypassCloudflare,
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

				<div className="advanced-options-toggle">
					<button
						type="button"
						onClick={toggleAdvancedOptions}
						className="toggle-button"
					>
						{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
					</button>
				</div>

				{showAdvanced && (
					<div className="advanced-options">
						<div className="option-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={headlessMode}
									onChange={handleHeadlessModeChange}
									disabled={isLoading}
								/>
								Headless Mode (faster, but may not bypass Cloudflare)
							</label>
						</div>
						<div className="option-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={bypassCloudflare}
									onChange={handleBypassCloudflareChange}
									disabled={isLoading}
								/>
								Attempt to bypass Cloudflare protection
							</label>
						</div>
						<div className="option-info">
							<small>
								For Cloudflare-protected sites, disable headless mode and enable
								Cloudflare bypass
							</small>
						</div>
					</div>
				)}

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
