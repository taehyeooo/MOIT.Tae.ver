import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaTachometerAlt, FaUsers, FaClipboardList, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

// 사이드바 메뉴 아이템
const menuItems = [
    { path: '/admin', label: '대시보드', icon: FaTachometerAlt },
    { path: '/admin/users', label: '사용자 관리', icon: FaUsers },
    { path: '/admin/meetings', label: '모임 관리', icon: FaClipboardList },
    { path: '/admin/contacts', label: '문의 관리', icon: FaEnvelope },
    { path: '/admin/posts', label: '게시물 관리', icon: FaClipboardList },
];

const AdminLayout = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
            setUser(null);
            Swal.fire('로그아웃', '성공적으로 로그아웃되었습니다.', 'success');
            navigate('/');
        } catch (error) {
            console.error("Logout Error:", error);
            Swal.fire('오류', '로그아웃 중 문제가 발생했습니다.', 'error');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* 사이드바 */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    <Link to="/admin">MOIT Admin</Link>
                </div>
                <nav className="flex-grow">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-4 px-6 py-4 transition-colors duration-200 ${
                                        location.pathname === item.path
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-700">
                     <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                    >
                        <FaSignOutAlt className="h-5 w-5" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">
                     <h1 className="text-2xl font-semibold text-gray-800">
                        {menuItems.find(item => item.path === location.pathname)?.label || '관리자 페이지'}
                    </h1>
                    <div className="text-right">
                        <p className="font-semibold">{user?.nickname || user?.username}</p>
                        <p className="text-sm text-gray-500">관리자</p>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto">
                    {/* 선택된 메뉴에 해당하는 페이지가 여기에 렌더링됩니다. */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

