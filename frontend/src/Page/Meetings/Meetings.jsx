import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaSmile, FaRunning, FaBook, FaPalette, FaUtensils, FaPlaneDeparture, FaHeart, 
    FaChevronDown, FaChevronUp, FaUsers, FaSearch, FaPlus, FaUserCircle // 👈 [수정] 참여자 아이콘 추가
} from 'react-icons/fa';
import defaultCoverImage from '../../assets/moitmark2.jpg'; // 👈 [추가] 기본 커버 이미지 import

const categories = [
    { name: '전체', icon: FaUsers }, { name: '취미 및 여가', icon: FaSmile },
    { name: '운동 및 액티비티', icon: FaRunning }, { name: '성장 및 배움', icon: FaBook },
    { name: '문화 및 예술', icon: FaPalette }, { name: '푸드 및 드링크', icon: FaUtensils },
    { name: '여행 및 탐방', icon: FaPlaneDeparture }, { name: '봉사 및 참여', icon: FaHeart },
];

// MeetingCard는 Link로 감싸서 클릭 시 페이지 이동을 하도록 합니다.
const MeetingCard = ({ meeting }) => (
    <Link to={`/meetings/${meeting._id}`} className="block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <div className="overflow-hidden">
                {/* 👇 --- [수정] 사용자가 올린 이미지가 없으면 기본 이미지를 보여줍니다 --- 👇 */}
                <img src={meeting.coverImage || defaultCoverImage} alt={meeting.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold mb-2 truncate">{meeting.title}</h3>
                <p className="text-sm text-gray-600 mb-1">📍 {meeting.location}</p>
                <p className="text-sm text-gray-600 mb-3">🗓️ {new Date(meeting.date).toLocaleDateString('ko-KR')}</p>
                <div className="flex items-center justify-between text-sm">
                    {/* 👇 --- [수정] 참여자 이미지를 이모지 아이콘으로 변경했습니다 --- 👇 */}
                    <div className="flex items-center -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, index) => (
                             <FaUserCircle key={p._id || index} className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 text-white" />
                        ))}
                    </div>
                    <span className="font-semibold">{meeting.participants.length} / {meeting.maxParticipants} 명</span>
                </div>
            </div>
        </div>
    </Link>
);


const Meetings = () => {
    const [activeFilter, setActiveFilter] = useState('전체');
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/meetings');
                setMeetings(response.data);
            } catch (error) {
                console.error("모임 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    useEffect(() => {
        const currentFiltered = meetings.filter(meeting => {
            const matchesCategory = activeFilter === '전체' || meeting.category === activeFilter;
            const matchesSearchTerm = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      (meeting.category && meeting.category.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesCategory && matchesSearchTerm;
        });
        setFilteredMeetings(currentFiltered);
    }, [activeFilter, meetings, searchTerm]);
    
    const visibleCategories = showAllCategories ? categories : categories.slice(0, 7);

    if (loading) {
        return <div className="bg-gray-50 py-32 min-h-screen flex justify-center items-center"><p>모임 목록을 불러오는 중...</p></div>;
    }

    return (
        <div className="bg-gray-50 py-32 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">관심사별 정모 일정</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="max-w-full mx-auto p-4 bg-white rounded-lg shadow mb-8">
                            <div className="flex flex-wrap justify-center gap-2">
                                {visibleCategories.map(category => (
                                    <button key={category.name} onClick={() => setActiveFilter(category.name)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                            activeFilter === category.name ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                        }`}>
                                        <category.icon /> {category.name}
                                    </button>
                                ))}
                                {categories.length > 7 && (
                                    <button onClick={() => setShowAllCategories(!showAllCategories)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors bg-white text-gray-700 hover:bg-gray-100 border border-gray-200">
                                        {showAllCategories ? <><FaChevronUp /> 간략히 보기</> : <><FaChevronDown /> 더보기</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredMeetings.length > 0 ? (
                                filteredMeetings.map(meeting => <MeetingCard key={meeting._id} meeting={meeting} />)
                            ) : (
                                <p className="col-span-full text-center text-gray-500 py-10">해당 카테고리의 모임이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Link to="/meetings/create" className="block w-full">
                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-8 shadow">
                                <FaPlus /> 새 모잇 만들기
                            </button>
                        </Link>

                        <div className="bg-white p-6 rounded-lg shadow sticky top-32">
                            <h2 className="text-xl font-bold mb-4">모임 검색</h2>
                            <div className="relative">
                                <input type="text" placeholder="제목, 카테고리로 검색"
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Meetings;