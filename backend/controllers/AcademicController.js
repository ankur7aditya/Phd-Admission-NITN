const AcademicDetails = require('../models/AcademicDetails');
const { uploadOnCloudinary } = require('../utils/cloudinary');

// 🔹 Add/Update Academic Details
const createAcademic = async (req, res) => {
  try {
    // Check if academic details already exist
    const existingAcademic = await AcademicDetails.findOne({ userid: req.user._id });
    
    if (existingAcademic) {
      // Update existing academic details
      const updatedAcademic = await AcademicDetails.findOneAndUpdate(
        { userid: req.user._id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json({
        message: "Academic details updated successfully",
        academic: updatedAcademic
      });
    }

    // Create new academic details
    const academic = new AcademicDetails({
      ...req.body,
      userid: req.user._id
    });
    await academic.save();
    
    return res.status(201).json({
      message: "Academic details created successfully",
      academic
    });
  } catch (error) {
    console.error("Error in createAcademic:", error);
    return res.status(500).json({ 
      message: "Error saving academic details",
      error: error.message 
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

    // Validate file size (2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ message: "File size should be less than 2MB" });
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);
    
    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload file" });
    }

    // Update the academic details with the document URL
    const academic = await AcademicDetails.findOneAndUpdate(
      { userid: req.user._id },
      { $push: { 'qualifications.$.document_url': uploadResult.secure_url } },
      { new: true }
    );

    return res.status(200).json({
      message: "Academic document uploaded successfully",
      url: uploadResult.secure_url,
      academic
    });
  } catch (error) {
    console.error("Error in uploadAcademicDocument:", error);
    return res.status(500).json({ 
      message: "Error uploading document",
      error: error.message 
    });
  }
};

module.exports = { 
  createAcademic, 
  getAcademic, 
  updateAcademic, 
  uploadAcademicDocument 
};
