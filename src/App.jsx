import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import KanjiList from './components/KanjiList';
import KanjiForm from './components/KanjiForm';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<KanjiList />} />
            <Route path="/add" element={<KanjiForm />} />
            <Route path="/edit/:id" element={<KanjiForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
