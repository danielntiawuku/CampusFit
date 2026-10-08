import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';

// --- Google Stitch screens (ported 1:1 by scripts/convert_stitch.py) -------
import Splash from './screens/06_CampusFit_Splash_Screen';
import CreateAccount from './screens/07_Create_Account';
import LogIn from './screens/08_Log_In';
import StudentVerification from './screens/09_Student_Verification';
import OtpVerification from './screens/10_OTP_Verification';
import OnboardingInterests from './screens/11_Onboarding_Interests';
import Dashboard from './screens/01_Student_Dashboard';
import FitClipsInspiration from './screens/02_FitClips_Inspiration';
import FitTripExplorer from './screens/03_FitTrip_Explorer';
import ActivityStats from './screens/04_Activity_Stats';
import LogoMark from './screens/05_CampusFit_Logo_Mark';
import FitTripMap from './screens/12_FitTrip_Explorer_Map';
import FitClipsFeed from './screens/13_FitClips_Vertical_Feed';
import FitTripSearch from './screens/14_FitTrip_Explorer_Search';
import StudentProfile from './screens/15_Student_Profile';
import ClubDashboard from './screens/16_Club_Dashboard';
import Settings from './screens/17_Settings';
import HelpFaq from './screens/18_Help_FAQ';
import ReportProblem from './screens/19_Report_a_Problem';
import SubmissionSuccess from './screens/20_Submission_Success';

// --- Thesis gamification screens (QR checkpoints, points, badges, admin) ---
import ScanCheckpoint from './screens/gamification/ScanCheckpoint';
import Leaderboard from './screens/gamification/Leaderboard';
import BadgeShelf from './screens/gamification/BadgeShelf';
import AdminDashboard from './screens/gamification/AdminDashboard';

// --- Production screens missing from the Stitch export (same design system) -
import Notifications from './screens/Notifications';
import NotificationDetail from './screens/NotificationDetail';
import ForgotPassword from './screens/ForgotPassword';
import EditProfile from './screens/EditProfile';
import RecordClip from './screens/RecordClip';
import Privacy from './screens/Privacy';
import ChallengesDashboard from './screens/ChallengesDashboard';
import CreateChallenge from './screens/CreateChallenge';
import ChallengeDetail from './screens/ChallengeDetail';
import WorkoutSchedule from './screens/WorkoutSchedule';
import AdminReports from './screens/AdminReports';
import AdminCheckpoints from './screens/AdminCheckpoints';
import AdminClubs from './screens/AdminClubs';
import AdminStudents from './screens/AdminStudents';
import MapboxDashboard from './screens/MapboxDashboard';

// --- Detail screens (reached by tapping cards in the list screens) --------
import ClubDetail from './screens/ClubDetail';
import CheckpointDetail from './screens/CheckpointDetail';
import FitClipDetail from './screens/FitClipDetail';
import FitTripDetail from './screens/FitTripDetail';
import WorkoutDetail from './screens/WorkoutDetail';

/** Detail screens take a single id prop — map it from the URL. */
function ClubDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ClubDetail clubId={id ?? ''} />;
}
function CheckpointDetailRoute() {
  const { code } = useParams<{ code: string }>();
  return <CheckpointDetail checkpointCode={code} />;
}
function FitClipDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <FitClipDetail clipId={id ?? ''} />;
}
function FitTripDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <FitTripDetail tripId={id ?? ''} />;
}
function WorkoutDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <WorkoutDetail tripId={id} />;
}
function ChallengeDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ChallengeDetail challengeId={id ?? ''} />;
}

