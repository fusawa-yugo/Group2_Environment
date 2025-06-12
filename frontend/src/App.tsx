import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPageTemplate from "./components/MapPageTemplate";
import MapPage from './components/MapPage';
import LinksPage from './components/LinksPage';
import StatisticPage from './components/StaticticPage';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LinksPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/template" element={<MapPageTemplate />} />
          <Route path="/statistics/:areaId" element={<StatisticPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;