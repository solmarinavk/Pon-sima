// ============================================
// REGISTER PAGE - DISABLED (Admin-only user creation)
// ============================================

import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Registro Deshabilitado</h1>
          <p className="subtitle">Solo los profesores pueden crear cuentas de estudiantes</p>

          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>
              Las cuentas de estudiantes son creadas por Silvana, tu profesora.
              <br />
              <br />
              Si necesitas una cuenta, por favor contacta directamente a tu profesora.
            </p>
          </div>

          <p className="auth-footer">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
