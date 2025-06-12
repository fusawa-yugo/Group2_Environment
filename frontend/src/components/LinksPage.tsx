import { Link } from 'react-router-dom';

const LinksPage = () => {
  return (
    <div className="flex flex-col items-start space-y-2">
      <Link to="/map" className="text-blue-500 hover:underline">
        Map Page
      </Link>
      <Link to="/template" className="text-blue-500 hover:underline">
        Map Page Template
      </Link>
    </div>
  );
};

export default LinksPage;