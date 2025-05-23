import { useState } from 'react';
import '../styles/PromptEditor.css';

const PromptEditor = ({ defaultPrompt, onSave, onCancel }) => {
	const [prompt, setPrompt] = useState(defaultPrompt);
	const [isExpanded, setIsExpanded] = useState(false);

	const handleSave = () => {
		onSave(prompt);
		setIsExpanded(false);
	};

	const handleCancel = () => {
		setPrompt(defaultPrompt);
		onCancel();
		setIsExpanded(false);
	};

	const handleReset = () => {
		setPrompt(defaultPrompt);
	};

	if (!isExpanded) {
		return (
			<div className="prompt-editor-collapsed">
				<button className="expand-button" onClick={() => setIsExpanded(true)}>
					Customize AI Prompt
				</button>
			</div>
		);
	}

	return (
		<div className="prompt-editor">
			<h3>Customize AI Analysis Prompt</h3>
			<p className="prompt-description">
				Modify the instructions given to the AI model for analyzing content.
			</p>
			<textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				rows={6}
				placeholder="Enter custom instructions for the AI..."
			/>
			<div className="prompt-actions">
				<button className="reset-button" onClick={handleReset}>
					Reset to Default
				</button>
				<div className="main-actions">
					<button className="cancel-button" onClick={handleCancel}>
						Cancel
					</button>
					<button className="save-button" onClick={handleSave}>
						Save Prompt
					</button>
				</div>
			</div>
		</div>
	);
};

export default PromptEditor;
