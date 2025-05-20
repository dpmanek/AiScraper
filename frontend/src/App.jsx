import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FormFeeder from './components/FormFeeder';
import './App.css';

function App() {
	return (
		<Router>
			<div className="app-container">
				<Navbar />

				<header>
					<h1>Website Content Analyzer</h1>
					<p className="subtitle">
						Extract and analyze content from websites using AI
					</p>
				</header>

				<main>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/form-feeder" element={<FormFeeder />} />
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
