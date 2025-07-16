const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

router.post('/upload', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const userId = req.user.id;
    const uploadDir = path.join(__dirname, '../../uploads', userId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `profile_${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    await sharp(req.file.buffer).resize(200, 200).jpeg({ quality: 90 }).toFile(filepath);
    const imageUrl = `/uploads/${userId}/${filename}`;
    await User.findByIdAndUpdate(userId, { profileImage: imageUrl });
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router; 