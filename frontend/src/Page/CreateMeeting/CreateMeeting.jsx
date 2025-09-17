import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

// Meetings 페이지에서 사용했던 카테고리 목록을 그대로 가져옵니다. '전체' 제외.
const categories = [
    '취미 및 여가',
    '운동 및 액티비티',
    '성장 및 배움',
    '문화 및 예술',
    '푸드 및 드링크',
    '여행 및 탐방',
    '봉사 및 참여',
];

const CreateMeeting = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        category: categories[0],
        description: '',
        location: '',
        maxParticipants: 2,
        date: '',
        coverImage: '',
    });
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            Swal.fire('오류', '로그인이 필요합니다.', 'error');
            return navigate('/login');
        }

        let imageUrl = '';
        if (file) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);
            try {
                const res = await axios.post('/api/upload/image', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                });
                imageUrl = res.data.imageUrl;
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                Swal.fire('오류', '이미지 업로드에 실패했습니다.', 'error');
                return;
            }
        }

        try {
            const meetingData = {
                ...formData,
                coverImage: imageUrl,
                host: user._id,
            };
            
            // 👇 --- [수정] 응답 데이터를 response 변수에 저장합니다. --- 👇
            const response = await axios.post('/api/meetings', meetingData, { withCredentials: true });
            
            Swal.fire('성공!', '새로운 모임이 만들어졌습니다!', 'success');

            // 👇 --- [수정] 응답에서 새 모임의 _id를 가져와 상세 페이지로 이동합니다. --- 👇
            const newMeetingId = response.data._id;
            navigate(`/meetings/${newMeetingId}`); 
            
        } catch (error) {
            console.error('모임 생성 실패:', error);
            Swal.fire('오류', '모임 생성에 실패했습니다.', 'error');
        }
    };

    return (
        <div className="bg-gray-50 py-32 min-h-screen">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-8">새 모임 만들기</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                   placeholder="예: 주말 아침 함께 테니스 칠 분!"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">대표 사진</label>
                            <input type="file" name="coverImage" onChange={handleFileChange}
                                   className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상세 설명</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                                      placeholder="모임에 대한 상세한 설명을 적어주세요."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">날짜 및 시간</label>
                            <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                   placeholder="예: 아산시 방축동 실내테니스장"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
                            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required min="2"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        <div className="pt-4">
                            <button type="submit"
                                    className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                생성하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMeeting;