import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DeckList from './pages/DeckList';
import DeckDetail from './pages/DeckDetail';
import Study from './pages/Study';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeckList />} />
        <Route path="/deck/:id" element={<DeckDetail />} />
        <Route path="/deck/:id/study" element={<Study />} />
      </Routes>
    </BrowserRouter>
  );
}
