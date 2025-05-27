import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ART from './components/ART';
import TicketsPage from './pages/tickets/TicketsPage';
import NewTicketPage from './pages/tickets/NewTicketPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import ARTTicketDetailPage from './pages/tickets/ARTTicketDetailPage';
import ARTTicketsPage from './pages/tickets/ARTTicketsPage';
import TicketScraperPage from './pages/tickets/TicketScraperPage';
import './App.css';

function App() {
	return (
		<Router>
			<div className="app-container">
				<Navbar />

				<header>
					<h1>Website Content Scraper and Analyzer</h1>
					<p className="subtitle">
						Extract and analyze content from websites using AI
					</p>
				</header>

				<main>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/art" element={<ART />} />
						<Route path="/art-tickets" element={<ARTTicketsPage />} />
						<Route path="/tickets" element={<TicketsPage />} />
						<Route path="/tickets/new" element={<NewTicketPage />} />
						<Route path="/tickets/:id" element={<TicketDetailPage />} />
						<Route path="/tickets/:id/scrape" element={<TicketScraperPage />} />
						<Route path="/art-tickets/:id" element={<ARTTicketDetailPage />} />
					</Routes>
				</main>

				<footer>
					<p>Powered by OCR, Web Scraping, and AI Analysis</p>
				</footer>
			</div>
		</Router>
	);
}

export default App;
