import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Home from './components/Home';
import KanjiList from './components/KanjiList';
import Practice from './components/Practice';
import About from './components/About';
import Navbar from './components/Navbar';
import KanjiForm from './components/KanjiForm';
import KanjiGallery from './components/KanjiGallery';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<KanjiList />} />
            <Route path="/add" element={<KanjiForm />} />
            <Route path="/edit/:id" element={<KanjiForm />} />
            <Route path="/gallery" element={<KanjiGallery />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
