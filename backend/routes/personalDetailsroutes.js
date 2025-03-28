const express = require('express');
const router = express.Router();
const PersonDetails = require('../models/PersonDetails');
const  authenticateUser  = require('../middleware/authMiddleware');

router.post('/create', authenticateUser, async (req, res) => {
    try {
        const personalDetails = new PersonDetails({
            ...req.body,
            userId: req.user.id
        });
        await personalDetails.save();
        res.status(201).json(personalDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/get', authMiddleware, async (req, res) => {
    try {
        const personalDetails = await PersonDetails.findOne({ userId: req.user.id });
        if (!personalDetails) {
            return res.status(404).json({ message: 'Personal details not found' });
        }
        res.json(personalDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
