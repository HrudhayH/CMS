import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { staffLogin } from '../../services/api';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import styles from '../../styles/admin-login.module.css';
import Link from 'next/link';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { isAuthenticated, isLoading, login, user } = useStaffAuth();

    // Redirect to dashboard if already authenticated as staff
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/staff/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await staffLogin(email, password);
            // useStaffAuth.login() stores token and redirects to /staff/dashboard
            login(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className={styles.loginContainer}>
                <div className="loading-spinner loading-spinner-lg"></div>
            </div>
        );
    }

    // Don't show login if already authenticated as staff
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Staff Login</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input
                        className={styles.input}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <input
                        className={styles.input}
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>

                <button type="submit" className={styles.loginButton} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <Link href="/forgot-password?role=staff" className={styles.forgotLink} style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#2563eb', textDecoration: 'none' }}>
                    Forgot Password?
                </Link>
            </form>
        </div>
    );
}
