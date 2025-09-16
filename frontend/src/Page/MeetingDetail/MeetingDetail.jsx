// frontend/src/Page/MeetingDetail/MeetingDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaChevronLeft, FaRegListAlt, FaUser } from 'react-icons/fa';
import defaultCoverImage from '../../assets/moitmark1.png'; // 기본 이미지를 moitmark1.png로 변경했습니다. 필요시 moitmark2.jpg로 수정하세요.
import { useAuth } from '../../context/AuthContext'; // 👈 [추가]
import Swal from 'sweetalert2'; // 👈 [추가]

const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('ko-KR', options).format(new Date(dateString));
};

const MeetingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // 👈 [추가]
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

    // 👇 --- [추가] 삭제 버튼 클릭 시 실행될 함수 --- 👇
    const handleDeleteMeeting = async () => {
        const result = await Swal.fire({
            title: '정말 모임을 삭제하시겠습니까?',
            text: "삭제된 모임은 되돌릴 수 없습니다!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 삭제하겠습니다',
            cancelButtonText: '아니요'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/meetings/${id}`, { withCredentials: true });
                await Swal.fire('삭제 완료!', '모임이 성공적으로 삭제되었습니다.', 'success');
                navigate('/meetings');
            } catch (err) {
                console.error('모임 삭제 실패:', err);
                const message = err.response?.data?.message || '모임 삭제 중 오류가 발생했습니다.';
                Swal.fire('오류 발생', message, 'error');
            }
        }
    };

    if (loading) {
        return <div className="bg-white py-32 min-h-screen flex justify-center pt-16"><p>모임 상세 정보를 불러오는 중...</p></div>;
    }

    if (error || !meeting) {
        return <div className="bg-white py-32 min-h-screen flex justify-center pt-16"><p>{error || "모임을 찾을 수 없습니다."}</p></div>;
    }
    
    const remainingSpots = meeting.maxParticipants - meeting.participants.length;
    // 👇 --- [추가] 현재 사용자가 모임의 호스트인지 확인 --- 👇
    const isHost = user && meeting && user._id === meeting.host._id;

    return (
        <div className="bg-white pt-24 pb-12 min-h-screen">
            <div className="container mx-auto max-w-6xl px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black mb-4">
                    <FaChevronLeft />
                    <span>뒤로가기</span>
                </button>

                <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-8">
                    <img src={meeting.coverImage || defaultCoverImage} alt={meeting.title} className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className='flex items-center justify-between mb-6'>
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                                    <span className="text-3xl">🎉</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
                                </div>
                            </div>
                            {/* 👇 --- [추가] 호스트일 경우에만 삭제 버튼을 보여줌 --- 👇 */}
                            {isHost && (
                                <button
                                    onClick={handleDeleteMeeting}
                                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    모임 삭제
                                </button>
                            )}
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-3">📝 모임 설명</h2>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md">{meeting.description}</p>
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-3">📌 핵심 정보</h2>
                            <div className="grid grid-cols-2 gap-4 text-gray-700">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg"><FaRegListAlt className="mr-3 text-gray-400" size={20} /> <span className='font-semibold'>카테고리:</span>&nbsp;{meeting.category}</div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg"><FaUsers className="mr-3 text-gray-400" size={20} /> <span className='font-semibold'>인원:</span>&nbsp;{meeting.participants.length} / {meeting.maxParticipants}명</div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg"><FaMapMarkerAlt className="mr-3 text-gray-400" size={20} /> <span className='font-semibold'>장소:</span>&nbsp;{meeting.location}</div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg"><FaUser className="mr-3 text-gray-400" size={20} /> <span className='font-semibold'>호스트:</span>&nbsp;{meeting.host.nickname}</div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-3">👥 참여 멤버 ({meeting.participants.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {meeting.participants.map(p => (
                                <div key={p._id} className="p-3 border rounded-lg bg-gray-50">
                                    <p className="font-semibold">{p.nickname}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="p-6 border border-gray-200 rounded-lg shadow-md sticky top-24">
                            <div className="text-center bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="font-bold text-lg text-blue-800">{formatDate(meeting.date)}</p>
                            </div>
                            
                            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md text-center mb-4">
                                ✅ 더 궁금한점을 모두 해결하세요
                            </div>
                            
                            <p className="text-sm text-gray-500 text-center mb-2">
                                {remainingSpots > 0 ? `마감까지 ${remainingSpots}자리 남았어요!` : '모집이 마감되었습니다!'}
                            </p>
                            <button 
                                disabled={remainingSpots <= 0}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                신청하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MeetingDetail;