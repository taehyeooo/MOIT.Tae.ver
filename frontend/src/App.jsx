import "./App.css";
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx"; // 1단계에서 만든 useAuth 훅 사용

// --- 페이지 및 컴포넌트 임포트 ---
import MainPage from "./Page/MainPage/MainPage";
import About from "./Page/About/About";
import Leadership from "./Page/Leadership/Leadership";
import Board from "./Page/Board/Board";
import Services from "./Page/Services/Services";
import Contact from "./Page/Contact/Contact";
import AdminLogin from "./Page/Admin/AdminLogin";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";

// --- 임시 관리자 대시보드 ---
const AdminPosts = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold">관리자 대시보드</h1>
      <p className="mt-2 text-lg">로그인에 성공했습니다.</p>
    </div>
  </div>
);

// --- 라우트 보호 로직 ---
// 1. 비로그인 사용자만 접근 가능한 라우트 (예: 로그인 페이지)
const GuestRoute = () => {
  const { user } = useAuth();
  // 로그인 상태가 아니면 자식 컴포넌트(로그인 페이지)를 보여주고,
  // 로그인 상태이면 관리자 대시보드로 보냅니다.
  return !user ? <Outlet /> : <Navigate to="/admin/posts" replace />;
};

// 2. 로그인한 사용자만 접근 가능한 라우트 (예: 관리자 대시보드)
const ProtectedRoute = () => {
  const { user } = useAuth();
  // 로그인 상태이면 자식 컴포넌트(대시보드)를 보여주고,
  // 아니면 로그인 페이지로 보냅니다.
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
  const { loading } = useAuth(); // 전역 로딩 상태를 가져옵니다.

  // 최초 인증 확인 중에는 로딩 화면을 표시합니다.
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

      {/* 관리자 페이지 경로 */}
      <Route path="/admin" element={<GuestRoute />}>
        <Route index element={<AdminLogin />} />
      </Route>
      <Route path="/admin/posts" element={<ProtectedRoute />}>
         <Route index element={<AdminPosts />} />
      </Route>

      {/* 정의되지 않은 모든 경로는 메인 페이지로 보냅니다. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
