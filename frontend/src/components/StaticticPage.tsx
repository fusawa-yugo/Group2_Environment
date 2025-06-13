import { useParams, Link } from 'react-router-dom';

import MockGragh from '../assets/mock/mock_gragh.png';

const StatisticPage: React.FC = () => {
	const { areaId } = useParams<{ areaId: string }>();
  return (
    <div className="flex flex-col items-center p-5">
			<Link to="/map" className="text-blue-500 hover:underline mb-4 self-start">
				← Back
			</Link>
      <h1 className="font-semibold mb-4">Statistics for Area: {areaId}</h1>
			<div className="grid grid-cols-2 gap-4 w-full">
				<img src={MockGragh} alt="Mock Graph" />
			</div>
    </div>
  );
};

export default StatisticPage;