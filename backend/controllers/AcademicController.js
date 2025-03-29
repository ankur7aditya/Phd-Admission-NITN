const AcademicDetails = require('../models/AcademicDetails');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 🔹 Add/Update Academic Details
const createAcademic = async (req, res) => {
  try {
    console.log('=== Starting createAcademic ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from JWT:', JSON.stringify(req.user, null, 2));

    // Check if academic details already exist
    const existingAcademic = await AcademicDetails.findOne({ userid: req.user._id });
    console.log('Existing academic details:', existingAcademic);
    
    if (existingAcademic) {
      console.log('Updating existing academic details...');
      // Update existing academic details
      const updatedAcademic = await AcademicDetails.findOneAndUpdate(
        { userid: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      console.log('Updated academic details:', updatedAcademic);
      return res.status(200).json({
        success: true,
        message: "Academic details updated successfully",
        academic: updatedAcademic
      });
    }

    console.log('Creating new academic details...');
    // Create new academic details
    const academic = new AcademicDetails({
      ...req.body,
      userid: req.user._id // Use the user ID from JWT middleware
    });

    // Log the academic object before validation
    console.log('Academic object before validation:', JSON.stringify(academic, null, 2));

    // Validate before saving
    const validationError = academic.validateSync();
    if (validationError) {
      console.error('Validation error:', JSON.stringify(validationError.errors, null, 2));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationError.errors
      });
    }

    console.log('Validation passed, saving to database...');
    await academic.save();
    console.log('Successfully saved to database');
    
    return res.status(201).json({
      success: true,
      message: "Academic details created successfully",
      academic
    });
  } catch (error) {
    console.error('=== Error in createAcademic ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors
      });
    }

    // Handle other types of errors
    return res.status(500).json({ 
      success: false,
      message: "Error saving academic details",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOne({ userid: req.user._id });
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }
    return res.status(200).json(academic);
  } catch (error) {
    console.error("Error in getAcademic:", error);
    return res.status(500).json({ 
      message: "Error fetching academic details",
      error: error.message 
    });
  }
};

const updateAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOneAndUpdate(
      { userid: req.user._id },
      { $set: req.body },
      { new: true }
    );
    
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }
    
    return res.status(200).json({
      message: "Academic details updated successfully",
      academic
    });
  } catch (error) {
    console.error("Error in updateAcademic:", error);
    return res.status(500).json({ 
      message: "Error updating academic details",
      error: error.message 
    });
  }
};

const uploadAcademicDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size should be less than 5MB" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'academic_documents',
      resource_type: 'raw' // Changed from 'auto' to 'raw' for PDFs
    });
    
    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload file" });
    }

    // Update the academic details with the document URL
    const academic = await AcademicDetails.findOneAndUpdate(
      { userid: req.user._id },
      { $push: { 'qualifications.$.document_url': uploadResult.secure_url } },
      { new: true }
    );

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: "Academic document uploaded successfully",
      url: uploadResult.secure_url,
      academic
    });
  } catch (error) {
    console.error("Error in uploadAcademicDocument:", error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ 
      message: "Error uploading document",
      error: error.message 
    });
  }
};

const createAcademicDetails = async (req, res) => {
  try {
    const userid = req.user._id;
    const { qualifications, qualifying_exams, experience, publications } = req.body;

    // Create new academic details
    const academicDetails = new AcademicDetails({
      userid,
      qualifications,
      qualifying_exams,
      experience,
      publications
    });

    await academicDetails.save();

    res.status(201).json({
      success: true,
      message: 'Academic details created successfully',
      data: academicDetails
    });
  } catch (error) {
    console.error('Error creating academic details:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating academic details',
      error: error.message
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'academic_documents',
      resource_type: 'raw' // Changed from 'auto' to 'raw' for PDFs
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

module.exports = { 
  createAcademic, 
  getAcademic, 
  updateAcademic, 
  uploadAcademicDocument,
  createAcademicDetails,
  uploadFile
};
