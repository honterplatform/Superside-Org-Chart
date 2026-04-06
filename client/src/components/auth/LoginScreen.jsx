import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
    } catch {
      setError('Invalid password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Spark Studio</h1>
        <p style={styles.subtitle}>Org Chart & Resource Management</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Enter team password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            autoFocus
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg)'
  },
  card: {
    background: 'white', borderRadius: 'var(--radius-lg)',
    padding: '48px 40px', textAlign: 'center',
    boxShadow: 'var(--shadow-lg)', maxWidth: 400, width: '100%', margin: '0 20px'
  },
  title: {
    fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700,
    marginBottom: 4
  },
  subtitle: {
    color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 16px', fontSize: 15, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', textAlign: 'center'
  },
  error: { color: 'var(--red)', fontSize: 13 },
  button: {
    padding: '12px', background: 'var(--accent)', color: 'white',
    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 15,
    cursor: 'pointer', border: 'none',
    opacity: 1, transition: 'opacity 0.2s'
  }
};
