const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (filePath) =>{
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url : result.secure_url,
            publicId : result.public_id
        }
        
    } catch (error) {
        console.error("Cloudinary Upload Error: ", error);
        throw new Error('Cloudinary Upload Error')
    }
}

module.exports = { uploadToCloudinary }