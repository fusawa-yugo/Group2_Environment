import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPage from "./components/MapPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;