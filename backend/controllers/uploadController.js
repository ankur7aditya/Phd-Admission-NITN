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

    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size should be less than 5MB" });
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);
    
    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload file" });
    }

    // Set security headers
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    res.status(200).json({
      message: "Document uploaded successfully",
      url: uploadResult.secure_url
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    res.status(500).json({ 
      message: "Error uploading document",
      error: error.message 
    });
  }
};

module.exports = { uploadDocument }; 