/** Routes reachable without an account. */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/verify',
  '/otp',
  '/onboarding',
  '/logo',
  '/privacy',
];

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-frame">
        <div className="flex flex-1 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary-container">
            progress_activity
          </span>
        </div>
      </div>
    );
  }

  if (!session && !profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  // Screens with their own back-button header don't show the tab bar.
  const NO_NAV = [
    '/settings',
    '/help',
    '/report',
    '/report/done',
    '/verify',
    '/otp',
    '/onboarding',
    '/stats',
    '/clubs',
    '/leaderboard',
    '/badges',
    '/admin',
    '/explore/map',
    '/explore/search',
    '/notifications',
    '/challenges',
    '/edit-profile',
    '/privacy',
    '/record',
    '/forgot-password',
  ];
  // Pushed stack views (detail screens) hide the tab bar too.
  const DETAIL_PREFIXES = [
    '/notifications/',
    '/clubs/',
    '/trip/',
    '/clip/',
    '/checkpoint/',
    '/workout/',
    '/challenges/',
    '/admin/',
  ];
  const showNav =
    !isPublic &&
    !NO_NAV.includes(location.pathname) &&
    !DETAIL_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <div className="app-frame">
      <div className={showNav ? 'screen' : 'flex min-h-[100dvh] flex-1 flex-col'}>
        <Routes>
          {/* ---------------------------------------------------- onboarding */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<CreateAccount />} />
          <Route path="/verify" element={<StudentVerification />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/onboarding" element={<OnboardingInterests />} />
          <Route path="/logo" element={<LogoMark />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ------------------------------------------------------ core app */}
          <Route path="/home" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/feed" element={<RequireAuth><FitClipsInspiration /></RequireAuth>} />
          <Route path="/clips" element={<RequireAuth><FitClipsFeed /></RequireAuth>} />
          <Route path="/explore" element={<RequireAuth><FitTripExplorer /></RequireAuth>} />
          <Route path="/explore/map" element={<RequireAuth><FitTripMap /></RequireAuth>} />
          <Route path="/explore/search" element={<RequireAuth><FitTripSearch /></RequireAuth>} />
          <Route path="/stats" element={<RequireAuth><ActivityStats /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><StudentProfile /></RequireAuth>} />
          <Route path="/clubs" element={<RequireAuth><ClubDashboard /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/help" element={<RequireAuth><HelpFaq /></RequireAuth>} />
          <Route path="/report" element={<RequireAuth><ReportProblem /></RequireAuth>} />
          <Route path="/report/done" element={<RequireAuth><SubmissionSuccess /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/notifications/:id" element={<RequireAuth><NotificationDetail /></RequireAuth>} />
          <Route path="/edit-profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/record" element={<RequireAuth><RecordClip /></RequireAuth>} />

          {/* --------------------------------------- thesis gamification loop */}
          <Route path="/scan" element={<RequireAuth><ScanCheckpoint /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
          <Route path="/badges" element={<RequireAuth><BadgeShelf /></RequireAuth>} />          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/reports" element={<RequireAuth><AdminReports /></RequireAuth>} />
          <Route path="/admin/checkpoints" element={<RequireAuth><AdminCheckpoints /></RequireAuth>} />
          <Route path="/admin/clubs" element={<RequireAuth><AdminClubs /></RequireAuth>} />
          <Route path="/admin/students" element={<RequireAuth><AdminStudents /></RequireAuth>} />
          <Route path="/admin/qr" element={<RequireAuth><AdminCheckpoints /></RequireAuth>} />
          <Route path="/challenges" element={<RequireAuth><ChallengesDashboard /></RequireAuth>} />
          <Route path="/challenges/new" element={<RequireAuth><CreateChallenge /></RequireAuth>} />
          <Route path="/challenges/:id" element={<RequireAuth><ChallengeDetailRoute /></RequireAuth>} />
          <Route path="/workout" element={<RequireAuth><WorkoutSchedule /></RequireAuth>} />
          <Route path="/map" element={<RequireAuth><MapboxDashboard /></RequireAuth>} />

          {/* ------------------------------------------------- detail screens */}
          <Route path="/clubs/:id" element={<RequireAuth><ClubDetailRoute /></RequireAuth>} />
          <Route path="/checkpoint/:code" element={<RequireAuth><CheckpointDetailRoute /></RequireAuth>} />
          <Route path="/clip/:id" element={<RequireAuth><FitClipDetailRoute /></RequireAuth>} />
          <Route path="/trip/:id" element={<RequireAuth><FitTripDetailRoute /></RequireAuth>} />
          <Route path="/workout/:id" element={<RequireAuth><WorkoutDetailRoute /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
