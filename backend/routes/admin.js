const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

// --- 관리자 인증 미들웨어 ---
const verifyAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    // role이 1이면 관리자라고 가정
    if (!user || user.role !== 1) {
      return res.status(403).json({ message: '관리자 권한이 없습니다.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 1. 관리자 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
        }
        
        // 관리자 계정인지 확인 (role === 1)
        if (user.role !== 1) {
             return res.status(403).json({ message: '관리자 계정이 아닙니다.' });
        }

        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                
                res.cookie('token', user.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                }).status(200).json({ loginSuccess: true, userId: user._id });
            });
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
});

// 2. 관리자 인증 확인
router.get('/auth', verifyAdmin, (req, res) => {
    res.status(200).json({
        isAdmin: true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
    });
});

// 3. 전체 사용자 목록 조회
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '사용자 목록 조회 실패' });
    }
});

// 4. 전체 게시글 목록 조회
router.get('/posts', verifyAdmin, async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: '게시글 목록 조회 실패' });
    }
});

// 5. 문의사항(Contact) 목록 조회
router.get('/contacts', verifyAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: '문의사항 목록 조회 실패' });
    }
});

// 6. 대시보드 통계 데이터 조회
router.get('/dashboard-stats', verifyAdmin, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        const contactCount = await Contact.countDocuments();
        
        res.json({
            userCount,
            postCount,
            contactCount
        });
    } catch (error) {
        res.status(500).json({ message: '통계 데이터 조회 실패' });
    }
});

module.exports = router;