import { useParams } from 'react-router-dom';
import TicketScraper from '../../components/tickets/TicketScraper';
import '../../styles/PageContainer.css';

const TicketScraperPage = () => {
	const { id } = useParams();

	return (
		<div className="page-container">
			<TicketScraper />
		</div>
	);
};

export default TicketScraperPage;
