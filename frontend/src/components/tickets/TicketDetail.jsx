import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../../styles/TicketDetail.css';

const TicketDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [ticket, setTicket] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [scraping, setScraping] = useState(false);
	const [scrapeSuccess, setScrapeSuccess] = useState(false);
	const [scrapeError, setScrapeError] = useState(null);
	const [scrapedData, setScrapedData] = useState(null);
	const [showScrapedData, setShowScrapedData] = useState(false);
	// Removed caching states as we always want to scrape fresh data

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				const response = await fetch(`http://localhost:5000/api/tickets/${id}`);

				if (!response.ok) {
					throw new Error('Failed to fetch ticket');
				}

				const data = await response.json();
				setTicket(data.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTicket();
	}, [id]);

	const handleScrape = async () => {
		setScraping(true);
		setScrapeSuccess(false);
		setScrapeError(null);
		setScrapedData(null);
		setShowScrapedData(false);
		// Removed setFromCache(false) as we no longer use caching

		try {
			// Always scrape fresh data
			const url = `http://localhost:5000/api/scrape/${id}`;

			const response = await fetch(url, {
				method: 'POST',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to scrape ticket');
			}

			setScrapeSuccess(true);
			setScrapedData(data.data.scrapedData);
			setShowScrapedData(true);
		} catch (err) {
			setScrapeError(err.message);
		} finally {
			setScraping(false);
		}
	};

	const handleFillForm = () => {
		navigate('/art', {
			state: { scrapedData: scrapedData },
		});
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

	if (loading) {
		return <div className="loading">Loading ticket details...</div>;
	}

	if (error) {
		return <div className="error-message">Error: {error}</div>;
	}

	if (!ticket) {
		return <div className="error-message">Ticket not found</div>;
	}

	return (
		<div className="ticket-detail-container">
			<div className="ticket-detail-header">
				<div className="ticket-header-left">
					<h2>
						Ticket: <span className="ticket-id">{ticket.ticketId}</span>
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
								ticket.status
							)} ticket-status`}
						>
							{ticket.status}
						</span>
					</div>
				</div>
				<div className="ticket-header-right">
					<div className="ticket-actions">
						<Link to="/tickets" className="back-button">
							Back to Tickets
						</Link>
						<button
							className="scrape-button"
							onClick={handleScrape}
							disabled={scraping}
						>
							{scraping ? 'Scraping...' : 'Scrape Ticket Data'}
						</button>
					</div>
				</div>
			</div>

			{scrapeError && (
				<div className="error-message">
					Error scraping ticket: {scrapeError}
				</div>
			)}

			{scrapeSuccess && (
				<div className="success-message">Ticket data scraped successfully!</div>
			)}

			{showScrapedData && scrapedData && (
				<div className="scraped-data-section">
					<h3>Scraped Data</h3>
					<pre className="json-display">
						{JSON.stringify(scrapedData, null, 2)}
					</pre>
					<button className="fill-form-button" onClick={handleFillForm}>
						Fill Form with this Data
					</button>
				</div>
			)}

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
							<span className="detail-label">Category:</span>
							<span className="detail-value ticket-category">
								{ticket.category}
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
							<span className="detail-label">Name:</span>
							<span className="detail-value ticket-requester-name">
								{ticket.requesterName}
							</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Email:</span>
							<span className="detail-value ticket-requester-email">
								{ticket.requesterEmail}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketDetail;
