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

// 마감 임박 모임 조회 API
router.get('/closing-soon', async (req, res) => {
    try {
        const now = new Date();
        const meetings = await Meeting.aggregate([
            {
                $match: {
                    date: { $gte: now }, // 아직 날짜가 지나지 않았고,
                    $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] } // 인원이 꽉 차지 않은 모임 중에서
                }
            },
            // 👇 --- [수정] 정렬 기준을 날짜가 가까운 순으로 변경했습니다. --- 👇
            {
                $sort: {
                    date: 1 // 날짜 오름차순 (가장 가까운 날짜 먼저)
                }
            },
            {
                $limit: 4 // 최대 4개만 가져오기
            }
        ]);

        const populatedMeetings = await Meeting.populate(meetings, [
            { path: 'host', select: 'nickname' },
            { path: 'participants', select: 'nickname' }
        ]);

        res.json(populatedMeetings);
    } catch (error) {
        console.error("마감 임박 모임 조회 에러:", error);
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

// 모임 삭제 API
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }

        if (meeting.host.toString() !== req.user.userId) {
            return res.status(403).json({ message: '모임을 삭제할 권한이 없습니다.' });
        }

        await Meeting.findByIdAndDelete(req.params.id);
        
        res.json({ message: '모임이 성공적으로 삭제되었습니다.' });

    } catch (error) {
        console.error("모임 삭제 에러:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 모임 참여 신청 API
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }
        if (meeting.participants.length >= meeting.maxParticipants) {
            return res.status(400).json({ message: '모집 인원이 가득 찼습니다.' });
        }
        if (meeting.participants.includes(req.user.userId)) {
            return res.status(400).json({ message: '이미 참여하고 있는 모임입니다.' });
        }
        meeting.participants.push(req.user.userId);
        await meeting.save();
        
        const updatedMeeting = await Meeting.findById(req.params.id)
            .populate('host', 'nickname')
            .populate('participants', 'nickname');

        res.json({ message: '모임 참여 신청이 완료되었습니다.', meeting: updatedMeeting });
    } catch (error) {
        console.error("모임 참여 에러:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 모임 참여 취소 API
router.post('/:id/leave', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
        }
        if (meeting.host.toString() === req.user.userId) {
            return res.status(400).json({ message: '호스트는 모임을 떠날 수 없습니다. 모임을 삭제해주세요.' });
        }
        const participantIndex = meeting.participants.indexOf(req.user.userId);
        if (participantIndex === -1) {
            return res.status(400).json({ message: '참여하고 있는 모임이 아닙니다.' });
        }
        meeting.participants.splice(participantIndex, 1);
        await meeting.save();
        
        const updatedMeeting = await Meeting.findById(req.params.id)
            .populate('host', 'nickname')
            .populate('participants', 'nickname');
            
        res.json({ message: '모임 참여가 취소되었습니다.', meeting: updatedMeeting });
    } catch (error) {
        console.error("모임 나가기 에러:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;