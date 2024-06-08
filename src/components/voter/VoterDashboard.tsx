import Sidebar from "../common/Sidebar"
import VotePage from "./VotePage"
// import ViewResultsPage from "./ViewResults"
// import VoterProfilePage from "./VoterProfile"
// import VoterHome from "./VoterHome"

const VoterDashboard = () => {
    return (
        <>
            <Sidebar children={<VotePage />} />
        </>
    )
}

export default VoterDashboard
