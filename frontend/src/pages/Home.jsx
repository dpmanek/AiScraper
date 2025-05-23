import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import UrlInput from '../components/UrlInput';
import ResultDisplay from '../components/ResultDisplay';
import PromptEditor from '../components/PromptEditor';

const Home = () => {
	const [inputMethod, setInputMethod] = useState('image'); // 'image' or 'url'
	const [processedData, setProcessedData] = useState(null);
	const [isReanalyzing, setIsReanalyzing] = useState(false);
	const [customPrompt, setCustomPrompt] = useState(
		'You are a helpful assistant that summarizes web content and highlights key information. Provide your response in two sections: 1) Summary and 2) Key Information'
	);

	const handleProcessComplete = (data) => {
		setProcessedData(data);
		// Scroll to results
		setTimeout(() => {
			const resultsElement = document.getElementById('results');
			if (resultsElement) {
				resultsElement.scrollIntoView({ behavior: 'smooth' });
			}
		}, 100);
	};

	const handleReset = () => {
		setProcessedData(null);
	};

	// Function to reanalyze content with a different AI provider
	const handleReanalyze = async (provider, content) => {
		setIsReanalyzing(true);

		try {
			// Determine if we're dealing with OCR or URL scraping
			const isOcr = processedData.hasOwnProperty('extractedText');

			// Call the appropriate endpoint
			const endpoint = isOcr
				? 'http://localhost:5000/api/analyze-text'
				: 'http://localhost:5000/api/analyze-text';

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					text: content,
					provider: provider,
					prompt: customPrompt,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to analyze content');
			}

			const data = await response.json();

			// Update the processed data with the new analysis
			setProcessedData({
				...processedData,
				llmResponse: data.llmResponse,
				provider: provider,
			});
		} catch (error) {
			console.error('Error reanalyzing content:', error);
			throw error;
		} finally {
			setIsReanalyzing(false);
		}
	};

	return (
		<div className="home-container">
			<section className="input-section">
				<div className="input-method-selector">
					<button
						className={`method-button ${
							inputMethod === 'image' ? 'active' : ''
						}`}
						onClick={() => setInputMethod('image')}
					>
						Upload Screenshot
					</button>
					<button
						className={`method-button ${inputMethod === 'url' ? 'active' : ''}`}
						onClick={() => setInputMethod('url')}
					>
						Enter URL
					</button>
				</div>

				<div className="input-container">
					{inputMethod === 'image' ? (
						<ImageUploader onProcessComplete={handleProcessComplete} />
					) : (
						<UrlInput onProcessComplete={handleProcessComplete} />
					)}
				</div>
			</section>

			{processedData && (
				<section id="results" className="results-section">
					<div className="results-header">
						<h2>Analysis Results</h2>
						<button className="reset-button" onClick={handleReset}>
							Start New Analysis
						</button>
					</div>
					<ResultDisplay
						data={processedData}
						onReanalyze={handleReanalyze}
						customPrompt={customPrompt}
						onPromptChange={setCustomPrompt}
					/>
				</section>
			)}

			<section className="tickets-promo-section">
				<h2>Create tickets in SIMBA?</h2>
				<p>
					Use our ticketing system to create, manage, and track your content
					scraping tasks.
				</p>
				<div className="promo-buttons">
					<a href="/tickets" className="promo-button">
						View All Tickets
					</a>
					<a href="/tickets/new" className="promo-button primary">
						Create New Ticket
					</a>
				</div>
			</section>
		</div>
	);
};

export default Home;
