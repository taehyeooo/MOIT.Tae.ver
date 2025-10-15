import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>관리자 권한을 확인 중입니다...</div>;
  }

  // 사용자가 존재하고, 역할이 'admin'일 경우에만 접근 허용
  if (user && user.role === 'admin') {
    return <Outlet />;
  }

  // 권한이 없으면 로그인 페이지로 리디렉션
  return <Navigate to="/login" replace />;
};

export default AdminRoute;

