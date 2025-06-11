import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../styles/TicketDetail.css';

const ARTTicketDetail = () => {
	const { id } = useParams();
	const [ticket, setTicket] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				// In a real application, this would fetch from an ART API endpoint
				// For now, we'll use the same endpoint as SIMBA tickets and filter by art_id
				const response = await fetch(`${API_BASE_URL}/api/tickets`);

				if (!response.ok) {
					throw new Error('Failed to fetch tickets');
				}

				const data = await response.json();

				// Find the ticket with the matching art_id
				const artTicket = data.data.find((ticket) => ticket.art_id === id);

				if (!artTicket) {
					throw new Error('ART ticket not found');
				}

				setTicket(artTicket);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTicket();
	}, [id]);

	const getPriorityClass = (priority) => {
		switch (priority) {
			case 'High':
				return 'priority-high';
			case 'Medium':
				return 'priority-medium';
			case 'Low':
				return 'priority-low';
			default:
				return '';
		}
	};

	const getStatusClass = (status) => {
		switch (status) {
			case 'Open':
				return 'status-open';
			case 'In Progress':
				return 'status-in-progress';
			case 'Resolved':
				return 'status-resolved';
			case 'Closed':
				return 'status-closed';
			default:
				return '';
		}
	};

	// Helper function to format ticket category for display
	const formatTicketCategory = (category) => {
		if (!category) return 'Not specified';

		switch (category) {
			case 'REQ-HR-ONBOARD':
				return 'HR Onboarding';
			case 'REQ-DEV-REPO':
				return 'Developer Repository';
			case 'REQ-MARKETING-CRM':
				return 'Marketing CRM';
			case 'REQ-FIN-APP':
				return 'Finance Application';
			default:
				return category;
		}
	};

	if (loading) {
		return <div className="loading">Loading ART ticket details...</div>;
	}

	if (error) {
		return <div className="error-message">Error: {error}</div>;
	}

	if (!ticket) {
		return <div className="error-message">ART Ticket not found</div>;
	}

	return (
		<div className="ticket-detail-container">
			<div className="ticket-detail-header">
				<div className="ticket-header-left">
					<h2>
						ART Ticket: <span className="ticket-id">{ticket.art_id}</span>
					</h2>
					<div className="ticket-meta">
						<span
							className={`priority-badge ${getPriorityClass(
								ticket.priority
							)} ticket-priority`}
						>
							{ticket.priority}
						</span>
						<span
							className={`status-badge ${getStatusClass(
								ticket.art_status
							)} ticket-status`}
						>
							{ticket.art_status}
						</span>
					</div>
				</div>
				<div className="ticket-header-right">
					<div className="ticket-actions">
						<Link to="/art-tickets" className="back-button">
							Back to ART Tickets
						</Link>
					</div>
				</div>
			</div>

			<div className="ticket-content">
				<div className="ticket-section">
					<h3>Title</h3>
					<p className="ticket-title">{ticket.title}</p>
				</div>

				<div className="ticket-section">
					<h3>Description</h3>
					<p className="ticket-description">{ticket.description}</p>
				</div>

				<div className="ticket-section ticket-details">
					<h3>Details</h3>
					<div className="detail-grid">
						<div className="detail-item">
							<span className="detail-label">Request Type:</span>
							<span className="detail-value ticket-ticket-category">
								{formatTicketCategory(ticket.ticket_category)}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Requested Resource:</span>
							<span className="detail-value ticket-requested-resource">
								{ticket.requested_resource || 'Not specified'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Access Level:</span>
							<span className="detail-value ticket-access-level">
								{ticket.access_level || 'Not specified'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Created:</span>
							<span className="detail-value ticket-created-at">
								{new Date(ticket.createdAt).toLocaleString()}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Updated:</span>
							<span className="detail-value ticket-updated-at">
								{new Date(ticket.updatedAt).toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				<div className="ticket-section">
					<h3>Requester Information</h3>
					<div className="detail-grid">
						<div className="detail-item">
							<span className="detail-label">First Name:</span>
							<span className="detail-value ticket-first-name">
								{ticket.firstName ||
									ticket.requesterName?.split(' ')[0] ||
									'N/A'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Last Name:</span>
							<span className="detail-value ticket-last-name">
								{ticket.lastName ||
									(ticket.requesterName?.split(' ').length > 1
										? ticket.requesterName.split(' ').slice(1).join(' ')
										: 'N/A')}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">User ID:</span>
							<span className="detail-value ticket-user-id">
								{ticket.user_id || ticket.requesterEmail || 'N/A'}
							</span>
						</div>
					</div>
				</div>

				<div className="ticket-section">
					<h3>System Information</h3>
					<div className="detail-grid">
						<div className="detail-item">
							<span className="detail-label">SIMBA ID:</span>
							<span className="detail-value ticket-simba-id">
								{ticket.simba_id || 'Not assigned'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">SIMBA Status:</span>
							<span className="detail-value ticket-simba-status">
								{ticket.simba_status || 'Not set'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">ART ID:</span>
							<span className="detail-value ticket-art-id">
								{ticket.art_id || 'Not assigned'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">ART Status:</span>
							<span className="detail-value ticket-art-status">
								{ticket.art_status || 'Not set'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Provisioning Outcome:</span>
							<span className="detail-value ticket-provisioning-outcome">
								{ticket.provisioning_outcome || 'None'}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Remediation Needed:</span>
							<span className="detail-value ticket-remediation-needed">
								{ticket.remediation_needed || 'None'}
							</span>
						</div>
					</div>
				</div>

				{ticket.error_details &&
					ticket.error_details.code &&
					ticket.error_details.code !== 'NO_ERROR' && (
						<div className="ticket-section error-section">
							<h3>Error Details</h3>
							<div className="detail-grid">
								<div className="detail-item">
									<span className="detail-label">Error Code:</span>
									<span className="detail-value ticket-error-code">
										{ticket.error_details.code}
									</span>
								</div>
								<div className="detail-item">
									<span className="detail-label">Error Message:</span>
									<span className="detail-value ticket-error-message">
										{ticket.error_details.message}
									</span>
								</div>
							</div>
						</div>
					)}

				{ticket.workflow_state && ticket.workflow_state.length > 0 && (
					<div className="ticket-section">
						<h3>Workflow State</h3>
						<div className="workflow-state">
							{ticket.workflow_state.map((state, index) => (
								<div key={index} className="workflow-node">
									<h4>{state.current_node}</h4>
									<ul>
										{state.steps_completed.map((step, stepIndex) => (
											<li key={stepIndex}>{step}</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ARTTicketDetail;
