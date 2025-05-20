import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/TicketList.css';

const TicketList = () => {
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const response = await fetch('http://localhost:5000/api/tickets');

				if (!response.ok) {
					throw new Error('Failed to fetch tickets');
				}

				const data = await response.json();
				setTickets(data.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTickets();
	}, []);

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

	if (loading) {
		return <div className="loading">Loading tickets...</div>;
	}

	if (error) {
		return <div className="error-message">Error: {error}</div>;
	}

	if (tickets.length === 0) {
		return (
			<div className="no-tickets">
				<h2>No tickets found</h2>
				<p>Create a new ticket to get started.</p>
				<Link to="/tickets/new" className="create-ticket-button">
					Create Ticket
				</Link>
			</div>
		);
	}

	return (
		<div className="ticket-list-container">
			<div className="ticket-list-header">
				<h2>All Tickets</h2>
				<Link to="/tickets/new" className="create-ticket-button">
					Create Ticket
				</Link>
			</div>

			<div className="ticket-table-container">
				<table className="ticket-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Title</th>
							<th>Category</th>
							<th>Priority</th>
							<th>Status</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{tickets.map((ticket) => (
							<tr key={ticket.ticketId}>
								<td>{ticket.ticketId}</td>
								<td>{ticket.title}</td>
								<td>{ticket.category}</td>
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
								<td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
								<td>
									<div className="action-buttons">
										<Link
											to={`/tickets/${ticket.ticketId}`}
											className="view-button"
										>
											View
										</Link>
										<Link
											to={`/tickets/${ticket.ticketId}/scrape`}
											className="scrape-button"
										>
											Scrape
										</Link>
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

export default TicketList;
