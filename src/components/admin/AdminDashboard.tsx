// import LandingPage from "./modules/LandingPage.tsx"

// import LoginPage from "../LoginPage"
import Sidebar from "../common/Sidebar"
// import ManageCandidatesPage from "./CandidatesManagement"
// import ManageElectionsPage from "./ElectionManagement"
import AdminHome from "./AdminHome"
// import ManageUsersPage from "./UserManagement"

const AdminDashboard = () => {
    return (
        <>
            <Sidebar children={<AdminHome />} />
        </>
    )
}

export default AdminDashboard
