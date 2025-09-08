require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// 라우터 import
const userRoutes = require("./routes/user");

// --- 미들웨어 설정 ---

// CORS 설정: 프론트엔드(5173 포트)의 요청을 허용하도록 수정합니다.
app.use(
  cors({
    origin: "http://localhost:5173", // 여기를 5174에서 5173으로 변경했습니다.
    credentials: true,
  })
);

// Express 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 프록시 서버를 사용하는 경우 IP를 정확히 식별하기 위한 설정
app.set('trust proxy', true);


// --- 라우트 설정 ---

// '/api/auth' 경로로 오는 요청은 userRoutes에서 처리
app.use("/api/auth", userRoutes);

// IP 블랙리스트 확인 API 엔드포인트
app.get("/api/check-ip", (req, res) => {
  const clientIP = req.ip; // 'trust proxy' 설정으로 인해 정확한 IP를 가져옵니다.
  // .env 파일에서 블랙리스트를 가져옵니다. 없으면 빈 배열로 시작합니다.
  const blacklistedIPs = JSON.parse(process.env.IP_BLACKLIST || '[]');

  console.log("접속 시도 IP:", clientIP);
  console.log("블랙리스트:", blacklistedIPs);

  if (blacklistedIPs.includes(clientIP)) {
    console.log(`차단된 IP(${clientIP})의 접근을 거부했습니다.`);
    return res.status(403).json({ allowed: false, message: "귀하의 IP는 접근이 차단되었습니다." });
  }

  // 블랙리스트에 없으면 접근 허용
  res.json({ allowed: true });
});


// 루트 경로
app.get("/", (req, res) => {
  res.send("Hello world");
});


// --- 서버 및 데이터베이스 연결 ---
mongoose
  .connect(process.env.MONGO_URI?.trim())
  .then(() => console.log("MongoDB와 연결이 되었습니다."))
  .catch((error) => console.log("MongoDB와 연결에 실패했습니다: ", error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

