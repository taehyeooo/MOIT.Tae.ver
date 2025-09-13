const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { marked } = require('marked');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

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

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    const userAgent = req.headers['user-agent'];

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hasRecentView = post.viewLogs.some(
      log =>
        log.ip === ip &&
        log.userAgent === userAgent &&
        new Date(log.timestamp) > oneDayAgo
    );

    if (!hasRecentView) {
      post.views += 1;
      post.viewLogs.push({ 
        ip, 
        userAgent,
        timestamp: new Date()
      });
      await post.save();
    }

    let htmlContent;
    try {
      htmlContent = marked.parse(post.content || '');
    } catch (error) {
      console.error('마크다운 변환 실패:', error);
      htmlContent = post.content;
    }

    const responseData = {
      ...post.toObject(),
      renderedContent: htmlContent,
    };

    res.json(responseData);
  } catch (error) {
    console.error('게시글 조회 에러:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, fileUrl } = req.body;
    
    const latestPost = await Post.findOne().sort({ number: -1 });
    const nextNumber = latestPost ? latestPost.number + 1 : 1;
    
    const post = new Post({
      number: nextNumber,
      title,
      content,
      fileUrl
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, fileUrl } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const oldContentImages = post.content.match(imgRegex) || [];
    const newContentImages = content.match(imgRegex) || [];
    
    const deletedImages = oldContentImages.filter(url => !newContentImages.includes(url));
    const deletedFiles = (post.fileUrl || []).filter(url => !(fileUrl || []).includes(url));
    
    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname.substring(1));
      } catch (error) {
        console.error('URL 파싱 에러:', error);
        return null;
      }
    };

    const allDeletedFiles = [...deletedImages, ...deletedFiles];
    for (const fileUrl of allDeletedFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
          }));
          console.log('파일 삭제 완료:', key);
        } catch (error) {
          console.error('S3 파일 삭제 에러:', error);
        }
      }
    }
    
    post.title = title;
    post.content = content;
    post.fileUrl = fileUrl;
    post.updatedAt = Date.now();
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('게시글 수정 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const contentImages = post.content.match(imgRegex) || [];

    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname.substring(1));
      } catch (error) {
        console.error('URL 파싱 에러:', error);
        return null;
      }
    };

    const allFiles = [...contentImages, ...(post.fileUrl || [])];

    for (const fileUrl of allFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        console.log('삭제할 파일 키:', key);
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
          }));
        } catch (error) {
          console.error('S3 파일 삭제 에러:', error);
        }
      }
    }
    
    await post.deleteOne();
    res.json({ message: '게시글과 관련 파일들이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;