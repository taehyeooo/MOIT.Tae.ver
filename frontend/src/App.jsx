import "./App.css";
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// --- 페이지 및 컴포넌트 임포트 ---
import MainPage from "./Page/MainPage/MainPage";
import About from "./Page/About/About";
import Leadership from "./Page/Leadership/Leadership";
import Board from "./Page/Board/Board";
import Services from "./Page/Services/Services";
import Contact from "./Page/Contact/Contact";
import AdminLogin from "./Page/Admin/AdminLogin";
import AdminLayout from "./Page/Admin/AdminLayout.jsx"; 
import AdminContacts from "./Page/Admin/AdminContacts.jsx";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";

// --- 임시 관리자 페이지 컴포넌트 ---
// 게시글 관리 페이지 (임시)
const AdminPosts = () => (
  <div className="bg-white p-8 rounded-lg shadow-lg w-full">
    <h1 className="text-3xl font-bold">게시글 관리</h1>
    <p className="mt-4">이곳에서 게시글을 관리할 수 있습니다.</p>
  </div>
);

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
// 일반 사용자용 레이아웃 (Navbar + Footer)
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
    return <div className="min-h-screen flex items-center justify-center">보안 및 인증 상태 확인 중...</div>;
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
        {/* 모든 관리자 페이지는 AdminLayout(공통 네비게이션 바)을 가집니다. */}
        <Route element={<AdminLayout />}>
          <Route path="posts" element={<AdminPosts />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Route>

      {/* 정의되지 않은 모든 경로는 메인 페이지로 보냅니다. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

