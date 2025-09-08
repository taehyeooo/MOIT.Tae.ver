import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx"; // 1단계에서 만든 AuthContext.jsx를 사용하도록 경로를 수정합니다.

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth(); // AuthContext에서 setUser 함수를 가져옵니다.

  // 사용자가 입력 필드에 타이핑할 때마다 state를 업데이트하는 함수
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // '로그인' 버튼을 눌렀을 때 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 페이지가 새로고침되는 것을 방지
    setError(null); // 이전 에러 메시지 초기화

    try {
      // 백엔드 로그인 API로 POST 요청
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        { withCredentials: true } // 쿠키를 주고받기 위한 필수 설정
      );

      // 응답 데이터에 user 정보가 있으면 로그인 성공
      if (response.data.user) {
        alert("로그인에 성공했습니다.");
        setUser(response.data.user); // 전역 상태에 사용자 정보 저장
        navigate("/admin/posts", { replace: true }); // 관리자 대시보드로 이동
      }
    } catch (err) {
      // 백엔드에서 보낸 에러 메시지를 화면에 표시
      const errorMessage = err.response?.data?.message || "로그인에 실패했습니다.";
      const remainingAttempts = err.response?.data?.remainingAttempts;
      setError({
        message: errorMessage,
        remainingAttempts: remainingAttempts,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            관리자 전용 페이지입니다.
          </p>
        </div>

        {/* form에 onSubmit 이벤트 핸들러 연결 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                관리자 아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="관리자 아이디"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                관리자 비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="관리자 비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-base font-bold text-center">
              {typeof error === "string" ? error : error.message}
              {error.remainingAttempts !== undefined && (
                <div className="mt-1">
                  남은 시도 횟수: {error.remainingAttempts}회
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full items-center px-4 py-3 border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-300"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;