import { useState } from 'react';
import PromptEditor from './PromptEditor';

const ResultDisplay = ({ data, onReanalyze, customPrompt, onPromptChange }) => {
	const [activeTab, setActiveTab] = useState('extracted');
	const [selectedProvider, setSelectedProvider] = useState('gemini');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisError, setAnalysisError] = useState(null);

	if (!data) return null;

	const { extractedText, scrapedText, llmResponse, provider } = data;
	const contentText = extractedText || scrapedText || '';
	const aiProvider = provider || 'AI';

	// Get the display name for the AI provider
	const getProviderName = (providerCode) => {
		switch (providerCode) {
			case 'gemini':
				return 'Google Gemini';
			case 'claude':
				return 'Claude 3.7 Sonnet';
			case 'openai':
				return 'OpenAI GPT';
			default:
				return 'AI';
		}
	};

	const providerName = getProviderName(aiProvider);

	const handleProviderChange = (e) => {
		setSelectedProvider(e.target.value);
	};

	const handleAnalyze = async () => {
		if (selectedProvider === aiProvider) return; // No need to reanalyze with same provider

		setIsAnalyzing(true);
		setAnalysisError(null);

		try {
			await onReanalyze(selectedProvider, contentText);
		} catch (error) {
			setAnalysisError(error.message || 'Error analyzing content');
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="result-display">
			<div className="tabs">
				<button
					className={`tab ${activeTab === 'extracted' ? 'active' : ''}`}
					onClick={() => setActiveTab('extracted')}
				>
					Extracted Content
				</button>
				<button
					className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
					onClick={() => setActiveTab('analysis')}
				>
					AI Analysis
				</button>
			</div>

			<div className="tab-content">
				{activeTab === 'extracted' ? (
					<div className="extracted-content">
						<h3>Extracted Content</h3>
						<div className="content-box">
							{contentText ? (
								<pre>{contentText}</pre>
							) : (
								<p className="no-content">No content extracted</p>
							)}
						</div>

						{contentText && (
							<div className="analysis-controls">
								<div className="provider-selector horizontal">
									<label htmlFor="ai-provider-results">Analyze with:</label>
									<select
										id="ai-provider-results"
										value={selectedProvider}
										onChange={handleProviderChange}
										disabled={isAnalyzing}
										className="provider-dropdown"
									>
										<option value="gemini">Google Gemini</option>
										<option value="claude">Claude 3.7 Sonnet</option>
										<option value="openai">OpenAI GPT</option>
									</select>
									<button
										className="analyze-button"
										onClick={handleAnalyze}
										disabled={isAnalyzing || selectedProvider === aiProvider}
									>
										{isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
									</button>
								</div>
								{analysisError && (
									<div className="error-message">{analysisError}</div>
								)}
							</div>
						)}
					</div>
				) : (
					<div className="ai-analysis">
						<h3>
							AI Analysis <span className="provider-badge">{providerName}</span>
						</h3>
						<div className="content-box">
							{llmResponse ? (
								<div className="llm-response">
									{formatLLMResponse(llmResponse)}
								</div>
							) : (
								<p className="no-content">No analysis available</p>
							)}
						</div>

						{llmResponse && (
							<>
								<PromptEditor
									defaultPrompt={customPrompt}
									onSave={onPromptChange}
									onCancel={() => {}}
								/>

								<div className="analysis-controls">
									<div className="provider-selector horizontal">
										<label htmlFor="ai-provider-results-tab">
											Try a different AI:
										</label>
										<select
											id="ai-provider-results-tab"
											value={selectedProvider}
											onChange={handleProviderChange}
											disabled={isAnalyzing}
											className="provider-dropdown"
										>
											<option value="gemini">Google Gemini</option>
											<option value="claude">Claude 3.7 Sonnet</option>
											<option value="openai">OpenAI GPT</option>
										</select>
										<button
											className="analyze-button"
											onClick={handleAnalyze}
											disabled={isAnalyzing || selectedProvider === aiProvider}
										>
											{isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
										</button>
									</div>
									{analysisError && (
										<div className="error-message">{analysisError}</div>
									)}
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

// Helper function to format LLM response with proper sections
const formatLLMResponse = (response) => {
	// Split by common section headers
	const sections = response
		.split(/(?:^|\n)(?:#+\s*|Summary:|Key Information:)/g)
		.filter(Boolean);

	if (sections.length <= 1) {
		// If no clear sections, just return the formatted text
		return (
			<div className="llm-formatted-text">
				{response.split('\n').map((line, i) => (
					<p key={i}>{line || <br />}</p>
				))}
			</div>
		);
	}

	// Process sections with headers
	const processedSections = [];
	let currentText = response;

	// Look for Summary section
	const summaryMatch = response.match(
		/(?:^|\n)(#+\s*Summary:?|Summary:)(.*?)(?=\n#+\s*|$)/s
	);
	if (summaryMatch) {
		processedSections.push(
			<div key="summary" className="llm-section">
				<h4>Summary</h4>
				<div>
					{summaryMatch[2]
						.trim()
						.split('\n')
						.map((line, i) => (
							<p key={i}>{line || <br />}</p>
						))}
				</div>
			</div>
		);
		currentText = currentText.replace(summaryMatch[0], '');
	}

	// Look for Key Information section
	const keyInfoMatch = currentText.match(
		/(?:^|\n)(#+\s*Key Information:?|Key Information:)(.*?)(?=\n#+\s*|$)/s
	);
	if (keyInfoMatch) {
		processedSections.push(
			<div key="keyinfo" className="llm-section">
				<h4>Key Information</h4>
				<div>
					{keyInfoMatch[2]
						.trim()
						.split('\n')
						.map((line, i) => (
							<p key={i}>{line || <br />}</p>
						))}
				</div>
			</div>
		);
		currentText = currentText.replace(keyInfoMatch[0], '');
	}

	// If there's any remaining text, add it as "Additional Information"
	if (currentText.trim()) {
		processedSections.push(
			<div key="additional" className="llm-section">
				<h4>Additional Information</h4>
				<div>
					{currentText
						.trim()
						.split('\n')
						.map((line, i) => (
							<p key={i}>{line || <br />}</p>
						))}
				</div>
			</div>
		);
	}

	// If no sections were processed, fall back to simple formatting
	if (processedSections.length === 0) {
		return (
			<div className="llm-formatted-text">
				{response.split('\n').map((line, i) => (
					<p key={i}>{line || <br />}</p>
				))}
			</div>
		);
	}

	return <>{processedSections}</>;
};

export default ResultDisplay;
