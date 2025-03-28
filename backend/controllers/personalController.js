const PersonalDetails = require('../models/PersonalDetails');
const { uploadOnCloudinary } = require('../utils/cloudinary');

const createPersonal = async (req, res) => {
    try {
        console.log('Received personal details request:', {
            userid: req.user._id,
            body: req.body
        });

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
            stack: error.stack
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
            return res.status(400).json({ message: "No file uploaded" });
        }

        const localFilePath = req.file.path;
        const response = await uploadOnCloudinary(localFilePath);

        if (!response) {
            return res.status(500).json({ message: "Error uploading file" });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { userid: req.user._id },
            { photo: response.secure_url },
            { new: true }
        );

        return res.status(200).json({
            message: "Photo uploaded successfully",
            url: response.secure_url
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        return res.status(500).json({ error: error.message });
    }
};

const uploadSignature = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const localFilePath = req.file.path;
        const response = await uploadOnCloudinary(localFilePath);

        if (!response) {
            return res.status(500).json({ message: "Error uploading file" });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { userid: req.user._id },
            { signature: response.secure_url },
            { new: true }
        );

        return res.status(200).json({
            message: "Signature uploaded successfully",
            url: response.secure_url
        });
    } catch (error) {
        console.error('Error uploading signature:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPersonal,
    getPersonal,
    uploadPhoto,
    uploadSignature
};
