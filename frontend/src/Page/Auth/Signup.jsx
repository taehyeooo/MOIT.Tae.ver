import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        nickname: '',
        email: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('비밀번호가 일치하지 않습니다.');
        }

        try {
            await axios.post('/api/auth/signup', {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                nickname: formData.nickname,
                email: formData.email,
            });

            Swal.fire({
                icon: 'success',
                title: '회원가입 성공!',
                text: '로그인 페이지로 이동합니다.',
                timer: 1500,
                showConfirmButton: false,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-blue-600">MOIT</Link>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">회원가입</h2>
                    <p className="mt-2 text-sm text-gray-600">새로운 취미와 사람들을 만나보세요</p>
                </div>

                <div className="bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">아이디</label>
                            <input name="username" type="text" required value={formData.username} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            <p className="mt-1 text-xs text-gray-500">4글자 이상의 영문, 숫자, 언더스코어(_)만 사용 가능</p>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700">비밀번호</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            <p className="mt-1 text-xs text-gray-500">6글자 이상의 비밀번호</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">이름</label>
                            <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">닉네임</label>
                            <input name="nickname" type="text" required value={formData.nickname} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">이메일</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                   className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        
                        <div className="pt-2">
                            <button type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                회원가입
                            </button>
                        </div>
                    </form>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    이미 계정이 있으신가요? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">로그인</Link>
                </p>
                <p className="mt-2 text-center text-sm text-gray-600">
                    <Link to="/" className="font-medium text-gray-500 hover:text-gray-700">홈으로 돌아가기</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;