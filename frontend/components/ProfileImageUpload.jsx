import { useState, useRef } from 'react';

/**
 * ProfileImageUpload
 *
 * Props:
 *   currentImageUrl  {string|null}  — existing profileImageUrl from DB
 *   onUpload         {(file: File) => Promise<void>}   — called with selected File
 *   onDelete         {() => Promise<void>}             — called when Delete confirmed
 *   accentColor      {string}  — CSS colour for the header gradient (default blue)
 *   userName         {string}  — used for avatar initials fallback
 */
export default function ProfileImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  accentColor = '#3b82f6',
  userName = '',
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const initial = userName?.charAt(0).toUpperCase() || '?';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB.');
      e.target.value = '';
      return;
    }

    setError('');
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setError('');
    try {
      await onDelete();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .piu-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .piu-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
          position: relative;
        }

        .piu-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .piu-spinner-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 50%;
        }

        .piu-spinner {
          width: 26px;
          height: 26px;
          border: 3px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: piu-spin 0.7s linear infinite;
        }

        @keyframes piu-spin {
          to { transform: rotate(360deg); }
        }

        .piu-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .piu-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: opacity 0.15s, transform 0.1s;
        }

        .piu-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .piu-btn:not(:disabled):hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .piu-btn-upload {
          background: rgba(255,255,255,0.25);
          color: white;
          backdrop-filter: blur(6px);
        }

        .piu-btn-delete {
          background: rgba(239, 68, 68, 0.75);
          color: white;
        }

        .piu-error {
          font-size: 12px;
          color: #fecaca;
          text-align: center;
          max-width: 200px;
        }

        /* Confirm dialog overlay */
        .piu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .piu-dialog {
          background: white;
          border-radius: 14px;
          padding: 28px 32px;
          max-width: 340px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          text-align: center;
        }

        .piu-dialog h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .piu-dialog p {
          margin: 0 0 20px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .piu-dialog-btns {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .piu-dialog-cancel {
          flex: 1;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
        }

        .piu-dialog-confirm {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #ef4444;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .piu-dialog-cancel:hover { background: #f9fafb; }
        .piu-dialog-confirm:hover { background: #dc2626; }
      `}</style>

      <div className="piu-wrapper">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Avatar */}
        <div className="piu-avatar">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt={userName || 'Profile'} />
          ) : (
            initial
          )}
          {(uploading || deleting) && (
            <div className="piu-spinner-overlay">
              <div className="piu-spinner" />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="piu-actions">
          {currentImageUrl ? (
            /* Has image → show Delete only */
            <button
              className="piu-btn piu-btn-delete"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting || uploading}
            >
              🗑 Delete Photo
            </button>
          ) : (
            /* No image → show Upload only */
            <button
              className="piu-btn piu-btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
            >
              📷 Upload Photo
            </button>
          )}
        </div>

        {error && <div className="piu-error">{error}</div>}
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="piu-overlay">
          <div className="piu-dialog">
            <h3>Delete Profile Photo?</h3>
            <p>
              This will permanently remove your profile photo. You can upload a
              new one afterwards.
            </p>
            <div className="piu-dialog-btns">
              <button
                className="piu-dialog-cancel"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button className="piu-dialog-confirm" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
