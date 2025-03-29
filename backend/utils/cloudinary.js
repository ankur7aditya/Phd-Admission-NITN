const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

//Configuration
cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, fileType = 'image') => {
    try {
        if(!localFilePath) return null;

        // Determine resource type and format based on file type
        const uploadOptions = {
            resource_type: fileType === 'pdf' ? 'raw' : 'image',
            delivery_type: "upload",
            access_mode: "public"
        };

        // Add transformations based on file type
        if (fileType === 'pdf') {
            uploadOptions.transformation = [
                { flags: "attachment" }
            ];
        } else {
            uploadOptions.transformation = [
                { quality: "auto" },
                { fetch_format: "auto" }
            ];
        }

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);
        
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("Error occurred while uploading from Cloudinary:", error.message)
        fs.unlinkSync(localFilePath) 
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
