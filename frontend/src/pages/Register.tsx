// ============================================
// REGISTER PAGE - DISABLED (Admin-only user creation)
// ============================================

import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Registration Disabled</h1>
          <p className="subtitle">Only teachers can create student accounts</p>

          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>
              Student accounts are created by Silvana, your teacher.
              <br />
              <br />
              If you need an account, please contact your teacher directly.
            </p>
          </div>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
