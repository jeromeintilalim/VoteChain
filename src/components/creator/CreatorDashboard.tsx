import Sidebar from "../common/Sidebar"
import ProfileManagement from "./ProfileManagement"
// import ViewResults from "./ViewResults"
// import CreatorElectionsManagementPage from "./CreatorElectionsManagementPage"
// import CreatorHome from "./CreatorHome"

const CreatorDashboard = () => {
    return (
        <>
            <Sidebar children={<ProfileManagement />} />
        </>
    )
}

export default CreatorDashboard
