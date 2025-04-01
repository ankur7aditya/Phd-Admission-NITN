const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/authMiddleware');
const { documentUpload, imageUpload } = require('../middleware/multer');
const personalController = require('../controllers/personalController');

// Debug log to check imported functions
console.log('Imported functions:', {
    createPersonal: !!personalController.createPersonal,
    getPersonal: !!personalController.getPersonal,
    uploadPhoto: !!personalController.uploadPhoto,
    uploadSignature: !!personalController.uploadSignature,
    uploadDemandDraft: !!personalController.uploadDemandDraft,
    updatePersonal: !!personalController.updatePersonal
});

// Create personal details
router.post('/create', verifyJWT, personalController.createPersonal);

// Get personal details
router.get('/get', verifyJWT, personalController.getPersonal);

// Update personal details
router.put('/update', verifyJWT, personalController.updatePersonal);

// Upload photo
router.post('/upload-photo', verifyJWT, imageUpload.single('photo'), personalController.uploadPhoto);

// Upload signature
router.post('/upload-signature', verifyJWT, imageUpload.single('signature'), personalController.uploadSignature);

// Upload demand draft
router.post('/upload-demand-draft', 
  verifyJWT,
  documentUpload.single('document'),
  personalController.uploadDemandDraft
);

module.exports = router;
