import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/forgot-password.module.css';
import { resetForgotPassword } from '../services/api';

export default function ResetPassword() {
  const router = useRouter();
  const { email, role } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if no email/role in query
  useEffect(() => {
    if (router.isReady && (!email || !role)) {
      router.replace('/forgot-password');
    }
  }, [router.isReady, email, role, router]);

  function getLoginPath() {
    if (role === 'staff') return '/staff/login';
    if (role === 'client') return '/client/login';
    return '/admin/login';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const data = await resetForgotPassword(email, newPassword, role);
      setSuccess(data.message || 'Password reset successfully!');
      setTimeout(() => {
        router.push(getLoginPath());
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          Create a new password for<br />
          <strong>{email}</strong>
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="newPassword">New Password</label>
            <input
              className={styles.input}
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              className={styles.input}
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <a className={styles.backLink} onClick={() => router.push(getLoginPath())}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
}
