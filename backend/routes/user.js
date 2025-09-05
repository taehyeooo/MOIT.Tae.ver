const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('../models/User'); // 모델 자체 export 가정

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username, password가 필요합니다.' });
    }

    const uname = String(username).trim().toLowerCase();

    const existing = await User.findOne({ username: uname }).lean();
    if (existing) {
      return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({ username: uname, password: hashed });

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: { id: created._id, username: created.username },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username, password가 필요합니다.' });
    }

    const uname = String(username).trim().toLowerCase();

    // password는 select:false 라서 +password로 명시 조회
    const user = await User.findOne({ username: uname }).select('+password');
    if (!user) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }

    if (user.isLoggedIn) {
      return res.status(401).json({ message: '이미 다른 기기에서 로그인되어 있습니다.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastLoginAttempt = new Date();

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res.status(401).json({
          message: '비밀번호를 5회 이상 틀려 계정이 비활성화되었습니다.',
        });
      }

      await user.save();
      return res.status(401).json({
        message: '비밀번호가 일치하지 않습니다.',
        remainingAttempts: 5 - user.failedLoginAttempts,
      });
    }

    // 로그인 성공 처리
    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;

    // IP 기록: 서버 관점 IP 우선, 외부 IP는 axios로 보조 조회
    let ip = req.ip;
    try {
      const { data } = await axios.get('https://api.ipify.org', {
        params: { format: 'json' },
        timeout: 2500,
      });
      if (data && data.ip) ip = data.ip;
    } catch (_) { /* 무시 */ }
    user.ipAddress = ip;

    await user.save();

    // JWT 발급
    const secret = process.env.JWT_SECRET && process.env.JWT_SECRET.trim();
    if (!secret) {
      return res.status(500).json({ message: '서버 설정 오류(JWT_SECRET 미설정).' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      secret,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 쿠키 설정 (개발환경에서는 secure=false)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({ message: '로그인 성공', user: userWithoutPassword });
  } catch (error) {
    console.error('서버 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/logout (선택)
router.post('/logout', async (req, res) => {
  try {
    const { username } = req.body || {};
    if (username) {
      const uname = String(username).trim().toLowerCase();
      await User.findOneAndUpdate(
        { username: uname },
        { $set: { isLoggedIn: false } },
        { new: true }
      );
    }
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json({ message: '로그아웃 성공' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;