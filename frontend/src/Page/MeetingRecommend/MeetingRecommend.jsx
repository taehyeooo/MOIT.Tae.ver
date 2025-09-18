import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaArrowRight } from 'react-icons/fa';

const MeetingRecommend = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { recommendations, newMeetingData } = location.state || {};

    // 데이터가 없으면 렌더링하지 않고 생성 페이지로 리디렉션
    if (!recommendations || !newMeetingData) {
        React.useEffect(() => {
            navigate('/meetings/create');
        }, [navigate]);
        return null;
    }

    // "무시하고 새로 만들기" 버튼 클릭 시 호출될 함수
    const handleCreateAnyway = async () => {
        try {
            const response = await axios.post('/api/meetings/force-create', newMeetingData, {
                withCredentials: true,
            });
            await Swal.fire({
                icon: 'success',
                title: '성공!',
                text: '새로운 모임이 만들어졌습니다!',
                timer: 1500,
                showConfirmButton: false
            });
            const newMeetingId = response.data.meeting._id;
            navigate(`/meetings/${newMeetingId}`);
        } catch (error) {
            console.error('모임 생성 실패:', error);
            Swal.fire('오류', '모임 생성에 실패했습니다.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-32">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">✋ 잠깐! 이런 모임은 어떠세요?</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        입력하신 내용과 비슷한 모임이 이미 있어요.
                        <br />
                        새로 만드는 대신, 기존 모임에 참여해 보세요!
                    </p>
                    <p className="p-4 bg-blue-50 text-blue-700 rounded-lg font-medium">
                        {recommendations.summary}
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-bold text-center text-gray-700 mb-4">AI 추천 모임 목록</h2>
                    {recommendations.recommendations.map((rec) => (
                        <div key={rec.meeting_id} className="bg-white p-5 rounded-lg shadow-md transition-all hover:shadow-xl hover:scale-105 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{rec.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">AI 분석 유사도: {Math.round(rec.score * 100)}%</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/meetings/${rec.meeting_id}`)}
                                className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                보러 가기 <FaArrowRight />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t pt-8 text-center">
                     <p className="text-gray-600 mb-4">추천 모임이 마음에 들지 않으신가요?</p>
                    <button 
                        onClick={handleCreateAnyway}
                        className="inline-flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FaPlus /> 네, 제 모임을 만들게요
                    </button>
                </div>
            </div>
        </div>
    );
};

// 👇 --- [수정] 이 줄을 파일 맨 끝에 추가해주세요! --- 👇
export default MeetingRecommend;