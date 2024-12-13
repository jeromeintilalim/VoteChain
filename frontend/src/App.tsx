import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Sidebar from "./components/common/Sidebar";
import PrivateRoute from "./components/login/PrivateRoute";
import ManageCreatorElectionsPage from "./components/user/CreatorElectionsManagementPage";
import ElectionSettingsPage from "./components/user/ElectionSettings";
import VotePage from "./components/voter/VotePage";
import VoterHome from './components/voter/VoterHome';
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import ElectionsPage from './components/voter/ElectionsPage';
import ErrorPage from './components/voter/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Sidebar><VoterHome /></Sidebar>} />
          <Route path="/elections" element={<Sidebar><ManageCreatorElectionsPage /></Sidebar>} />
          <Route path="/elections/:joinCode" element={<Sidebar><ElectionSettingsPage /></Sidebar>} />
          <Route path="/vote/:joinCode" element={<Sidebar><VotePage /></Sidebar>} />
          <Route path="/voterelections" element={<Sidebar><ElectionsPage /></Sidebar>} />
          <Route path="/404" element={<ErrorPage />} />
        </Route>
        {/* Add more protected routes here */}
      </Routes>
    </Router>
  );
}

export default App;
