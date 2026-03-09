const supabase = require('../config/supabase');
const path = require('path');

/**
 * Helper to determine Mime Type from extension
 */
const getMimeType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    };
    return mimeMap[ext] || 'application/octet-stream';
};

/**
 * Uploads a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} path - Target path in bucket
 * @returns {Promise<string>} - The file path in storage
 */
const uploadToSupabase = async (fileBuffer, fileName, filePath) => {
    try {
        const bucketName = process.env.SUPABASE_BUCKET || 'cms';
        const contentType = getMimeType(fileName);
        
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) {
            console.error('[Supabase Storage] Upload error:', error);
            throw new Error(`Failed to upload to Supabase: ${error.message}`);
        }

        return data.path;
    } catch (err) {
        console.error('[Supabase Storage] Helper error:', err);
        throw err;
    }
};

/**
 * Gets a signed URL for a file
 * @param {string} path - Path in bucket
 * @param {number} expiresIn - Expiry in seconds (default 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
const getSignedUrl = async (path, expiresIn = 3600) => {
    try {
        if (!path) return '';

        const bucketName = process.env.SUPABASE_BUCKET || 'cms';
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('[Supabase Storage] Error creating signed URL:', error);
            return '';
        }

        return data.signedUrl;
    } catch (err) {
        console.error('[Supabase Storage] Signed URL helper error:', err);
        return '';
    }
};

/**
 * Downloads a file from Supabase
 * @param {string} path - Path in bucket
 */
const downloadFile = async (path) => {
    try {
        const bucketName = process.env.SUPABASE_BUCKET || 'cms';
        const { data, error } = await supabase.storage
            .from(bucketName)
            .download(path);

        if (error) throw error;
        return data; // This is a Blob in browser, Buffer in Node
    } catch (err) {
        console.error('[Supabase Storage] Download error:', err);
        return null;
    }
};

module.exports = {
    uploadToSupabase,
    getSignedUrl,
    downloadFile,
    getMimeType
};
