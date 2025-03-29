const express = require('express');
const router = express.Router();
const PersonalDetails = require('../models/PersonalDetails');
const { verifyJWT } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/multer');
const { createPersonal, getPersonal, uploadPhoto, uploadSignature } = require('../controllers/personalController');

// Create personal details
router.post('/create', verifyJWT, createPersonal);

// Get personal details
router.get('/get', verifyJWT, getPersonal);

// Upload photo
router.post('/upload-photo', verifyJWT, imageUpload.single('photo'), uploadPhoto);

// Upload signature
router.post('/upload-signature', verifyJWT, imageUpload.single('signature'), uploadSignature);

module.exports = router;
