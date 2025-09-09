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

// --- 임시 관리자 페이지 컴포넌트 ---
// 게시글 관리 페이지 (임시)
const AdminPosts = () => (
  <div className="bg-white p-8 rounded-lg shadow-lg w-full">
    <h1 className="text-3xl font-bold">게시글 관리</h1>
    <p className="mt-4">이곳에서 게시글을 관리할 수 있습니다.</p>
  </div>
);

// --- 라우트 보호 로직 ---

// 로그아웃 상태일 때만 접근 가능한 라우트 (예: 로그인 페이지)
const GuestRoute = () => {
  const { user } = useAuth();
  // user가 있으면 (로그인 상태이면) 관리자 메인 페이지로 이동
  return !user ? <Outlet /> : <Navigate to="/admin/posts" replace />;
};

// 로그인 상태일 때만 접근 가능한 라우트 (예: 관리자 페이지)
const ProtectedRoute = () => {
  const { user } = useAuth();
  // user가 없으면 (로그아웃 상태이면) 로그인 페이지로 이동
  return user ? <Outlet /> : <Navigate to="/admin" replace />;
};

// --- 레이아웃 컴포넌트 ---
// 일반 사용자용 레이아웃 (Navbar + Footer)
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet /> {/* 자식 라우트들이 이 자리에 렌더링됩니다. */}
    <Footer />
  </>
);

// --- 메인 앱 컴포넌트 ---
function App() {
  const { loading } = useAuth();

  // AuthContext에서 인증 상태를 확인하는 동안 로딩 화면을 보여줍니다.
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

      {/* 관리자 로그인 경로 (로그인 안 한 사용자만 접근 가능) */}
      <Route path="/admin" element={<GuestRoute />}>
        <Route index element={<AdminLogin />} />
      </Route>

      {/* 관리자 페이지 전용 경로 (로그인 한 사용자만 접근 가능) */}
      <Route path="/admin" element={<ProtectedRoute />}>
        {/* 모든 관리자 페이지는 AdminLayout(공통 네비게이션 바)을 가집니다. */}
        <Route element={<AdminLayout />}>
          <Route path="posts" element={<AdminPosts />} />
          <Route path="contacts" element={<AdminContacts />} />
          {/* 다른 관리자 페이지 라우트들을 여기에 추가할 수 있습니다. */}
        </Route>
      </Route>

      {/* 정의되지 않은 모든 경로는 메인 페이지로 보냅니다. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
