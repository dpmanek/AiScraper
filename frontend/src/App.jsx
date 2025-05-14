import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import UrlInput from './components/UrlInput';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

function App() {
	const [inputMethod, setInputMethod] = useState('image'); // 'image' or 'url'
	const [processedData, setProcessedData] = useState(null);
	const [isReanalyzing, setIsReanalyzing] = useState(false);

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
		<div className="app-container">
			<header>
				<h1>Website Content Analyzer</h1>
				<p className="subtitle">
					Extract and analyze content from websites using AI
				</p>
			</header>

			<main>
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
							className={`method-button ${
								inputMethod === 'url' ? 'active' : ''
							}`}
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
						<ResultDisplay data={processedData} onReanalyze={handleReanalyze} />
					</section>
				)}
			</main>

			<footer>
				<p>Powered by OCR, Web Scraping, and AI Analysis</p>
			</footer>
		</div>
	);
}

export default App;
