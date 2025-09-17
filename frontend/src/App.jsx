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
import AdminLogin from "./Page/Admin/AdminLogin.jsx";
import AdminLayout from "./Components/AdminNavbar/AdminNavbar.jsx";
import AdminContacts from "./Page/Admin/AdminContacts.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import AdminPosts from "./Page/Admin/AdminPosts.jsx";
import AdminCreatePost from "./Page/Admin/AdminCreatePost.jsx";
import AdminEditPost from "./Page/Admin/AdminEditPost.jsx";
import SinglePost from "./Page/SinglePost/SinglePost.jsx";
import HobbyRecommend from "./Page/HobbyRecommend/HobbyRecommend.jsx";
import Login from './Page/Auth/Login.jsx';
import Signup from './Page/Auth/Signup.jsx';
import Meetings from './Page/Meetings/Meetings.jsx';
import MeetingDetail from './Page/MeetingDetail/MeetingDetail.jsx';
import CreateMeeting from './Page/CreateMeeting/CreateMeeting.jsx';
import MyPage from './Page/MyPage/MyPage.jsx';
// 👇 --- [확인 1] 이 import 구문이 정확히 있는지 확인해주세요. --- 👇
import ProfileEdit from "./Page/ProfileEdit/ProfileEdit.jsx";

// --- 라우트 보호 로직 ---
const GuestRoute = () => {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/admin/posts" replace />;
};

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/admin" replace />;
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
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MainPage />} />
        <Route path="about" element={<About />} />
        <Route path="recommend" element={<HobbyRecommend />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/create" element={<CreateMeeting />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="board" element={<Board />} />
        <Route path="post/:id" element={<SinglePost />} />
        <Route path="our-services" element={<Services />} />
        <Route path="contact" element={<Contact />} />

        {/* 👇 --- [확인 2] UserProtectedRoute 안에 두 페이지 경로가 모두 있는지 확인해주세요. --- 👇 */}
        <Route element={<UserProtectedRoute />}>
          <Route path="mypage" element={<MyPage />} />
          <Route path="profile/edit" element={<ProfileEdit />} /> 
        </Route>

      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/admin" element={<GuestRoute />}>
        <Route index element={<AdminLogin />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/create" element={<AdminCreatePost />} />
          <Route path="posts/edit/:id" element={<AdminEditPost />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;