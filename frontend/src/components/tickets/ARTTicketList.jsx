import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/TicketList.css';

const ARTTicketList = () => {
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleteError, setDeleteError] = useState(null);

	const fetchTickets = async () => {
		try {
			// In a real application, this would fetch from an ART API endpoint
			// For now, we'll use the same endpoint as SIMBA tickets
			const response = await fetch('http://localhost:5000/api/tickets');

			if (!response.ok) {
				throw new Error('Failed to fetch ART tickets');
			}

			const data = await response.json();
			// Filter tickets to only include those with an art_id
			const artTickets = data.data.filter((ticket) => ticket.art_id);
			setTickets(artTickets);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTickets();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this ticket?')) {
			try {
				setDeleteError(null);
				const response = await fetch(
					`http://localhost:5000/api/tickets/${id}`,
					{
						method: 'DELETE',
					}
				);

				if (!response.ok) {
					throw new Error('Failed to delete ticket');
				}

				// Refresh the ticket list
				fetchTickets();
			} catch (err) {
				setDeleteError(err.message);
			}
		}
	};

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
		if (!category) return 'N/A';

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
		return <div className="loading">Loading ART tickets...</div>;
	}

	if (error) {
		return <div className="error-message">Error: {error}</div>;
	}

	if (tickets.length === 0) {
		return (
			<div className="no-tickets">
				<h2>No ART tickets found</h2>
				<p>Create a new ticket to get started.</p>
				<Link to="/art" className="create-ticket-button">
					Create ART Ticket
				</Link>
			</div>
		);
	}

	return (
		<div className="ticket-list-container">
			<div className="ticket-list-header">
				<h2>All ART Tickets</h2>
				<Link to="/art" className="create-ticket-button">
					Create ART Ticket
				</Link>
			</div>

			{deleteError && (
				<div className="error-message">
					Error deleting ticket: {deleteError}
				</div>
			)}

			<div className="ticket-table-container">
				<table className="ticket-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Title</th>
							<th>Request Type</th>
							<th>Priority</th>
							<th>Status</th>
							<th>ART Status</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{tickets.map((ticket) => (
							<tr key={ticket.art_id}>
								<td>{ticket.art_id}</td>
								<td>{ticket.title}</td>
								<td>{formatTicketCategory(ticket.ticket_category)}</td>
								<td>
									<span
										className={`priority-badge ${getPriorityClass(
											ticket.priority
										)}`}
									>
										{ticket.priority}
									</span>
								</td>
								<td>
									<span
										className={`status-badge ${getStatusClass(ticket.status)}`}
									>
										{ticket.status}
									</span>
								</td>
								<td>
									<span className="art-status">
										{ticket.art_status || 'N/A'}
									</span>
								</td>
								<td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
								<td>
									<div className="action-buttons">
										<Link
											to={`/art-tickets/${ticket.art_id}`}
											className="view-button"
										>
											View
										</Link>
										<button
											className="delete-button"
											onClick={() => handleDelete(ticket.simba_id)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ARTTicketList;
