const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    },
    // 설문조사 결과 (JSON 형태)
    surveyProfile: {
        type: mongoose.Schema.Types.Mixed, // 유연한 객체 저장
        default: {} 
    },
    // AI 분석 결과 (텍스트 또는 객체)
    hobbyRecommendation: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
});

// 비밀번호 암호화
userSchema.pre("save", function (next) {
    var user = this;

    if (user.isModified("password")) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// 비밀번호 비교
userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// 토큰 생성
userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), process.env.JWT_SECRET); // .env의 비밀키 사용
    user.token = token;
    user.save()
        .then(() => cb(null, user))
        .catch((err) => cb(err));
};

// 토큰으로 유저 찾기
userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        user.findOne({ "_id": decoded, "token": token })
            .then((user) => cb(null, user))
            .catch((err) => cb(err));
    });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };