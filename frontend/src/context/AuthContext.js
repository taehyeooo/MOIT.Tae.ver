import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 1. Context 생성: 앱 전체에 공유할 저장 공간을 만듭니다.
const AuthContext = createContext(null);

// 2. Provider 컴포넌트: Context를 통해 값을 공유하는 역할을 합니다.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 로그인한 사용자 정보를 저장
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // 1단계: IP 블랙리스트 확인
        await axios.get("http://localhost:3000/api/check-ip", { withCredentials: true });

        // 2단계: IP가 안전하면, 저장된 토큰으로 사용자 인증 시도
        const tokenResponse = await axios.post("http://localhost:3000/api/auth/verify-token", {}, { withCredentials: true });
        setUser(tokenResponse.data.user); // 인증 성공 시 사용자 정보 저장
      } catch (error) {
        // IP가 차단되었거나, 유효한 토큰이 없는 경우
        const errorMessage = error.response?.data?.message || error.message;
        console.error("인증 상태 확인 실패:", errorMessage);
        if (errorMessage.includes("IP")) { // IP 차단 메시지인 경우
          alert("접근이 거부된 IP입니다.");
          navigate("/");
        }
        setUser(null); // 사용자 상태를 비로그인으로 설정
      } finally {
        // 모든 확인 절차가 끝나면 로딩 상태 해제
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []); // 의존성 배열을 빈 배열로 수정하여 최초 렌더링 시 한 번만 실행되도록 합니다.

  // 공유할 값들 (사용자 정보, 로딩 상태, 정보 업데이트 함수)
  const value = { user, setUser, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// 3. Custom Hook: Context를 편하게 사용하기 위한 함수
export const useAuth = () => {
  return useContext(AuthContext);
};

