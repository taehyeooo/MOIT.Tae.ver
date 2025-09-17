import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// 탭 버튼 컴포넌트
const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 font-semibold text-lg transition-colors duration-300 ${
            isActive
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-800'
        }`}
    >
        {label}
    </button>
);

// 모임 리스트 아이템 컴포넌트
const MeetingListItem = ({ meeting }) => {
    const isPast = new Date(meeting.date) < new Date();
    const status = isPast ? '종료' : '모집중';
    const statusColor = isPast ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700';

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
            <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                {meeting.category}
            </span>
            <p className="flex-grow font-bold text-gray-800 text-lg truncate">{meeting.title}</p>
            <span className="text-gray-500 whitespace-nowrap">{meeting.participants.length} / {meeting.maxParticipants}명</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                {status}
            </span>
            <Link
                to={`/meetings/${meeting._id}`}
                className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
                상세보기
            </Link>
        </div>
    );
};


const MyPage = () => {
    const { user } = useAuth();
    const [myPageData, setMyPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' 또는 'joined'

    useEffect(() => {
        const fetchMyPageData = async () => {
            if (!user) {
                setLoading(false);
                return;
            };
            try {
                const response = await axios.get('/api/auth/mypage', { withCredentials: true });
                setMyPageData(response.data);
            } catch (error) {
                console.error("마이페이지 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPageData();
    }, [user]);

    if (loading) {
        return <div className="min-h-screen bg-gray-100 py-32 flex justify-center items-center"><p>로딩 중...</p></div>;
    }

    if (!myPageData || !user) {
        return <div className="min-h-screen bg-gray-100 py-32 flex justify-center items-center"><p>사용자 정보를 불러올 수 없습니다.</p></div>;
    }

    const { hostedMeetings, joinedMeetings } = myPageData;

    return (
        <div className="min-h-screen bg-gray-100 py-32">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* 프로필 섹션 */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-blue-500 rounded-full"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user.nickname} 님</h1>
                            <p className="text-gray-500 mt-1">오늘도 새로운 취미를 찾아보세요!</p>
                        </div>
                    </div>
                    {/* 👇 --- [확인 3] 버튼이 <Link>로 되어 있고, to="/profile/edit" 경로가 맞는지 확인해주세요. --- 👇 */}
                    <Link 
                        to="/profile/edit" 
                        className="bg-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        프로필 수정
                    </Link>
                </div>
                
                {/* 탭 메뉴 */}
                <div className="border-b border-gray-200 mb-6">
                    <TabButton 
                        label="내가 만든 모임" 
                        isActive={activeTab === 'hosted'}
                        onClick={() => setActiveTab('hosted')} 
                    />
                    <TabButton 
                        label="내가 참여한 모임" 
                        isActive={activeTab === 'joined'}
                        onClick={() => setActiveTab('joined')}
                    />
                </div>

                {/* 모임 리스트 */}
                <div className="space-y-4">
                    {activeTab === 'hosted' && (
                        hostedMeetings.length > 0 ? (
                            hostedMeetings.map(meeting => <MeetingListItem key={meeting._id} meeting={meeting} />)
                        ) : (
                            <p className="text-center text-gray-500 py-10">아직 직접 만든 모임이 없어요.</p>
                        )
                    )}
                    {activeTab === 'joined' && (
                        joinedMeetings.length > 0 ? (
                            joinedMeetings.map(meeting => <MeetingListItem key={meeting._id} meeting={meeting} />)
                        ) : (
                             <p className="text-center text-gray-500 py-10">아직 참여한 모임이 없어요.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPage;