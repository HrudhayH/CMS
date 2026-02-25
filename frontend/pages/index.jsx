import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>CMS - Client Management System</title>
        <meta name="description" content="A modern Client Management System for managing projects, staff, and clients." />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#f8fafc',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>CMS</span>
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/admin/login')} style={{
              padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
            }}>Admin</button>
            <button onClick={() => router.push('/staff/login')} style={{
              padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
            }}>Staff</button>
            <button onClick={() => router.push('/client/login')} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}>Client Portal</button>
          </nav>
        </header>

        {/* Hero Section */}
        <main style={{
          maxWidth: '1280px', margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 10
        }}>
          <div style={{
            position: 'absolute', top: '-100px', right: '-200px', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0
          }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#93c5fd', fontSize: '13px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.5px'
            }}>✨ Client Management System</div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '800', lineHeight: '1.1',
              marginBottom: '24px', letterSpacing: '-1.5px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              Manage Projects,<br />Clients & Teams<br />
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>All in One Place</span>
            </h1>

            <p style={{
              fontSize: '18px', color: '#94a3b8', maxWidth: '600px',
              margin: '0 auto 48px', lineHeight: '1.7'
            }}>
              Streamline your workflow with our comprehensive management system. 
              Track projects, manage payments, collaborate with your team, and 
              keep clients updated in real-time.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/admin/login')} style={{
                padding: '14px 36px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff',
                fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
              }}>Get Started →</button>
              <button onClick={() => router.push('/client/login')} style={{
                padding: '14px 36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '16px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)'
              }}>Client Portal</button>
            </div>
          </div>

          {/* Feature Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px', marginTop: '100px', position: 'relative', zIndex: 1
          }}>
            {[
              { icon: '📊', title: 'Project Management', desc: 'Track progress, assign teams, manage roadmaps and milestones with ease.' },
              { icon: '👥', title: 'Client Portal', desc: 'Dedicated portal for clients to view updates, track payments, and collaborate.' },
              { icon: '💳', title: 'Payment Tracking', desc: 'Full payment lifecycle management with phase-wise or one-time plans.' },
              { icon: '🔒', title: 'Role-Based Access', desc: 'Secure access control for admins, staff, and clients with granular permissions.' }
            ].map((feature, idx) => (
              <div key={idx} style={{
                padding: '32px 28px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#f1f5f9' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px',
          borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '60px'
        }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} CMS — Client Management System. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
