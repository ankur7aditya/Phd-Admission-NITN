const cloudinary = require('cloudinary').v2;
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

//Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

const uploadOnCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: options.resource_type || 'auto',
      folder: options.folder || 'uploads',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

const deleteFromCloudinary = async (imageUrl, resourceType = 'image') => {
    try {
        if(!imageUrl) return null;
        const response = await cloudinary.uploader.destroy(imageUrl, {
            resource_type: resourceType
        })
        console.log("Cloudinary Deletion Response", response);
        return response
    } catch(error) {
        console.error("Error occurred while deleting from Cloudinary", error.message)
        throw {success: false, message: error.message, statusCode: 500};
    }
}

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
