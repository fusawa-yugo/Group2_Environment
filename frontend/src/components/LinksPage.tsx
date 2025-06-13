import { Link } from 'react-router-dom';

const LinksPage = () => {
  return (
    <div className="flex flex-col items-start space-y-2">
      <Link to="/map" className="text-blue-500 hover:underline">
        Map (real data)
      </Link>
      <Link to="/template" className="text-blue-500 hover:underline">
        Map Demo (all areas / old version)
      </Link>
    </div>
  );
};

export default LinksPage;