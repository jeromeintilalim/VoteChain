import Sidebar from "../common/Sidebar"
import VotePage from "./VotePage"
import ElectionsPage from "./ElectionsPage"
// import ViewResultsPage from "./ViewResults"
// import VoterProfilePage from "./VoterProfile"
// import VoterHome from "./VoterHome"

const VoterDashboard = () => {
    return (
        <>
            <Sidebar children={<ElectionsPage />} />
        </>
    )
}

export default VoterDashboard
