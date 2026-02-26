import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { clientLogin } from '../../services/api';
import { useClientAuth } from '../../hooks/useClientAuth';
import Link from 'next/link';

export default function ClientLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useClientAuth();

    // Redirect to dashboard if already authenticated as client
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/client/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await clientLogin(email, password);
            // useClientAuth.login() stores token and redirects to /client/dashboard
            login(data.token);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div className="loading-spinner loading-spinner-lg"></div>
            </div>
        );
    }

    // Don't show login if already authenticated as client
    if (isAuthenticated) {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '8px'
                }}>
                    Client Login
                </h2>

                <p style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}>
                    Sign in to view your projects & updates
                </p>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '6px'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="client@email.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '6px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <Link href="/forgot-password?role=client" style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '16px',
                    fontSize: '14px',
                    color: '#667eea',
                    textDecoration: 'none'
                }}>
                    Forgot Password?
                </Link>

                <p style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '20px'
                }}>
                    Having trouble? Contact your admin
                </p>
            </div>
        </div>
    );
}
