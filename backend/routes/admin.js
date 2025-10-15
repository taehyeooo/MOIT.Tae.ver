const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Contact = require('../models/Contact');
const { verifyToken } = require('../utils/auth');

// 모든 관리자 API는 토큰 검증 및 관리자 역할 확인을 거칩니다.
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next(); // 관리자 역할이 맞으면 다음 미들웨어로 진행
        } else {
            res.status(403).json({ message: '접근 권한이 없습니다. 관리자만 접근 가능합니다.' });
        }
    });
};

// 모든 /api/admin 경로에 verifyAdmin 미들웨어 적용
router.use(verifyAdmin);


/**
 * ---------------------------------
 * GET /api/admin/stats - 대시보드 통계
 * ---------------------------------
 */
router.get('/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const meetingCount = await Meeting.countDocuments();
        const contactCount = await Contact.countDocuments();

        res.json({
            userCount,
            meetingCount,
            contactCount
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ message: '통계 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
});


/**
 * ---------------------------------
 * GET /api/admin/users - 모든 사용자 목록
 * ---------------------------------
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Admin fetch users error:", error);
        res.status(500).json({ message: '사용자 목록을 불러오는 중 오류가 발생했습니다.' });
    }
});


/**
 * ---------------------------------
 * GET /api/admin/meetings - 모든 모임 목록
 * ---------------------------------
 */
router.get('/meetings', async (req, res) => {
    try {
        const meetings = await Meeting.find().populate('host', 'username nickname').sort({ createdAt: -1 });
        res.json(meetings);
    } catch (error) {
        console.error("Admin fetch meetings error:", error);
        res.status(500).json({ message: '모임 목록을 불러오는 중 오류가 발생했습니다.' });
    }
});

module.exports = router;

