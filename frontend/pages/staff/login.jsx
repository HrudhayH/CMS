import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { staffLogin } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getUserRole } from '../../utils/auth';
import styles from '../../styles/admin-login.module.css';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { isAuthenticated, isLoading, login, user } = useAuth();

    // Redirect to dashboard if already authenticated as staff
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (user?.role === 'staff') {
                router.push('/staff/dashboard');
            } else {
                // If logged in but not staff, we might want to stay here or show error
                setError('Not authorized as staff');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await staffLogin(email, password);

            // Check role from the token before logging in
            const role = getUserRole(data.token);

            if (role === 'staff') {
                login(data.token);
                // Note: useAuth's login currently hardcodes redirect to /admin/dashboard
                // We'll let it happen then redirect again, or we can handle it here if useAuth allowed
                // Actually, looking at useAuth.js, it calls router.push('/admin/dashboard')
                // We might need to override that or handle the double hop for now as per "DO NOT REFACTOR" rules
                // However, the requirement says "Redirect to /staff/dashboard"
                router.push('/staff/dashboard');
            } else {
                setError('Not authorized as staff');
            }
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
    if (isAuthenticated && user?.role === 'staff') {
        return null;
    }

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Staff Login</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">Email / Username</label>
                    <input
                        className={styles.input}
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email or username"
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
            </form>
        </div>
    );
}
