const { supabaseAdmin, BUCKET } = require('./supabase');
const mime = require('mime-types');

/**
 * Uploads a file buffer to Supabase Storage.
 *
 * Folder conventions (inside bucket "cms"):
 *   - Roadmap files   → roadmap/<roadmapId>/phase_<timestamp>.<ext>
 *   - Profile images  → profile-images/<userId>/profile.<ext>
 *
 * The caller is responsible for constructing the correct storagePath.
 *
 * @param {Buffer} fileBuffer    - File contents as a Node.js Buffer
 * @param {string} originalName  - Original filename (used to derive MIME type)
 * @param {string} storagePath   - Destination path inside the bucket (no leading slash)
 * @returns {Promise<string>}    - The stored path on success
 */
const uploadToSupabase = async (fileBuffer, originalName, storagePath) => {
    const contentType = mime.lookup(originalName) || 'application/octet-stream';

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true,
        });

    if (error) {
        console.error('[Supabase Storage] Upload error:', error.message);
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    console.log(`[Supabase Storage] Uploaded to ${BUCKET}/${data.path}`);
    return data.path;
};

/**
 * Creates a time-limited signed URL for a stored file.
 *
 * @param {string} storagePath - Path inside the bucket
 * @param {number} expiresIn   - Validity in seconds (default: 1 hour)
 * @returns {Promise<string>}  - Signed URL, or empty string on failure
 */
const getSignedUrl = async (storagePath, expiresIn = 3600) => {
    if (!storagePath) return '';

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, expiresIn);

    if (error) {
        console.error('[Supabase Storage] Signed URL error:', error.message);
        return '';
    }

    return data.signedUrl;
};

/**
 * Deletes a file from Supabase Storage.
 *
 * @param {string} storagePath - Path inside the bucket
 * @returns {Promise<void>}
 */
const deleteFromSupabase = async (storagePath) => {
    if (!storagePath) return;

    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove([storagePath]);

    if (error) {
        console.error('[Supabase Storage] Delete error:', error.message);
        throw new Error(`Failed to delete from Supabase: ${error.message}`);
    }

    console.log(`[Supabase Storage] Deleted ${BUCKET}/${storagePath}`);
};

module.exports = {
    uploadToSupabase,
    getSignedUrl,
    deleteFromSupabase,
};
