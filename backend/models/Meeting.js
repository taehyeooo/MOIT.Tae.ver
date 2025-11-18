const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // --- [신규] '새 모임 만들기' 폼에서 추가된 필드 ---
    description: { type: String, default: '' },
    location: { type: String, default: '온라인' },
    maxParticipants: { type: Number, default: 10, min: 2 },
    meetingTime: { type: Date, default: Date.now },
    imageUrl: { type: String, default: null }, // 이미지 파일 경로 저장
    // ---

}, { timestamps: true }); // (timestamps: true는 createdAt, updatedAt을 자동 생성)

module.exports = mongoose.model('Meeting', meetingSchema);