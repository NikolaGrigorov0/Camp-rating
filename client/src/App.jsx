import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/Home';
import SearchBarWithMap from './components/SearchBarWithMap';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import CampsPage from './components/CampsPage';
import CampDetails from './components/CampDetails';
import FavoritesPage from './components/FavoritesPage';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchBarWithMap />} />
        <Route path="/camps" element={<CampsPage />} />
        <Route path="/campgrounds/:id" element={<CampDetails />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;