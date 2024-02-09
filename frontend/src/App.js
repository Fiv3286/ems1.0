import SessionSelection from './pages/SessionSelection'
import FillingASession from './pages/FillingASession'
import SchedulingFromScratch from './pages/SchedulingFromScratch'
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage'
import Login from './pages/Login'
import CommitteePage from './pages/CommitteePage'
import OverviewPage from './pages/OverviewPage'
import OverviewOfCommitteesPage from './pages/OverviewOfCommitteesPage'
import MainPageChair from './pages/MainPageChair'
import RequireAuth from './components/RequireAuth'
import ConsistentLogin from './components/ConsistentLogin';
import ErrorPage from './pages/ErrorPage';
import GeneralOverviewCommitteeMembers from './pages/GeneralOverviewCommitteeMembers';
import ScheduleSelection from './pages/ScheduleSelection';
import CommitteeSelection from './pages/CommitteeSelection'
import ExistingScheduleMariekeView from './pages/ExistingScheduleMariekeView';
import NewCommitteeCreation from './pages/CommitteeCreation';
import EditSelectionCommitteeProcess from './pages/EditSelectionCommitteeProcess';
import AccountManagement from './pages/AccountManagement';

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path='/' element={<Login/>}/>  

      <Route element={<ConsistentLogin/>}>
        {/* Routes for an admin user (Marieke's view) */}
        <Route element={<RequireAuth expectedUserType={'admin'}/>}>
          <Route exact path="/admin/:year/mainpage" element={<MainPage/>}/>
          <Route exact path='/admin/:year/committee-creation' element={<NewCommitteeCreation/>}/>
          <Route exact path='/admin/:year/overview-committee-members' element={<OverviewOfCommitteesPage/>}/>
          <Route exact path='/admin/:year/generalOverview' element={<GeneralOverviewCommitteeMembers/>}/>
          <Route exact path='/admin/:year/detailed-overview' element={<ExistingScheduleMariekeView/>}/>
          <Route exact path='/admin/:year/conference-creation' element={<SchedulingFromScratch/>}/>
          <Route exact path='/admin/:year/editCommittee' element={<EditSelectionCommitteeProcess/>}/>
          <Route exact path='/admin/:year/account-management' element={<AccountManagement/>}/>
        </Route>
        
        {/* Routes for non-admin users (Chair's view) */}
        <Route element={<RequireAuth expectedUserType={'non_admin'}/>}>
          <Route exact path="/chair/mainpage" element={<MainPageChair/>}/>
          <Route exact path="/chair/scheduleSelection" element={<ScheduleSelection/>}/>
          <Route exact path="/chair/committeeSelection" element={<CommitteeSelection/>}/>
          <Route exact path="/chair/:committee/:year/program" element={<SessionSelection/>}/>
          <Route exact path="/chair/:committee/:year/selection" element={<CommitteePage/>}/>
          <Route exact path="/chair/:committee/:year/session/:id" element={<FillingASession/>}/>
          <Route exact path='/chair/:committee/:year/overview' element={<OverviewPage/>}/>
        </Route>
      </Route>

      <Route path='*' element={<ErrorPage/>}/>

    </Routes>
  );
}

export default App;
