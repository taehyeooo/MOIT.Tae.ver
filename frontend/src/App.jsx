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
// ❗ 1. 게시글 생성 및 수정 컴포넌트를 import 합니다.
import AdminCreatePost from "./Page/Admin/AdminCreatePost.jsx";
import AdminEditPost from "./Page/Admin/AdminEditPost.jsx";

// --- 라우트 보호 로직 ---
const GuestRoute = () => {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/admin/posts" replace />;
};

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/admin" replace />;
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
      {/* 일반 사용자 페이지 경로 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MainPage />} />
        <Route path="about" element={<About />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="board" element={<Board />} />
        <Route path="our-services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* 관리자 로그인 경로 */}
      <Route path="/admin" element={<GuestRoute />}>
        <Route index element={<AdminLogin />} />
      </Route>

      {/* 관리자 페이지 전용 경로 */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="posts" element={<AdminPosts />} />
          {/* ❗ 2. 게시글 생성 및 수정 경로를 추가합니다. */}
          <Route path="posts/create" element={<AdminCreatePost />} />
          <Route path="posts/edit/:id" element={<AdminEditPost />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Route>

      {/* 정의되지 않은 모든 경로는 메인 페이지로 보냅니다. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
