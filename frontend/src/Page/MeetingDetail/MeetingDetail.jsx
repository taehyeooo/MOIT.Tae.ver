import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaHeart, FaChevronLeft } from 'react-icons/fa';

const MeetingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetingDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await axios.get(`/api/meetings/${id}`);
                setMeeting(response.data);
            } catch (err) {
                console.error("모임 상세 정보를 불러오는 데 실패했습니다.", err);
                setError("모임 정보를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchMeetingDetail();
    }, [id]);

    if (loading) {
        return <div className="bg-gray-50 py-32 min-h-screen flex justify-center items-center"><p>모임 상세 정보를 불러오는 중...</p></div>;
    }

    if (error || !meeting) {
        return <div className="bg-gray-50 py-32 min-h-screen flex justify-center items-center"><p>{error || "모임을 찾을 수 없습니다."}</p></div>;
    }
    
    const admins = meeting.participants.slice(0, 5);

    return (
        <div className="bg-gray-50 py-24 pb-12">
            <div className="container mx-auto max-w-4xl">
                 <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black mb-4">
                    <FaChevronLeft />
                    <span>뒤로가기</span>
                </button>
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <img src={meeting.coverImage || 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2070&auto=format&fit=crop'} alt={meeting.title} className="w-full h-64 object-cover" />
                    
                    <div className="p-8">
                        <div className="flex items-end gap-4 mb-4 -mt-24">
                            <img src={meeting.host?.avatar || `https://i.pravatar.cc/150?u=${meeting.host?._id}`} alt="Host" className="w-24 h-24 rounded-lg border-4 border-white object-cover" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{meeting.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span><FaUsers className="inline mr-1" /> {meeting.category}</span>
                                    <span><FaMapMarkerAlt className="inline mr-1" /> {meeting.location}</span>
                                    <span>멤버 {meeting.participants.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex border-b mb-6">
                            <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold">홈</button>
                            <button className="px-4 py-2 text-gray-500 hover:text-black">게시판</button>
                            <button className="px-4 py-2 text-gray-500 hover:text-black">사진첩</button>
                        </div>
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4">모임 소개</h2>
                            <div className="text-gray-700 space-y-2">
                                <p><FaCalendarAlt className="inline mr-2 text-gray-400" /> SINCE. {new Date(meeting.createdAt).toLocaleDateString('ko-KR')}</p>
                                <p><FaHeart className="inline mr-2 text-red-400" /> {meeting.description}</p>
                            </div>
                        </div>
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4">운영진</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {admins.map(admin => (
                                    <div key={admin._id} className="text-center p-4 border rounded-lg">
                                        <img src={admin.avatar || `https://i.pravatar.cc/150?u=${admin._id}`} alt={admin.nickname} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                                        <p className="font-bold">{admin.nickname}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">모임 멤버 ({meeting.participants.length})</h2>
                                <button className="text-sm text-gray-500 hover:text-black">최근가입 🔄</button>
                            </div>
                            <div className="space-y-4">
                                {meeting.participants.map(member => (
                                    <div key={member._id} className="flex items-center gap-4">
                                        <img src={member.avatar || `https://i.pravatar.cc/150?u=${member._id}`} alt={member.nickname} className="w-12 h-12 rounded-full object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-bold">{member.nickname}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {meeting.similarMeetings && meeting.similarMeetings.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">비슷한 모임</h2>
                            <Link to="/meetings" className="text-sm font-medium text-blue-600 hover:underline">모임 더보기</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {meeting.similarMeetings.map(simMeet => (
                                 <Link to={`/meetings/${simMeet._id}`} key={simMeet._id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
                                    <img src={simMeet.coverImage || 'https://i.pravatar.cc/150?u=similar'} alt={simMeet.title} className="w-20 h-20 rounded-lg object-cover" />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{simMeet.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span>{simMeet.category}</span>
                                            <span>|</span>
                                            <span>{simMeet.location}</span>
                                        </div>
                                    </div>
                                 </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingDetail;