const Image = require('../modules/image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const cloudinary = require('../config/cloudinary');
const { data } = require('react-router-dom');

const uploadImageController = async (req , res) =>{
    try {

        // check if file is missing in request object
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'File is required. Please attach a file.'
            });
        }

            // upload to cloudinary
            const { url, publicId} = await uploadToCloudinary(req.file.path);

            // store the image url and publicId along with the uploader user id in the database
            const newlyUploadedImage = new Image({
                url,
                publicId,
                uploadedBy : req.userInfo.userId
            })

            await newlyUploadedImage.save();

            res.status(201).json({
                success: true,
                message: 'Image uploaded successfully',
                image: newlyUploadedImage
            })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message: 'Something went wrong! please try again '
        })
    }
}

const fetchImagesController = async (req, res)=>{
    try { 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1: -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);
        const sortObj = {};
        sortObj[sortBy] = sortOrder;
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);



        if(images){
            res.status(200).json({
                success : true,
                currentPage: page,
                totolPages: totalPages,
                totalImages: totalImages,
                data : images
            })
        }
    } catch (error) {
         console.error(error);
        res.status(500).json({
            success : false,
            message: 'Something went wrong! please try again '
        })
    }
}

const deleteImageController = async(req, res)=>{
    try {
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentIdOfImageToBeDeleted);
        if(!image){
            return res.status(400).json({
                success:'false',
                message:'Image not founded '
            })
        }
        
        // check if this is uploaded by the current user who is trying to deleted this image
        if(image.uploadedBy.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this image."
            })
        }
// delete this image first from your cloudinary 
await cloudinary.uploader.destroy(image.publicId);

// delete this image from mongodb database
await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);





res.status(200).json({
    success: true,
    message: 'Image deleted from database'
})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false,
            message: 'Something went wrong! please try again '
        })
    }
}


module.exports = { uploadImageController
    ,
    fetchImagesController,
    deleteImageController
}