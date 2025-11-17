// frontend/src/Page/CreateMeeting/CreateMeeting.jsx (수정된 코드)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const CreateMeeting = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: '운동', // 기본값 설정
        description: '',
        location: '',
        maxParticipants: 10, // 기본값
        date: '',
        time: '',
    });
    const [meetingImage, setMeetingImage] = useState(null); // [신규] 이미지 파일
    const [preview, setPreview] = useState(null); // [신규] 이미지 미리보기
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // [신규] 파일 변경 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMeetingImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setMeetingImage(null);
            setPreview(null);
        }
    };

    // [수정] FormData를 사용한 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            Swal.fire('오류', '로그인이 필요합니다.', 'error');
            return;
        }

        setLoading(true);

        // 1. FormData 객체 생성
        const submitData = new FormData();
        
        // 2. 폼 데이터 (JSON이 아닌, 필드별로) 추가
        submitData.append('title', formData.title);
        submitData.append('category', formData.category);
        submitData.append('description', formData.description);
        submitData.append('location', formData.location);
        submitData.append('maxParticipants', formData.maxParticipants);
        submitData.append('meetingTime', `${formData.date}T${formData.time}`); // 날짜와 시간 결합
        
        // 3. 이미지 파일 추가
        if (meetingImage) {
            submitData.append('meetingImage', meetingImage); // 'meetingImage'는 백엔드 multer와 일치
        }
        
        try {
            // [수정] /api/meetings 엔드포인트로 FormData 전송
            const response = await axios.post('/api/meetings', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // 중요!
                },
                withCredentials: true,
            });

            Swal.fire('성공', '새로운 모임이 성공적으로 생성되었습니다!', 'success');
            navigate(`/meetings/${response.data._id}`); // 생성된 모임 상세 페이지로 이동
        } catch (error) {
            console.error('모임 생성 실패:', error);
            Swal.fire('실패', error.response?.data?.message || '모임 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // (참고) PHP 폼에 있던 카테고리들
    const categories = ['운동', '여행', '음악', '게임', '요리', '독서', '공예', '사진', '기타'];

    return (
        <div className="bg-gray-50 py-32">
            <div className="container mx-auto max-w-2xl p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-center mb-8">새로운 모임 만들기</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">모임 제목</label>
                        <input type="text" name="title" id="title" required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            onChange={handleChange} value={formData.title} />
                    </div>

                    {/* [신규] 이미지 업로드 필드 */}
                    <div>
                        <label htmlFor="meetingImage" className="block text-sm font-medium text-gray-700">대표 이미지 (선택)</label>
                        <input type="file" name="meetingImage" id="meetingImage" accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100"
                            onChange={handleFileChange} />
                        {preview && (
                            <div className="mt-4">
                                <img src={preview} alt="미리보기" className="w-full max-h-64 object-cover rounded-lg shadow-md" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
                        <select name="category" id="category" required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            onChange={handleChange} value={formData.category}>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    
                    {/* [신규] 상세 설명 필드 */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">모임 설명</label>
                        <textarea name="description" id="description" rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            onChange={handleChange} value={formData.description}></textarea>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">위치 (장소)</label>
                        <input type="text" name="location" id="location"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            onChange={handleChange} value={formData.location} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">최대 인원</label>
                            <input type="number" name="maxParticipants" id="maxParticipants" min="2"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                onChange={handleChange} value={formData.maxParticipants} />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">날짜</label>
                            <input type="date" name="date" id="date" required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                onChange={handleChange} value={formData.date} />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">시간</label>
                            <input type="time" name="time" id="time" required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                onChange={handleChange} value={formData.time} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? '생성 중...' : '모임 생성하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateMeeting;