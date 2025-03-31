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

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        const uploadOptions = {
            resource_type: 'auto',
            secure: true, // Force HTTPS
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            folder: 'academic_documents',
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        };

        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);
        
        // Ensure HTTPS URL
        const secureUrl = response.url.replace(/^http:/, 'https:');
        console.log("file is uploaded on cloudinary ", secureUrl);
        
        fs.unlinkSync(localFilePath);
        return { ...response, secure_url: secureUrl };
    } catch (error) {
        console.error("Error in Cloudinary upload:", error.message);
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

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
