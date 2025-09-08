import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 앱 전체에 공유될 저장 공간(Context)을 생성합니다.
const AuthContext = createContext(null);

// Context를 통해 값을 제공하는 Provider 컴포넌트입니다.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        await axios.get("http://localhost:3000/api/check-ip", { withCredentials: true });
        const tokenResponse = await axios.post(
          "http://localhost:3000/api/auth/verify-token",
          {},
          { withCredentials: true }
        );
        setUser(tokenResponse.data.user);
      } catch (error) {
        const errorMessage = error.response?.data?.message || "인증 확인 중 오류 발생";
        console.error("인증 상태 확인 실패:", errorMessage);
        if (error.response?.status === 403) {
          alert("접근이 거부되었습니다.");
          navigate("/");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserStatus();
  }, [navigate]);

  const value = { user, setUser, loading };

  // JSX를 반환할 때는 괄호()로 감싸줍니다.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 다른 컴포넌트에서 Context를 쉽게 사용하기 위한 Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
