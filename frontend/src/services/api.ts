// ============================================
// API CLIENT - HTTP requests to backend
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// GENERIC HTTP METHODS
// ============================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// TYPES
// ============================================

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'student' | 'teacher';
  level?: string;
  student_group?: string;
  is_active: number;
  total_points: number;
  current_streak: number;
  last_activity_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface VocabItem {
  id: number;
  spanish_word: string;
  english_translation: string;
  part_of_speech?: string;
  difficulty_level?: string;
  category?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface VocabExample {
  id: number;
  vocab_id: number;
  spanish_sentence: string;
  english_translation: string;
  context?: string;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  vocab_id: number;
  status: 'new' | 'learning' | 'learned' | 'difficult';
  times_reviewed: number;
  times_correct: number;
  times_incorrect: number;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  total_words: number;
  learned: number;
  learning: number;
  difficult: number;
  new_words: number;
  total_reviews: number;
  total_correct: number;
  total_incorrect: number;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  type: 'vocabulary' | 'quiz' | 'writing' | 'listening' | 'game';
  difficulty?: string;
  points: number;
  max_attempts: number;
  time_limit_minutes?: number;
  config?: string;
  due_date?: string;
  assigned_to: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  answers?: string;
  score?: number;
  completed: number;
  attempt_number: number;
  auto_feedback?: string;
  teacher_feedback?: string;
  started_at?: string;
  submitted_at?: string;
  graded_at?: string;
  student_name?: string;
  student_username?: string;
}

// ============================================
// AUTH API
// ============================================

interface AuthResponse {
  user: User;
  message: string;
}

export const authAPI = {
  async login(username: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(username: string, password: string, name: string, role: 'student' | 'teacher', level?: string, studentGroup?: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role, level, studentGroup }),
    });
  },

  async logout(): Promise<void> {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/api/auth/me');
  },
};

// ============================================
// ADMIN API (Teacher only)
// ============================================

