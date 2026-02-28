const supabase = require('../config/supabase');

/**
 * Uploads a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} path - Target path in bucket
 * @returns {Promise<string>} - The file path in storage
 */
const uploadToSupabase = async (fileBuffer, fileName, path) => {
    try {
        const bucketName = process.env.SUPABASE_BUCKET || 'cms';
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(path, fileBuffer, {
                contentType: 'application/octet-stream', // Let Supabase infer if possible or set based on file
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

module.exports = {
    uploadToSupabase,
    getSignedUrl
};
