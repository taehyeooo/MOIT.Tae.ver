require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;
// [추가] path 모듈을 가져옵니다.
const path = require("path");

const userRoutes = require("./routes/user");
const contactRoutes = require("./routes/contact");
const postRoutes = require("./routes/post");
const uploadRoutes = require("./routes/upload");
const surveyRoutes = require("./routes/survey");
const meetingRoutes = require("./routes/meeting");
const statsRoutes = require("./routes/stats"); // 👈 [추가] 통계 라우트 불러오기

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// [핵심 수정] 업로드된 파일이 있는 'uploads' 폴더를 정적(Static) 폴더로 설정합니다.
// 브라우저가 '/uploads/파일이름'으로 요청하면, 서버는 이 폴더에서 파일을 찾아 응답합니다.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 👈 이 줄을 추가합니다.

app.use("/api/auth", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/post", postRoutes); 
app.use("/api/upload", uploadRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/stats", statsRoutes); // 👈 [추가] 통계 API 경로 등록

app.get("/", (req, res) => {
  res.send("Hello world");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB와 성공적으로 연결되었습니다."))
  .catch((error) => console.log("❌ MongoDB 연결에 실패했습니다: ", error));

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});