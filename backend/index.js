require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

const userRoutes = require("./routes/user");

app.use(express.json())
app.use(express.urlencoded())

app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

mongoose
  .connect(process.env.MONGO_URI?.trim())
  .then(() => console.log("MongoDB와 연결이 되었습니다."))
  .catch((error) => console.log("MongoDB와 연결에 실패했습니다: ", error));

app.listen(PORT, () => {
  console.log("Server is running");
});