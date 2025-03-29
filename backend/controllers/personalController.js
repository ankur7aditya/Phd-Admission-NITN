const PersonalDetails = require('../models/PersonalDetails');
const { uploadOnCloudinary } = require('../utils/cloudinary');

const createPersonal = async (req, res) => {
    try {
        console.log('Received personal details request:', {
            userid: req.user?._id,
            body: req.body
        });

        if (!req.user?._id) {
            console.error('User not found in request');
            return res.status(401).json({
                message: 'User not authenticated'
            });
        }

        // Validate required fields
        const requiredFields = [
            'first_name', 'last_name', 'dob', 'gender', 'nationality',
            'category', 'religion', 'father_name', 'mother_name',
            'marital_status', 'email', 'phone'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                message: 'Missing required fields',
                fields: missingFields
            });
        }

        // Check if personal details already exist
        const existingDetails = await PersonalDetails.findOne({ userid: req.user._id });
        if (existingDetails) {
            console.error('Personal details already exist for user:', req.user._id);
            return res.status(400).json({
                message: 'Personal details already exist for this user'
            });
        }

        const personalDetails = await PersonalDetails.create({
            userid: req.user._id,
            ...req.body
        });

        console.log('Personal details created successfully:', personalDetails);
        return res.status(201).json(personalDetails);
    } catch (error) {
        console.error('Error creating personal details:', error);
        return res.status(500).json({ 
            message: 'Error creating personal details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getPersonal = async (req, res) => {
    try {
        const personalDetails = await PersonalDetails.findOne({ userid: req.user._id });
        if (!personalDetails) {
            return res.status(404).json({ message: "Personal details not found" });
        }
        return res.status(200).json(personalDetails);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const response = await uploadOnCloudinary(req.file.path, 'image');
        if (!response) {
            return res.status(500).json({ message: 'Failed to upload photo' });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { userid: req.user._id },
            { photo_url: response.url },
            { new: true }
        );

        return res.status(200).json(personalDetails);
    } catch (error) {
        console.error('Error uploading photo:', error);
        return res.status(500).json({ message: 'Error uploading photo' });
    }
};

const uploadSignature = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const response = await uploadOnCloudinary(req.file.path, 'image');
        if (!response) {
            return res.status(500).json({ message: 'Failed to upload signature' });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { userid: req.user._id },
            { signature_url: response.url },
            { new: true }
        );

        return res.status(200).json(personalDetails);
    } catch (error) {
        console.error('Error uploading signature:', error);
        return res.status(500).json({ message: 'Error uploading signature' });
    }
};

const uploadDemandDraft = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const response = await uploadOnCloudinary(req.file.path, 'pdf');
        if (!response) {
            return res.status(500).json({ message: 'Failed to upload demand draft' });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { userid: req.user._id },
            { dd_url: response.url },
            { new: true }
        );

        return res.status(200).json(personalDetails);
    } catch (error) {
        console.error('Error uploading demand draft:', error);
        return res.status(500).json({ message: 'Error uploading demand draft' });
    }
};

module.exports = {
    createPersonal,
    getPersonal,
    uploadPhoto,
    uploadSignature,
    uploadDemandDraft
};
