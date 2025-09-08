import "./App.css";

import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useRouteError,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

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

// --- 컴포넌트 정의 ---

// 로그인 성공 후 이동할 관리자 대시보드 (임시)
const AdminPosts = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold">관리자 대시보드</h1>
      <p className="mt-2 text-lg">로그인에 성공했습니다.</p>
    </div>
  </div>
);

// 에러 발생 시 보여줄 페이지
function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-500">Oops!</h1>
      <p className="mt-4 text-2xl">죄송합니다. 예상치 못한 오류가 발생했습니다.</p>
      <p className="mt-2 text-lg text-gray-600">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

// IP 체크와 인증 상태를 모두 확인하는 보호막 컴포넌트
function AuthRedirectRoute() {
  const [status, setStatus] = useState("loading"); // 'loading', 'authenticated', 'guest'
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      // 1. IP 블랙리스트 확인
      try {
        const ipResponse = await axios.get(
          "http://localhost:3000/api/check-ip",
          { withCredentials: true }
        );
        if (!ipResponse.data.allowed) {
          alert("접근이 거부되었습니다.");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("IP 체크 오류:", error);
        alert("IP 확인 중 문제가 발생했습니다.");
        navigate("/");
        return;
      }

      // 2. IP 확인 후 토큰 인증
      try {
        await axios.post(
          "http://localhost:3000/api/auth/verify-token",
          {},
          { withCredentials: true }
        );
        // 인증 성공 (이미 로그인 됨)
        setStatus("authenticated");
      } catch (error) {
        // 인증 실패 (로그인 필요)
        console.log("토큰 인증 실패 (로그인 페이지로 이동): ", error);
        setStatus("guest");
      }
    };
    checkAccess();
  }, [navigate]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">보안 확인 중...</div>;
  }

  // 이미 로그인 되어있으면 /admin/posts로, 아니면 로그인 페이지(<Outlet/>)를 보여줌
  return status === "authenticated" ? <Navigate to="/admin/posts" replace /> : <Outlet />;
}

// 일반 사용자 페이지 레이아웃
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// --- 라우터 설정 ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/about", element: <About /> },
      { path: "/leadership", element: <Leadership /> },
      { path: "/board", element: <Board /> },
      { path: "/our-services", element: <Services /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
  {
    path: "/admin",
    element: <AuthRedirectRoute />, // 보호막으로 감싸기
    children: [{ index: true, element: <AdminLogin /> }],
  },
  {
    path: "/admin/posts",
    element: <AdminPosts />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

