import "./App.css";
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// --- 페이지 및 컴포넌트 임포트 ---
import MainPage from "./Page/MainPage/MainPage.jsx";
import About from "./Page/About/About.jsx";
import Leadership from "./Page/Leadership/Leadership.jsx";
import Board from "./Page/Board/Board.jsx";
import Services from "./Page/Services/Services.jsx";
import Contact from "./Page/Contact/Contact.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import SinglePost from "./Page/SinglePost/SinglePost.jsx";
import HobbyRecommend from "./Page/HobbyRecommend/HobbyRecommend.jsx";
import Login from './Page/Auth/Login.jsx';
import Signup from './Page/Auth/Signup.jsx';
import Meetings from './Page/Meetings/Meetings.jsx';
import MeetingDetail from './Page/MeetingDetail/MeetingDetail.jsx';
import CreateMeeting from './Page/CreateMeeting/CreateMeeting.jsx';
import MyPage from './Page/Mypage/MyPage.jsx';
import ProfileEdit from "./Page/ProfileEdit/ProfileEdit.jsx";
import MeetingRecommend from "./Page/MeetingRecommend/MeetingRecommend.jsx";

// --- 관리자 페이지 임포트 ---
import AdminLogin from "./Page/Admin/AdminLogin.jsx";
import AdminLayout from "./Components/AdminLayout/AdminLayout.jsx";
import AdminRoute from "./Components/AdminRoute/AdminRoute.jsx";
import AdminDashboard from "./Page/Admin/AdminDashboard.jsx";
import AdminContacts from "./Page/Admin/AdminContacts.jsx";
import AdminPosts from "./Page/Admin/AdminPosts.jsx";
import AdminCreatePost from "./Page/Admin/AdminCreatePost.jsx";
import AdminEditPost from "./Page/Admin/AdminEditPost.jsx";


// --- 라우트 보호 로직 ---
const GuestRoute = () => {
  const { user } = useAuth();
  // 사용자가 로그인 상태이면 메인 페이지로 보냅니다.
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

const UserProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- 레이아웃 컴포넌트 ---
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

// --- 메인 앱 컴포넌트 ---
function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">보안 및 인증 상태 확인 중...</div>;
  }

  return (
    <Routes>
      {/* --- 일반 사용자 페이지 --- */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MainPage />} />
        <Route path="about" element={<About />} />
        <Route path="recommend" element={<HobbyRecommend />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="board" element={<Board />} />
        <Route path="post/:id" element={<SinglePost />} />
        <Route path="our-services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        
        {/* 로그인이 필요한 사용자 페이지 */}
        <Route element={<UserProtectedRoute />}>
          <Route path="meetings/create" element={<CreateMeeting />} />
          <Route path="meetings/recommend" element={<MeetingRecommend />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="profile/edit" element={<ProfileEdit />} /> 
        </Route>
      </Route>

      {/* --- 로그인/회원가입 페이지 (로그인 안 한 사용자만 접근) --- */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      {/* --- 관리자 전용 페이지 --- */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/create" element={<AdminCreatePost />} />
          <Route path="posts/edit/:id" element={<AdminEditPost />} />
          <Route path="contacts" element={<AdminContacts />} />
          {/* 여기에 사용자, 모임 관리 페이지 라우트를 추가할 수 있습니다. */}
          {/* <Route path="users" element={<AdminUserList />} /> */}
          {/* <Route path="meetings" element={<AdminMeetingList />} /> */}
        </Route>
      </Route>
      
      {/* 일치하는 경로가 없을 경우 메인 페이지로 리디렉션 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
