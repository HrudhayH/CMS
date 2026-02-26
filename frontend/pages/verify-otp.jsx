import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/forgot-password.module.css';
import { verifyForgotOtp } from '../services/api';

export default function VerifyOtp() {
  const router = useRouter();
  const { email, role } = router.query;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  // Redirect if no email/role in query
  useEffect(() => {
    if (router.isReady && (!email || !role)) {
      router.replace('/forgot-password');
    }
  }, [router.isReady, email, role, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await verifyForgotOtp(email, code, role);
      setSuccess(data.message || 'OTP verified!');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&role=${role}`);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Only allow 6 digit numeric input
  function handleCodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Verify OTP</h1>
        <p className={styles.subtitle}>
          Enter the 6-digit code sent to<br />
          <strong>{email}</strong>
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              className={styles.otpInput}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {countdown > 0 && (
            <div className={styles.timer}>
              Code expires in {formatTime(countdown)}
            </div>
          )}

          {countdown <= 0 && (
            <div className={styles.error}>
              OTP has expired. Please request a new one.
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading || code.length !== 6 || countdown <= 0}
            style={{ marginTop: 16 }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <a
          className={styles.link}
          onClick={() => router.push(`/forgot-password?role=${role}`)}
        >
          Resend OTP
        </a>

        <a
          className={styles.backLink}
          onClick={() => router.push(
            role === 'staff' ? '/staff/login' : role === 'client' ? '/client/login' : '/admin/login'
          )}
        >
          ← Back to Login
        </a>
      </div>
    </div>
  );
}
