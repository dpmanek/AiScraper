import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../styles/TicketScraper.css';

const TicketScraper = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [ticket, setTicket] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [scraping, setScraping] = useState(false);
	const [scrapedData, setScrapedData] = useState(null);
	const [scrapeError, setScrapeError] = useState(null);

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`);

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
		setScrapedData(null);
		setScrapeError(null);

		try {
			const response = await fetch(`${API_BASE_URL}/api/scrape/${id}`, {
				method: 'POST',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to scrape ticket');
			}

			setScrapedData(data.data.scrapedData);
		} catch (err) {
			setScrapeError(err.message);
		} finally {
			setScraping(false);
		}
	};

	const handleUseInFormFeeder = () => {
		navigate('/form-feeder', { state: { scrapedData } });
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
		<div className="ticket-scraper-container">
			<div className="scraper-header">
				<h2>Scrape Ticket: {ticket.simba_id}</h2>
				<div className="header-actions">
					<Link to={`/tickets/${id}`} className="back-button">
						Back to Ticket
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

			{scrapeError && (
				<div className="error-message">
					Error scraping ticket: {scrapeError}
				</div>
			)}

			<div className="scraper-content">
				<div className="ticket-preview">
					<h3>Ticket Preview</h3>
					<div className="preview-content">
						<div className="preview-item">
							<span className="preview-label">Title:</span>
							<span className="preview-value">{ticket.title}</span>
						</div>
						<div className="preview-item">
							<span className="preview-label">Description:</span>
							<p className="preview-value">{ticket.description}</p>
						</div>
						<div className="preview-item">
							<span className="preview-label">Request Type:</span>
							<span className="preview-value">{ticket.ticket_category}</span>
						</div>
						<div className="preview-item">
							<span className="preview-label">Priority:</span>
							<span className="preview-value">{ticket.priority}</span>
						</div>
						<div className="preview-item">
							<span className="preview-label">SIMBA Status:</span>
							<span className="preview-value">{ticket.simba_status}</span>
						</div>
						<div className="preview-item">
							<span className="preview-label">Requester:</span>
							<span className="preview-value">
								{ticket.firstName} {ticket.lastName} ({ticket.user_id})
							</span>
						</div>
					</div>
				</div>

				{scrapedData && (
					<div className="scraped-data">
						<h3>Scraped Data</h3>
						<div className="scraped-content">
							<pre>{JSON.stringify(scrapedData, null, 2)}</pre>
							<div className="scraped-actions">
								<button
									className="use-data-button"
									onClick={handleUseInFormFeeder}
								>
									Use in Form Feeder
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default TicketScraper;
