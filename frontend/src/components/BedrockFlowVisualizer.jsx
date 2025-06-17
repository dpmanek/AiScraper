import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/BedrockFlowVisualizer.css';

const BedrockFlowVisualizer = ({ simbaId }) => {
	const [traceData, setTraceData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Fetch trace data
	const fetchTraceData = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/api/tickets/${simbaId}/trace`
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const text = await response.text();
			let result;

			try {
				result = JSON.parse(text);
			} catch (parseError) {
				console.error('JSON Parse Error:', parseError);
				console.error('Response text:', text);
				throw new Error(`Invalid JSON response: ${parseError.message}`);
			}

			if (result.success) {
				if (result.data === null) {
					// Bedrock is disabled for this ticket, stop polling
					setTraceData(null);
					setError(null);
					return false; // Signal to stop polling
				} else {
					setTraceData(result.data);
					setError(null);
					return true; // Continue polling
				}
			} else {
				setError(result.error || 'Failed to fetch trace data');
				return false; // Stop polling on error
			}
		} catch (err) {
			console.error('Fetch trace data error:', err);
			setError('Error fetching trace data: ' + err.message);
			return false; // Stop polling on error
		} finally {
			setLoading(false);
		}
	};

	// Poll for updates every 2 seconds
	useEffect(() => {
		if (!simbaId) return;

		let interval;

		const startPolling = async () => {
			const shouldContinue = await fetchTraceData();

			if (shouldContinue) {
				interval = setInterval(async () => {
					const continuePolling = await fetchTraceData();
					if (!continuePolling && interval) {
						clearInterval(interval);
					}
				}, 2000);
			}
		};

		startPolling();

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [simbaId]);

	// Get status class for styling
	const getStatusClass = (status) => {
		switch (status) {
			case 'completed':
				return 'status-completed';
			case 'in_progress':
				return 'status-in-progress';
			case 'failed':
				return 'status-failed';
			case 'pending':
			default:
				return 'status-pending';
		}
	};

	// Get status icon
	const getStatusIcon = (status) => {
		switch (status) {
			case 'completed':
				return '✓';
			case 'in_progress':
				return '⟳';
			case 'failed':
				return '✗';
			case 'pending':
			default:
				return '○';
		}
	};

	// Format timestamp
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return 'Not started';
		return new Date(timestamp).toLocaleTimeString();
	};

	// Get current stage display with agent name
	const getCurrentStageDisplay = (traceData) => {
		const currentStage = traceData.stages.find(
			(stage) => stage.id === traceData.currentStage
		);
		if (currentStage && currentStage.agent) {
			return `${currentStage.agent}`;
		}
		return traceData.currentStage || 'Unknown';
	};

	if (loading) {
		return (
			<div className="bedrock-flow-visualizer">
				<div className="flow-header">
					<h3>Bedrock Agent Flow</h3>
					<div className="loading-spinner">Loading...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bedrock-flow-visualizer">
				<div className="flow-header">
					<h3>Bedrock Agent Flow</h3>
					<div className="error-message">{error}</div>
				</div>
			</div>
		);
	}

	if (!traceData) {
		return (
			<div className="bedrock-flow-visualizer">
				<div className="flow-header">
					<h3>Bedrock Agent Flow</h3>
					<div className="no-data">
						Bedrock automation is disabled. Enable it when creating tickets for
						automated ART processing.
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bedrock-flow-visualizer">
			<div className="flow-header" onClick={() => setIsCollapsed(!isCollapsed)}>
				<div className="flow-header-left">
					<h3>Bedrock Agent Flow</h3>
					<div className="session-info">
						<span className="session-id">Session: {traceData.sessionId}</span>
						<span className="current-stage">
							Current: {getCurrentStageDisplay(traceData)}
						</span>
					</div>
				</div>
				<button className="collapse-button">{isCollapsed ? '▼' : '▲'}</button>
			</div>

			{!isCollapsed && (
				<>
					<div className="pipeline-container">
						<div className="pipeline-stages">
							{traceData.stages.map((stage, index) => (
								<div key={stage.id} className="stage-container">
									<div className={`stage ${getStatusClass(stage.status)}`}>
										<div className="stage-icon">
											{getStatusIcon(stage.status)}
										</div>
										<div className="stage-content">
											<div className="stage-name">
												{stage.name}
												{stage.agent && stage.status !== 'pending' && (
													<span className="agent-name"> ({stage.agent})</span>
												)}
											</div>
											<div className="stage-time">
												{formatTimestamp(stage.timestamp)}
											</div>
											{stage.message && (
												<div className="stage-message">{stage.message}</div>
											)}
										</div>
									</div>
									{index < traceData.stages.length - 1 && (
										<div
											className={`connector ${
												traceData.stages[index + 1].status !== 'pending'
													? 'active'
													: ''
											}`}
										></div>
									)}
								</div>
							))}
						</div>
					</div>

					{traceData.logs && traceData.logs.length > 0 && (
						<div className="logs-section">
							<h4>Activity Log</h4>
							<div className="logs-container">
								{traceData.logs.slice(-5).map((log, index) => (
									<div
										key={index}
										className={`log-entry ${getStatusClass(log.status)}`}
									>
										<span className="log-time">
											{new Date(log.timestamp).toLocaleTimeString()}
										</span>
										<span className="log-agent">{log.agent || 'System'}</span>
										<span className="log-status">{log.status}</span>
										<span className="log-message">{log.message}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default BedrockFlowVisualizer;
