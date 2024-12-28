import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Sidebar from "./components/common/Sidebar";
import PrivateRoute from "./components/login/PrivateRoute";
import PublicRoute from "./components/login/PublicRoute";  // Import the new component
import ManageCreatorElectionsPage from "./components/user/CreatorElectionsManagementPage";
import ElectionSettingsPage from "./components/user/ElectionSettings";
import ElectionsPage from './components/voter/ElectionsPage';
import ErrorPage from './components/voter/NotFoundPage';
import VotePage from "./components/voter/VotePage";
import VoterHome from './components/voter/VoterHome';
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import AccountSettings from './components/user/AccountSettings';
import ResultsPage from './components/voter/ResultsPage';
import VerifyMerklePage from './components/voter/VerifyMerklePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - accessible only to non-authenticated users */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Private Routes - accessible only to authenticated users */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Sidebar><VoterHome /></Sidebar>} />
          <Route path="/elections" element={<Sidebar><ManageCreatorElectionsPage /></Sidebar>} />
          <Route path="/elections/:joinCode" element={<Sidebar><ElectionSettingsPage /></Sidebar>} />
          <Route path="/vote/:joinCode" element={<Sidebar><VotePage /></Sidebar>} />
          <Route path="/results/:joinCode" element={<Sidebar><ResultsPage /></Sidebar>} />
          <Route path="/vote/:joinCode" element={<Sidebar><VotePage /></Sidebar>} />
          <Route path="/voterelections" element={<Sidebar><ElectionsPage /></Sidebar>} />
          <Route path="/accountsettings" element={<Sidebar><AccountSettings /></Sidebar>} />
          <Route path="/verify" element={<Sidebar><VerifyMerklePage /></Sidebar>} />
        </Route>

        {/* Catch-all for 404 page */}
        <Route path="/*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
