// taehyeooo/company_website/company_website-93d9fa75866ca46845029f78b01f4790a2a872da/backend/routes/meeting.js

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

// 특정 모임 상세 정보 조회 API
router.get('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        const meeting = await Meeting.findById(meetingId)
            .populate('host', 'nickname avatar')
            .populate('participants', 'nickname avatar');

        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }

        const similarMeetings = await Meeting.find({
            category: meeting.category,
            _id: { $ne: meetingId }
        })
        .limit(3)
        .populate('host', 'nickname');

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

// 👇 --- [추가] 모임 삭제 API --- 👇
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }

        // 로그인한 사용자가 모임의 호스트가 아닌 경우, 삭제 권한 없음
        if (meeting.host.toString() !== req.user.userId) {
            return res.status(403).json({ message: '모임을 삭제할 권한이 없습니다.' });
        }

        // 모임 삭제 실행
        await Meeting.findByIdAndDelete(req.params.id);
        
        res.json({ message: '모임이 성공적으로 삭제되었습니다.' });

    } catch (error) {
        console.error("모임 삭제 에러:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


module.exports = router;