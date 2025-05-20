import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
	return (
		<nav className="navbar">
			<div className="navbar-container">
				<Link to="/" className="navbar-logo">
					Website Content Analyzer
				</Link>
				<ul className="nav-menu">
					<li className="nav-item">
						<Link to="/" className="nav-link">
							Home
						</Link>
					</li>
					<li className="nav-item">
						<Link to="/form-feeder" className="nav-link">
							Form Feeder
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Navbar;
