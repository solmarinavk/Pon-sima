// ============================================
// MANAGE USERS - Teacher-only user management interface
// Professional Design
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: number;
  username: string;
  name: string;
  role: 'student' | 'teacher';
  level?: string;
  student_group?: string;
  is_active: boolean;
  created_at: string;
}

interface NewUser {
  username: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  level: string;
  student_group: string;
}

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    password: '',
    name: '',
    role: 'student',
    level: 'beginner',
    student_group: '',
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccessMessage(`Usuario "${newUser.username}" creado exitosamente`);
      setShowCreateModal(false);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'student',
        level: 'beginner',
        student_group: '',
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    }
  };

  // Update user
  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccessMessage('Usuario actualizado exitosamente');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario');
    }
  };

  // Deactivate user
  const handleDeactivateUser = async (userId: number, username: string) => {
    if (!confirm(`¿Estás seguro de desactivar al usuario "${username}"?`)) {
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to deactivate user');
      }

      setSuccessMessage(`Usuario "${username}" desactivado exitosamente`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al desactivar usuario');
    }
  };

  // Reset password
  const handleResetPassword = async (userId: number, username: string) => {
    const newPassword = prompt(`Ingresa la nueva contraseña para "${username}" (mínimo 8 caracteres):`);

    if (!newPassword) return;

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage(`Contraseña actualizada para "${username}"`);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contraseña');
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.student_group || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Gestión de Usuarios</h1>
        <p className="page-subtitle">
          Crea, edita y administra las cuentas de estudiantes y profesores
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Crear Nuevo Usuario
          </button>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Buscar por nombre, usuario o grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              className={`btn ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilterRole('all')}
            >
              Todos ({users.length})
            </button>
            <button
              className={`btn ${filterRole === 'student' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilterRole('student')}
            >
              Estudiantes ({users.filter(u => u.role === 'student').length})
            </button>
            <button
              className={`btn ${filterRole === 'teacher' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilterRole('teacher')}
            >
              Profesores ({users.filter(u => u.role === 'teacher').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
            Cargando usuarios...
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📭</p>
          <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--spacing-sm)' }}>
            No se encontraron usuarios
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {searchQuery ? 'Intenta con otro término de búsqueda' : 'Crea tu primer usuario para comenzar'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Nivel</th>
                <th>Grupo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.username}</strong>
                  </td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'teacher' ? 'primary' : 'secondary'}`}>
                      {u.role === 'teacher' ? '👩‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                    </span>
                  </td>
                  <td>{u.level || '-'}</td>
                  <td>{u.student_group || '-'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingUser(u)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleResetPassword(u.id, u.username)}
                        title="Resetear contraseña"
                      >
                        🔑
                      </button>
                      {u.is_active && u.id !== currentUser?.id && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeactivateUser(u.id, u.username)}
                          title="Desactivar usuario"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Usuario *
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  required
                  minLength={3}
                  placeholder="nombre_usuario"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  required
                  placeholder="María García"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Rol *
                </label>
                <select
                  id="role"
                  className="form-input"
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'student' | 'teacher' })}
                >
                  <option value="student">👨‍🎓 Estudiante</option>
                  <option value="teacher">👩‍🏫 Profesor</option>
                </select>
              </div>

              {newUser.role === 'student' && (
                <>
                  <div className="form-group">
                    <label htmlFor="level" className="form-label">
                      Nivel
                    </label>
                    <select
                      id="level"
                      className="form-input"
                      value={newUser.level}
                      onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="student_group" className="form-label">
                      Grupo (Opcional)
                    </label>
                    <input
                      type="text"
                      id="student_group"
                      className="form-input"
                      placeholder="Ej: Grupo A, Clase 2024"
                      value={newUser.student_group}
                      onChange={(e) => setNewUser({ ...newUser, student_group: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Crear Usuario
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuario: {editingUser.username}</h2>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setEditingUser(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(editingUser.id, {
                name: editingUser.name,
                level: editingUser.level,
                student_group: editingUser.student_group,
              });
            }}>
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="edit-name"
                  className="form-input"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div className="form-group">
                    <label htmlFor="edit-level" className="form-label">
                      Nivel
                    </label>
                    <select
                      id="edit-level"
                      className="form-input"
                      value={editingUser.level || 'beginner'}
                      onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-group" className="form-label">
                      Grupo
                    </label>
                    <input
                      type="text"
                      id="edit-group"
                      className="form-input"
                      placeholder="Ej: Grupo A"
                      value={editingUser.student_group || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, student_group: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
