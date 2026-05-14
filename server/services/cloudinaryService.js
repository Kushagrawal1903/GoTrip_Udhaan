const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImageToCloudinary = (buffer, folder = 'gotrip_avatars') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        // End the stream with the buffer
        stream.end(buffer);
    });
};

/**
 * Delete an image from Cloudinary using its URL
 * @param {string} imageUrl - The secure URL of the image
 */
const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        
        // Extract public_id from URL
        const parts = imageUrl.split('/');
        const fileWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
    }
};

module.exports = {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
};
