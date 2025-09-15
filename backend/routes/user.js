

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

/**
 * ---------------------------------
 * POST /api/auth/signup - 회원가입 (수정됨)
 * ---------------------------------
 */
router.post('/signup', async (req, res) => {
  try {
    // <<< 수정: name, nickname, email 필드를 추가로 받습니다.
    const { username, password, name, nickname, email } = req.body;

    // <<< 수정: 모든 필드가 있는지 확인합니다.
    if (!username || !password || !name || !nickname || !email) {
      return res.status(400).json({ message: '모든 필수 정보를 입력해주세요.' });
    }

    // <<< 추가: 아이디, 닉네임, 이메일 중복 확인 로직
    const existingUser = await User.findOne({ $or: [{ username }, { nickname }, { email }] });
    if (existingUser) {
        if (existingUser.username === username) {
            return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
        }
        if (existingUser.nickname === nickname) {
            return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        }
        if (existingUser.email === email) {
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // <<< 수정: 새로운 필드를 포함하여 User 모델을 생성합니다.
    const user = new User({ username, password: hashedPassword, name, nickname, email });
    await user.save();

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * ---------------------------------
 * POST /api/auth/login - 로그인
 * ---------------------------------
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '사용자 이름과 비밀번호를 모두 입력해주세요.' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    if (!user.isActive) {
        return res.status(403).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res.status(403).json({
          message: '비밀번호를 5회 이상 틀려 계정이 비활성화되었습니다.',
        });
      }

      await user.save();
      return res.status(401).json({
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        remainingAttempts: 5 - user.failedLoginAttempts,
      });
    }
    
    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;
    
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      user.ipAddress = response.data.ip;
    } catch (ipError) {
      console.error("IP 주소를 가져오는 중 오류 발생:", ipError.message);
      user.ipAddress = req.ip;
    }
    
    await user.save();

    const token = jwt.sign(
      // <<< 수정: 토큰에 nickname도 포함시켜 Navbar에서 바로 사용할 수 있도록 합니다.
      { userId: user._id, username: user.username, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * ----------------------------------------------------
 * POST /api/auth/verify-token - 토큰 검증 (상태 유지)
 * ----------------------------------------------------
 */
router.post("/verify-token", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "토큰이 없습니다." });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user || !user.isLoggedIn) {
        return res.status(401).json({ message: "인증 실패" });
      }
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
});

/**
 * ---------------------------------
 * POST /api/auth/logout - 로그아웃
 * ---------------------------------
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
            user.isLoggedIn = false;
            await user.save();
        }
    }
    res.clearCookie('token');
    res.json({ message: '로그아웃되었습니다.' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.clearCookie('token');
    res.status(200).json({ message: '로그아웃 처리 중 오류가 있었지만, 쿠키는 삭제되었습니다.' });
  }
});

/**
 * ---------------------------------------
 * DELETE /api/auth/delete/:userId - 계정 삭제
 * ---------------------------------------
 */
router.delete('/delete/:userId', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;