export const adminAPI = {
  async createUser(data: {
    username: string;
    password: string;
    name: string;
    role: 'student' | 'teacher';
    level?: string;
    studentGroup?: string;
  }): Promise<User> {
    return request<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createUsersInBulk(users: Array<{
    username: string;
    password: string;
    name: string;
    role: 'student' | 'teacher';
    level?: string;
    studentGroup?: string;
  }>): Promise<{ created: number; failed: number; results: any }> {
    return request<{ created: number; failed: number; results: any }>('/api/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  },

  async getAllUsers(params?: {
    includeInactive?: boolean;
    role?: 'student' | 'teacher';
    studentGroup?: string;
  }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');
    if (params?.role) queryParams.append('role', params.role);
    if (params?.studentGroup) queryParams.append('studentGroup', params.studentGroup);

    return request<User[]>(`/api/admin/users?${queryParams.toString()}`);
  },

  async getUser(id: number): Promise<User> {
    return request<User>(`/api/admin/users/${id}`);
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return request<User>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deactivateUser(id: number): Promise<void> {
    return request<void>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async resetPassword(id: number, newPassword: string): Promise<void> {
    return request<void>(`/api/admin/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// ============================================
// VOCABULARY API
// ============================================

export const vocabAPI = {
  async getAll(): Promise<VocabItem[]> {
    return request<VocabItem[]>('/api/vocab');
  },

  async getById(id: number): Promise<VocabItem> {
    return request<VocabItem>(`/api/vocab/${id}`);
  },

  async create(data: {
    spanish_word: string;
    english_translation: string;
    part_of_speech?: string;
    difficulty_level?: string;
    category?: string;
    notes?: string;
  }): Promise<VocabItem> {
    return request<VocabItem>('/api/vocab', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<VocabItem>): Promise<VocabItem> {
    return request<VocabItem>(`/api/vocab/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return request<void>(`/api/vocab/${id}`, {
      method: 'DELETE',
    });
  },

  async getExamples(vocabId: number): Promise<VocabExample[]> {
    return request<VocabExample[]>(`/api/vocab/${vocabId}/examples`);
  },

  async addExample(vocabId: number, data: {
    spanish_sentence: string;
    english_translation: string;
    context?: string;
  }): Promise<VocabExample> {
    return request<VocabExample>(`/api/vocab/${vocabId}/examples`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMostDifficult(limit: number = 10): Promise<any[]> {
    return request<any[]>(`/api/vocab/analytics/difficult?limit=${limit}`);
  },
};

// ============================================
// ASSIGNMENT API
// ============================================

export const assignmentAPI = {
  // Teacher methods
  async create(data: {
    title: string;
    description?: string;
    type: 'vocabulary' | 'quiz' | 'writing' | 'listening' | 'game';
    difficulty?: string;
    points?: number;
    max_attempts?: number;
    time_limit_minutes?: number;
    config?: string;
    due_date?: string;
    assigned_to?: string;
  }): Promise<{ assignment: Assignment; message: string }> {
    return request<{ assignment: Assignment; message: string }>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<Assignment[]> {
    return request<Assignment[]>('/api/assignments');
  },

  async getById(id: number): Promise<Assignment> {
    return request<Assignment>(`/api/assignments/${id}`);
  },

  async update(id: number, data: Partial<Assignment>): Promise<{ assignment: Assignment; message: string }> {
    return request<{ assignment: Assignment; message: string }>(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return request<void>(`/api/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  async getSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return request<AssignmentSubmission[]>(`/api/assignments/${assignmentId}/submissions`);
  },

  // Student methods
  async submit(assignmentId: number, data: {
    answers: string;
    score?: number;
    completed: boolean;
  }): Promise<{ submission: AssignmentSubmission; message: string }> {
    return request<{ submission: AssignmentSubmission; message: string }>(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMySubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return request<AssignmentSubmission[]>(`/api/assignments/${assignmentId}/my-submissions`);
  },

  // Shared - update submission (teacher feedback or student update)
  async updateSubmission(submissionId: number, data: {
    teacher_feedback?: string;
    score?: number;
    answers?: string;
    completed?: boolean;
  }): Promise<{ submission: AssignmentSubmission; message: string }> {
    return request<{ submission: AssignmentSubmission; message: string }>(`/api/assignments/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// PROGRESS API - Gamification & Progress
// ============================================

export interface Badge {
  id: number;
  user_id: number;
  badge_type: string;
  awarded_at: string;
}

export interface GameScore {
  id: number;
  user_id: number;
  game_type: string;
  score: number;
  time_seconds?: number;
  difficulty?: string;
  metadata?: string;
  played_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  name: string;
  total_points: number;
  current_streak: number;
  level?: string;
}

export const progressAPI = {
  async getMyProgress(): Promise<UserProgress[]> {
    return request<UserProgress[]>('/api/progress');
  },

  async getSummary(): Promise<ProgressSummary> {
    return request<ProgressSummary>('/api/progress/summary');
  },

  async updateProgress(
    vocabId: number,
    correct: boolean,
    difficulty: string
  ): Promise<{
    progress: UserProgress;
    points_earned: number;
    total_points: number;
    current_streak: number;
  }> {
    return request<any>(`/api/progress/${vocabId}`, {
      method: 'POST',
      body: JSON.stringify({ correct, difficulty }),
    });
  },

  async getMyBadges(): Promise<Badge[]> {
    return request<Badge[]>('/api/progress/badges');
  },

  async getPointsLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(`/api/progress/leaderboard/points?limit=${limit}`);
  },

  async getStreaksLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(`/api/progress/leaderboard/streaks?limit=${limit}`);
  },

  async getGameLeaderboard(gameType: string, limit: number = 10): Promise<any[]> {
    return request<any[]>(`/api/progress/leaderboard/game/${gameType}?limit=${limit}`);
  },

  async saveGameScore(data: {
    game_type: string;
    score: number;
    time_seconds?: number;
    difficulty?: string;
    metadata?: string;
  }): Promise<{
    game_score: GameScore;
    points_earned: number;
    total_points: number;
  }> {
    return request<any>('/api/progress/game-score', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthAPI = {
  async check(): Promise<{ status: string; database: string }> {
    return request<{ status: string; database: string }>('/health');
  },
};
