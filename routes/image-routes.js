const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/admin-middleware')
const authMiddleware = require('../middleware/auth-middleware')
const uploadMiddleware = require('../middleware/upload-middleware');
const {uploadImageController, fetchImagesController , deleteImageController} = require('../controllers/image-controller')


// upload the image
router.post('/upload', authMiddleware, adminMiddleware , uploadMiddleware.single('image'), uploadImageController )

// to get all the image
router.get('/fetch', authMiddleware, fetchImagesController)

// delete image from database
router.delete('/:id', authMiddleware, adminMiddleware, deleteImageController)

module.exports = router;