import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Sidebar from "./components/common/Sidebar.tsx";
import PrivateRoute from "./components/login/PrivateRoute.tsx";
import CreatorDashboard from "./components/user/CreatorDashboard.tsx";
import ManageCreatorElectionsPage from "./components/user/CreatorElectionsManagementPage.tsx";
import ElectionSettingsPage from "./components/user/ElectionSettings.tsx";
import VotePage from "./components/voter/VotePage.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<CreatorDashboard />} />
          <Route path="/elections" element={<Sidebar><ManageCreatorElectionsPage /></Sidebar>} />
          <Route path="/elections/:electionId" element={<Sidebar><ElectionSettingsPage /></Sidebar>} />
          <Route path="/vote/:electionId" element={<Sidebar><VotePage /></Sidebar>} />
        </Route>
        {/* Add more protected routes here */}
      </Routes>
    </Router>
  );
}

export default App;
