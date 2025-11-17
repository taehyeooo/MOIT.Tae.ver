const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { verifyToken } = require('../utils/auth'); // (기존 auth.js의 verifyUser)

// --- [신규] 추가된 모듈 ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process'); // Python 스크립트 실행용
const SurveyResult = require('../models/SurveyResult'); // (이전 단계에서 생성한 설문 결과 모델)
// ---

// --- [신규] Multer 설정 (이미지 업로드) ---
// (upload.js와 유사하게 설정)
const uploadDir = 'uploads/'; // /backend/uploads/
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일 이름: fieldname-timestamp.확장자 (예: meetingImage-1678886400000.png)
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: (req, file, cb) => {
        // 이미지 파일만 허용 (image/jpeg, image/png 등)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
        }
    }
});
// --- Multer 설정 끝 ---


// --- 기존 라우트 (변경 없음): GET / (모든 모임 조회) ---
router.get('/', async (req, res) => {
    try {
        const meetings = await Meeting.find().populate('host', 'username').populate('members', 'username');
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});


// --- [신규] POST / (새 모임 생성, 이미지 업로드 포함) ---
router.post(
    '/', 
    verifyToken, // 1. 로그인 여부 확인
    upload.single('meetingImage'), // 2. 'meetingImage'라는 이름의 파일을 받아서 처리
    async (req, res) => {
        try {
            // 3. 텍스트 데이터 (req.body)
            const { title, category, description, location, maxParticipants, meetingTime } = req.body;
            
            // 4. (필수) Meeting.js 모델 스키마에 아래 필드들이 정의되어 있어야 합니다.
            const newMeeting = new Meeting({
                title,
                category,
                description, // (스키마에 추가 필요)
                location, // (스키마에 추가 필요)
                maxParticipants: parseInt(maxParticipants, 10), // (스키마에 추가 필요)
                meetingTime: new Date(meetingTime), // (스키마에 추가 필요)
                host: req.user.id, // 5. 호스트 정보 (로그인한 사용자)
                members: [req.user.id], // 호스트는 자동으로 멤버로 추가
                imageUrl: req.file ? `/${uploadDir}${req.file.filename}` : null // 6. 파일 경로 저장 (파일 없으면 null)
            });

            const savedMeeting = await newMeeting.save();
            res.status(201).json(savedMeeting);

        } catch (error) {
            console.error('모임 생성 에러:', error);
            if (error.name === 'ValidationError') {
                // 이 에러는 Meeting.js 스키마에 필드가 없거나, required 필드가 누락될 때 발생합니다.
                res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.', details: error.errors });
            } else {
                res.status(500).json({ message: '서버 오류로 모임 생성에 실패했습니다.' });
            }
        }
    }
);


// --- [수정] GET /recommend (AI 대신 최신순 모임 추천) ---
router.get(
    '/recommend',
    verifyToken, // 1. 로그인 확인
    async (req, res) => {
        try {
            // 2. AI 스크립트 대신 간단한 추천 스크립트 호출
            const pythonScriptPath = path.join(__dirname, '..', 'recommendAI', 'simple_recommend.py'); 
            
            // 3. Python 자식 프로세스 실행 (입력값 없이)
            const pythonProcess = spawn('python', [pythonScriptPath]);
            
            let recommendedData = ''; // Python 스크립트의 표준 출력 (성공)
            let errorData = ''; // Python 스크립트의 표준 에러 (실패)

            pythonProcess.stdout.on('data', (data) => {
                recommendedData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            // 4. Python 스크립트 종료 시 (기존 로직과 거의 동일)
            pythonProcess.on('close', async (code) => {
                if (code !== 0 || errorData) {
                    console.error(`Python 스크립트 오류 (Code: ${code}):`, errorData);
                    // AI 추천 엔진 -> 추천 시스템으로 문구 변경
                    return res.status(500).json({ message: '추천 시스템 오류가 발생했습니다.' });
                }

                try {
                    // 5. Python이 출력한 JSON 파싱 (모임 ID 배열)
                    const recommendedMeetingIds = JSON.parse(recommendedData);
                    
                    if (!Array.isArray(recommendedMeetingIds)) {
                        throw new Error('추천 응답 형식이 올바르지 않습니다. (배열이 아님)');
                    }

                    // 6. Mongoose로 추천된 모임 ID 목록을 조회
                    const recommendedMeetings = await Meeting.find({
                        '_id': { $in: recommendedMeetingIds }
                    });
                    
                    // 7. 반환된 ID 순서대로 정렬
                    const sortedMeetings = recommendedMeetings.sort((a, b) => {
                        return recommendedMeetingIds.indexOf(a._id.toString()) - recommendedMeetingIds.indexOf(b._id.toString());
                    });

                    res.json(sortedMeetings);

                } catch (parseError) {
                    console.error('Python 응답 파싱 오류:', parseError, recommendedData);
                    res.status(500).json({ message: '추천 응답 처리 중 오류가 발생했습니다.' });
                }
            });

        } catch (error) {
            console.error('모임 추천 처리 중 오류:', error);
            res.status(500).json({ message: '서버 오류로 추천을 받지 못했습니다.' });
        }
    }
);


// --- 기존 라우트 (변경 없음): GET /:id (특정 모임 조회) ---
router.get('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id).populate('host', 'username').populate('members', 'username');
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meeting' });
    }
});


// --- 기존 라우트 (변경 없음): POST /:id/join (모임 참가) ---
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        if (meeting.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already joined' });
        }
        
        // (선택) 최대 인원 수 확인 로직 추가 가능
        if (meeting.maxParticipants && meeting.members.length >= meeting.maxParticipants) {
             return res.status(400).json({ message: '모임 정원이 가득 찼습니다.' });
        }

        meeting.members.push(req.user.id);
        await meeting.save();
        
        // populate를 다시 해서 최신 멤버 목록과 함께 반환 (선택 사항)
        const updatedMeeting = await Meeting.findById(req.params.id).populate('host', 'username').populate('members', 'username');
        res.json(updatedMeeting);

    } catch (error) {
        res.status(500).json({ message: 'Error joining meeting' });
    }
});


module.exports = router;