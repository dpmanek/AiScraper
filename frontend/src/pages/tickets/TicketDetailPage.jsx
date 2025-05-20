import { useParams } from 'react-router-dom';
import TicketDetail from '../../components/tickets/TicketDetail';
import '../../styles/PageContainer.css';

const TicketDetailPage = () => {
	const { id } = useParams();

	return (
		<div className="page-container">
			<TicketDetail />
		</div>
	);
};

export default TicketDetailPage;
