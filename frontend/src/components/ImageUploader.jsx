import { useState, useRef } from 'react';

const ImageUploader = ({ onProcessComplete }) => {
	const [file, setFile] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [preview, setPreview] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const dropZoneRef = useRef(null);

	const processFile = (selectedFile) => {
		setError(null);

		if (!selectedFile) {
			setFile(null);
			setPreview(null);
			return;
		}

		// Check if file is an image
		if (!selectedFile.type.startsWith('image/')) {
			setError('Please select an image file');
			setFile(null);
			setPreview(null);
			return;
		}

		setFile(selectedFile);

		// Create preview
		const reader = new FileReader();
		reader.onload = () => {
			setPreview(reader.result);
		};
		reader.readAsDataURL(selectedFile);
	};

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		processFile(selectedFile);
	};

	// Drag and drop handlers
	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFile = e.dataTransfer.files[0];
			processFile(droppedFile);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!file) {
			setError('Please select an image file');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('image', file);
			// No provider selection here - it will be selected after extraction

			const response = await fetch('http://localhost:5000/api/process-image', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to process image');
			}

			const data = await response.json();
			onProcessComplete(data);
		} catch (err) {
			setError(err.message || 'An error occurred while processing the image');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="image-uploader">
			<h2>Upload Website Screenshot</h2>
			<form onSubmit={handleSubmit}>
				<div
					ref={dropZoneRef}
					className={`drop-zone ${isDragging ? 'active' : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<div className="file-input-container">
						<input
							type="file"
							id="image-upload"
							accept="image/*"
							onChange={handleFileChange}
							disabled={isLoading}
						/>
						<label htmlFor="image-upload" className="file-input-label">
							{file ? file.name : 'Choose an image or drag & drop here'}
						</label>
					</div>

					<div className="drop-zone-message">
						<div className="drop-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line x1="12" y1="3" x2="12" y2="15"></line>
							</svg>
						</div>
						<p>Drag & drop image here or click to browse</p>
					</div>
				</div>

				{preview && (
					<div className="image-preview">
						<img src={preview} alt="Preview" />
					</div>
				)}

				{error && <div className="error-message">{error}</div>}

				<button
					type="submit"
					disabled={!file || isLoading}
					className="submit-button"
				>
					{isLoading ? 'Processing...' : 'Process Image'}
				</button>
			</form>
		</div>
	);
};

export default ImageUploader;
