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
        
        // [수정] 환경 변수 사용 (없으면 기본값 8000번 포트)
        const aiBaseUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';
        const aiAgentUrl = `${aiBaseUrl}/agent/invoke`;
        
        console.log(`AI 에이전트 서버(${aiAgentUrl})로 추천 요청을 보냅니다...`);

        // 👇 --- answers 객체에서 올바른 키(Q6, Q7 등)로 값을 읽어오도록 변환 --- 👇
        const budgetMap = {
            '5만원 미만': 50000,
            '5~10만원': 100000,
            '10~20만원': 200000,
            '20만원 이상': 1000000
        };

        const timeMap = {
            '3시간 미만': 3,
            '3~5시간': 5,
            '5~10시간': 10,
            '10시간 이상': 24
        };

        const payload = {
            user_input: {
                survey: {
                    "Q6": Number(answers.Q6) || 3,
                    "Q7": Number(answers.Q7) || 3,
                    "Q8": Number(answers.Q8) || 3,
                    "Q9": Number(answers.Q9) || 3,
                    "Q10": Number(answers.Q10) || 3,
                    "Q11": Number(answers.Q11) || 3,
                    "Q12": Number(answers.Q12) || 3,
                    "Q13": Number(answers.Q13) || 3,
                    "Q14": Number(answers.Q14) || 3,
                    "Q15": Number(answers.Q15) || 3
                },
                user_context: {
                    "monthly_budget": budgetMap[answers.monthly_budget] || 100000,
                    "session_time_limit_hours": timeMap[answers.weekly_time] || 5,
                    "offline_ok": true,
                    "user_id": req.user.userId
                }
            }
        };
        
        const agentResponse = await axios.post(aiAgentUrl, payload);

        console.log('AI 에이전트로부터 응답을 받았습니다.');

        const finalAnswer = JSON.parse(agentResponse.data.final_answer);
        res.json(finalAnswer);

    } catch (error) {
        console.error("AI 에이전트 호출 중 심각한 오류 발생!");
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("AI 에이전트 응답 상태:", error.response.status);
                console.error("AI 에이전트 응답 데이터:", error.response.data);
                return res.status(500).json({ message: `AI 에이전트가 오류를 반환했습니다: ${error.response.status}` });
            } 
            else if (error.request) {
                console.error("AI 에이전트로부터 응답이 없습니다. Python 서버(main_V3.py)가 8000번 포트에서 실행 중인지 확인해주세요.");
                return res.status(500).json({ message: "AI 추천 에이전트에 연결할 수 없습니다." });
            }
        }
        console.error("알 수 없는 오류:", error.message);
        res.status(500).json({ message: "AI 추천 요청 처리 중 문제가 발생했습니다." });
    }
});

module.exports = router;