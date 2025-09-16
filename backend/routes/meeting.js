const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { verifyToken } = require('../utils/auth');

// 모든 모임 목록 조회
router.get('/', async (req, res) => {
    try {
        const meetings = await Meeting.find()
            .populate('host', 'nickname')
            .populate('participants')
            .sort({ createdAt: -1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// <<< 수정: 특정 모임 상세 정보 조회 API (비슷한 모임 추천 기능 추가)
router.get('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        const meeting = await Meeting.findById(meetingId)
            .populate('host', 'nickname avatar')
            .populate('participants', 'nickname avatar');

        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }

        // 현재 모임과 같은 카테고리의 다른 모임들을 3개 찾아옵니다.
        const similarMeetings = await Meeting.find({
            category: meeting.category, // 같은 카테고리
            _id: { $ne: meetingId }    // 현재 보고 있는 모임은 제외
        })
        .limit(3) // 최대 3개까지만
        .populate('host', 'nickname');

        // 기존 모임 정보에 'similarMeetings' 배열을 추가하여 응답
        res.json({ ...meeting.toObject(), similarMeetings });

    } catch (error) {
        console.error(`Error fetching meeting ${req.params.id}:`, error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 새로운 모임 생성 (로그인 필요)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, coverImage, category, location, date, maxParticipants } = req.body;
        const host = req.user.userId;
        
        const newMeeting = new Meeting({
            title, description, coverImage, category, location, date, maxParticipants, host,
            participants: [host]
        });

        await newMeeting.save();
        res.status(201).json(newMeeting);

    } catch (error) {
        console.error("모임 생성 에러:", error);
        res.status(400).json({ message: '모임 생성에 실패했습니다.', error: error.message });
    }
});

module.exports = router;