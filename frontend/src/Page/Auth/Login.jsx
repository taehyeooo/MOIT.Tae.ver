import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/auth/login', formData, { withCredentials: true });
            setUser(response.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-blue-600">MOIT</Link>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">로그인</h2>
                    <p className="mt-2 text-sm text-gray-600">다시 돌아오신 것을 환영합니다</p>
                </div>

                <div className="bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">아이디</label>
                            <input name="username" type="text" required value={formData.username} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">비밀번호</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox"
                                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">로그인 상태 유지</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">비밀번호 찾기</a>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                로그인
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">또는</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button disabled className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed">
                                    Google로 로그인
                                </button>
                            </div>
                            <div>
                                <button disabled className="w-full inline-flex justify-center py-2 px-4 border border-yellow-400 rounded-md shadow-sm bg-yellow-400 text-sm font-medium text-black hover:bg-yellow-500 cursor-not-allowed">
                                    카카오로 로그인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                 <p className="mt-4 text-center text-sm text-gray-600">
                    아직 계정이 없으신가요? <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">회원가입</Link>
                </p>
                <p className="mt-2 text-center text-sm text-gray-600">
                    <Link to="/" className="font-medium text-gray-500 hover:text-gray-700">홈으로 돌아가기</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;