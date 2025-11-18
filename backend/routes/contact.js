const express = require('express');
const router = express.Router();
const { Contact } = require('../models/Contact');

router.post('/', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();
        res.status(200).json({ success: true, message: '문의사항이 접수되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, err });
    }
});

module.exports = router;