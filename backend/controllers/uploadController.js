const { uploadOnCloudinary } = require("../utils/cloudinary");

const uploadDocument = async (req, res) => {
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

    res.status(200).json({
      message: "Document uploaded successfully",
      url: uploadResult.secure_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadDocument }; 