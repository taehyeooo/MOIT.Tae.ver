import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { RiKakaoTalkFill, RiGoogleFill } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';


const Login = () => {
    // 'general' 또는 'admin' 상태를 저장하여 현재 선택된 탭을 관리합니다.
    const [loginType, setLoginType] = useState('general'); 
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // <<< 중요: loginType에 따라 일반 사용자 또는 관리자 API로 요청을 보냅니다.
        const endpoint = loginType === 'general' 
            ? '/api/auth/login' 
            : '/api/admin/login'; // 관리자 로그인 API 경로
        
        try {
            const response = await axios.post(endpoint, formData, { withCredentials: true });
            setUser(response.data.user);
            
            await Swal.fire({
                icon: 'success',
                title: '로그인 성공!',
                text: 'MOIT에 오신 것을 환영합니다.',
                timer: 1500,
                showConfirmButton: false
            });

            // <<< 중요: 관리자는 관리자 페이지로, 일반 사용자는 메인 페이지로 이동시킵니다.
            navigate(loginType === 'admin' ? '/admin/posts' : '/');

        } catch (err) {
            const message = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
            setError(message);
        }
    };
    
    // 탭 버튼 스타일을 동적으로 결정하는 함수
    const getTabClassName = (type) => {
        return `w-1/2 py-3 text-center cursor-pointer font-semibold transition-all duration-300 ${
            loginType === type
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 border-b-2 border-gray-200 hover:text-gray-800'
        }`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-6">
                    <Link to="/" className="text-5xl font-bold text-blue-600 tracking-wider">MOIT</Link>
                    <p className="mt-3 text-lg text-gray-500">다시 돌아오신 것을 환영합니다</p>
                </div>

                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">로그인</h2>

                    {/* 로그인 타입 선택 탭: 클릭 시 loginType 상태가 변경됩니다. */}
                    <div className="flex mb-6">
                        <div onClick={() => setLoginType('general')} className={getTabClassName('general')}>
                            일반 로그인
                        </div>
                        <div onClick={() => setLoginType('admin')} className={getTabClassName('admin')}>
                            관리자 로그인
                        </div>
                    </div>
                    
                    {/* 아래 폼은 loginType 값과 상관없이 동일한 UI를 보여줍니다. */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">이메일</label>
                            <input 
                                name="username"
                                type="text" 
                                required 
                                value={formData.username} 
                                onChange={handleChange}
                                placeholder="Email"
                                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">비밀번호</label>
                            <input 
                                name="password" 
                                type="password" 
                                required 
                                value={formData.password} 
                                onChange={handleChange}
                                placeholder="Password"
                                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        </div>

                        <div className="text-right text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                비밀번호를 잊으셨나요?
                            </a>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 text-center font-semibold">{error}</p>}

                        <div>
                            <button type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
                                로그인
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">간편 로그인</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm bg-[#FEE500] text-sm font-medium text-black hover:bg-yellow-400 transition-colors">
                                <RiKakaoTalkFill className="mr-2 h-5 w-5" /> 카카오 로그인
                            </button>
                            <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm bg-[#03C75A] text-sm font-medium text-white hover:bg-green-600 transition-colors">
                                <SiNaver className="mr-2 h-4 w-4" /> 네이버 로그인
                            </button>
                             <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <RiGoogleFill className="mr-2 h-5 w-5" /> 구글로 로그인
                            </button>
                        </div>
                    </div>
                </div>
                 <p className="mt-6 text-center text-sm text-gray-600">
                    계정이 없으신가요? <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">회원가입</Link>
                </p>
                <p className="mt-2 text-center text-sm text-gray-600">
                    <Link to="/" className="font-medium text-gray-500 hover:text-gray-700 transition-colors">홈으로 돌아가기</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;