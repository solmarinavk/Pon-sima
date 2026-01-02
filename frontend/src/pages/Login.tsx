// ============================================
// LOGIN PAGE - Professional & Clean
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);

      // Store username if "Remember me" is checked
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Load remembered username on component mount
  useState(() => {
    const remembered = localStorage.getItem('rememberedUsername');
    if (remembered) {
      setFormData(prev => ({ ...prev, username: remembered, rememberMe: true }));
    }
  });

  return (
    <div className="page-container">
      <div style={{
        maxWidth: '450px',
        margin: '4rem auto',
        padding: '0 var(--spacing-md)'
      }}>
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <div className="card-header" style={{ textAlign: 'center', borderBottom: 'none' }}>
            <h1 style={{
              fontSize: '2rem',
              color: 'var(--color-primary)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Iniciar Sesión
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.95rem',
              margin: 0
            }}>
              Bienvenido a Spanish with Silvana
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: 'var(--spacing-lg)' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                required
                autoComplete="username"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-checkbox" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="rememberMe">
                Recordar mi usuario
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-md)',
            background: 'var(--color-info-bg)',
            borderRadius: 'var(--radius)',
            borderLeft: '4px solid var(--color-info)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)'
          }}>
            <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text)' }}>
              ¿No tienes cuenta?
            </strong>
            Solo los profesores pueden crear cuentas de estudiantes. Contacta a tu profesora para obtener acceso.
          </div>
        </div>
      </div>
    </div>
  );
}
