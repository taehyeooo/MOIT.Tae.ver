const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const { verifyToken } = require('../utils/auth');

/**
 * ---------------------------------
 * POST /api/auth/signup - 회원가입
 * ---------------------------------
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, nickname, email } = req.body;

    if (!username || !password || !name || !nickname || !email) {
      return res.status(400).json({ message: '모든 필수 정보를 입력해주세요.' });
    }

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

    // [수정됨] 여기서 비밀번호를 암호화하지 않고 그대로 넘깁니다.
    // (User 모델의 pre('save') 미들웨어가 자동으로 암호화를 수행하기 때문입니다)
    const user = new User({ 
        username, 
        password, // 👈 암호화된 hashedPassword 대신 원본 password를 넣어야 합니다.
        name, 
        nickname, 
        email 
    });
    
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

    // Select both possible password fields
    const user = await User.findOne({ username }).select('+password +password_hash');
    if (!user) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    if (!user.isActive) {
        return res.status(403).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }

    // Determine which password field to use
    const hashToCompare = user.password || user.password_hash;
    if (!hashToCompare) {
        return res.status(500).json({ message: '계정에 비밀번호 정보가 없어 로그인할 수 없습니다.' });
    }

    // [확인] bcrypt 대신 bcryptjs를 사용하므로 호환성 문제 없음
    const isValidPassword = await bcrypt.compare(password, hashToCompare);
    
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
    
    // Self-healing: If the old field was used, migrate it to the new standard.
    if (user.password_hash && !user.password) {
        user.password = user.password_hash;
        user.password_hash = undefined;
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
 * ---------------------------------
 * GET /api/auth/mypage - 마이페이지 데이터 조회
 * ---------------------------------
 */
router.get('/mypage', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const hostedMeetings = await Meeting.find({ host: userId }).sort({ date: -1 });
    
    const joinedMeetings = await Meeting.find({ 
      participants: userId, 
      host: { $ne: userId } 
    }).sort({ date: -1 });

    res.json({
      user,
      hostedMeetings,
      joinedMeetings
    });

  } catch (error) {
    console.error("마이페이지 데이터 조회 에러:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * ---------------------------------
 * PUT /api/auth/profile - 프로필 정보 수정
 * ---------------------------------
 */
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { nickname, email, currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 닉네임, 이메일 중복 확인
        if (nickname && nickname !== user.nickname) {
            const existingNickname = await User.findOne({ nickname: nickname, _id: { $ne: userId } });
            if (existingNickname) {
                return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
            }
            user.nickname = nickname;
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email: email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
            }
            user.email = email;
        }

        // 비밀번호 변경 로직
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: '현재 비밀번호를 입력해주세요.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({ message: '프로필이 성공적으로 업데이트되었습니다.', user: updatedUser });
    } catch (error) {
        console.error("프로필 업데이트 에러:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
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

/**
 * -----------------------------------------------------------
 * DELETE /api/auth/delete-by-username/:username - 계정 삭제 (임시)
 * -----------------------------------------------------------
 */
router.delete('/delete-by-username/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOneAndDelete({ username: username });
      if (!user) {
        return res.status(404).json({ message: '해당 사용자 이름을 가진 사용자를 찾을 수 없습니다.' });
      }
      res.json({ message: `사용자 '${username}'이(가) 성공적으로 삭제되었습니다.` });
    } catch (error) {
      console.error("Delete User by Username Error:", error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;