import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/forgot-password.module.css';
import { requestForgotOtp } from '../services/api';

export default function ForgotPassword() {
  const router = useRouter();
  const { role: queryRole } = router.query;

  const [email, setEmail] = useState('');
  const [role, setRole] = useState(queryRole || 'admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await requestForgotOtp(email, role);
      setSuccess(data.message || 'OTP sent to your email.');
      // Navigate to verify OTP page after short delay
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getLoginPath() {
    if (role === 'staff') return '/staff/login';
    if (role === 'client') return '/client/login';
    return '/admin/login';
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.subtitle}>Enter your email address and we&apos;ll send you a verification code.</p>

        {/* Role Selector */}
        <div className={styles.roleSelector}>
          {['admin', 'staff', 'client'].map((r) => (
            <button
              key={r}
              type="button"
              className={role === r ? styles.roleButtonActive : styles.roleButton}
              onClick={() => setRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              className={styles.input}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <a className={styles.backLink} onClick={() => router.push(getLoginPath())}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
}
