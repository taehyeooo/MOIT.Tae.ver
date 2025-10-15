import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaClipboardList, FaEnvelopeOpenText } from 'react-icons/fa';

// 통계 카드 컴포넌트
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6">
        <div className={`text-4xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-gray-500">{title}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        meetingCount: 0,
        contactCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 백엔드에 새로 만든 관리자 통계 API를 호출합니다.
                const response = await axios.get('/api/admin/stats', { withCredentials: true });
                setStats(response.data);
            } catch (error) {
                console.error("통계 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <p>데이터를 불러오는 중입니다...</p>;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<FaUsers />} title="총 사용자 수" value={stats.userCount} color="text-blue-500" />
                <StatCard icon={<FaClipboardList />} title="총 모임 수" value={stats.meetingCount} color="text-green-500" />
                <StatCard icon={<FaEnvelopeOpenText />} title="총 문의 수" value={stats.contactCount} color="text-orange-500" />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">최근 활동 (예시)</h2>
                <p className="text-gray-600">이곳에 최근 가입한 사용자나 생성된 모임 목록을 표시할 수 있습니다.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
