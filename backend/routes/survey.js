
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SurveyResult = require('../models/SurveyResult');
const User = require('../models/User');

// --- JWT 인증 미들웨어 ---
// 요청에 포함된 쿠키의 토큰을 확인하여 로그인된 사용자인지 검증합니다.
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 요청 객체에 사용자 ID와 이름을 추가합니다.
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// --- API 라우트 ---

/**
 * GET /api/survey
 * 현재 로그인된 사용자의 기존 설문 결과를 조회합니다.
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // 토큰에서 확인된 사용자 ID로 설문 결과를 찾습니다.
    const result = await SurveyResult.findOne({ userId: req.user.userId });
    
    // 결과가 없으면 404 에러를 보냅니다.
    if (!result) {
      return res.status(404).json({ message: '저장된 설문 결과가 없습니다.' });
    }
    
    // 결과가 있으면 결과를 응답으로 보냅니다.
    res.json(result);
  } catch (error) {
    console.error("Survey GET Error:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/survey
 * 현재 로그인된 사용자의 설문 결과를 저장하거나 업데이트합니다.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { answers, recommendations } = req.body;
    const userId = req.user.userId;

    // findOneAndUpdate를 사용하여,
    // 해당 유저의 결과가 이미 있으면 내용을 업데이트(update)하고,
    // 없으면 새로 생성(insert)합니다. (upsert: true 옵션)
    const result = await SurveyResult.findOneAndUpdate(
      { userId: userId },
      { userId, answers, recommendations },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // User 모델에도 해당 결과 문서의 ID를 저장해줍니다.
    await User.findByIdAndUpdate(userId, { surveyResult: result._id });

    res.status(201).json(result);
  } catch (error) {
    console.error("Survey POST Error:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이 라우터 설정을 외부(index.js)에서 사용할 수 있도록 export합니다.
module.exports = router;