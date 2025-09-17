const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SurveyResult = require('../models/SurveyResult');
const User = require('../models/User');
const axios = require('axios');

// --- JWT 인증 미들웨어 ---
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// --- API 라우트 ---

// 기존 설문 결과 조회
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await SurveyResult.findOne({ userId: req.user.userId });
    if (!result) {
      return res.status(404).json({ message: '저장된 설문 결과가 없습니다.' });
    }
    res.json(result);
  } catch (error) {
    console.error("Survey GET Error:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 설문 결과 저장
router.post('/', verifyToken, async (req, res) => {
  try {
    const { answers, recommendations } = req.body;
    const userId = req.user.userId;

    const result = await SurveyResult.findOneAndUpdate(
      { userId: userId },
      { userId, answers, recommendations },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await User.findByIdAndUpdate(userId, { surveyResult: result._id });

    res.status(201).json(result);
  } catch (error) {
    console.error("Survey POST Error:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Python AI 서버에 추천을 요청하는 API
router.post('/recommend', verifyToken, async (req, res) => {
    try {
        const { answers } = req.body;
        
        console.log('Python AI 서버(http://127.0.0.1:5000/recommend)로 추천 요청을 보냅니다...');
        
        const aiResponse = await axios.post('http://127.0.0.1:5000/recommend', {
            answers: answers 
        });

        console.log('AI 서버로부터 응답을 받았습니다.');
        res.json(aiResponse.data);

    } catch (error) {
        // 👇 --- [수정] 에러 로그를 더 자세히 출력하도록 변경했습니다. --- 👇
        console.error("AI 서버 호출 중 심각한 오류 발생!");
        if (axios.isAxiosError(error)) {
            // Python 서버가 응답을 하긴 했지만, 그 응답이 에러인 경우 (예: 404, 500)
            if (error.response) {
                console.error("AI 서버 응답 상태:", error.response.status);
                console.error("AI 서버 응답 데이터:", error.response.data);
                return res.status(500).json({ message: `AI 서버가 오류를 반환했습니다: ${error.response.status}` });
            } 
            // Python 서버 자체가 꺼져있거나, 주소가 잘못되어 응답이 아예 없는 경우
            else if (error.request) {
                console.error("AI 서버로부터 응답이 없습니다. AI 서버가 실행 중인지, 주소가 올바른지 확인해주세요.");
                return res.status(500).json({ message: "AI 추천 서버에 연결할 수 없습니다." });
            }
        }
        // 그 외의 일반적인 오류
        console.error("알 수 없는 오류:", error.message);
        res.status(500).json({ message: "AI 추천 요청 처리 중 문제가 발생했습니다." });
    }
});

module.exports = router;