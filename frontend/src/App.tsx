import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPageTemplate from "./components/MapPageTemplate";
import MapPage from './components/MapPage';
import LinksPage from './components/LinksPage';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LinksPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/template" element={<MapPageTemplate />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;