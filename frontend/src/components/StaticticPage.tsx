import { useParams } from 'react-router-dom';

const StatisticPage: React.FC = () => {
	const { areaId } = useParams<{ areaId: string }>();
  return (
    <div>
      <h1>Statistics for Area: {areaId}</h1>
    </div>
  );
};

export default StatisticPage;