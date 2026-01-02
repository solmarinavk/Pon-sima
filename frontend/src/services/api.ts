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
  email: string;
  name: string;
  role: 'student' | 'teacher';
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

// ============================================
// AUTH API (Phase 4 - Stubs for now)
// ============================================

export const authAPI = {
  async login(email: string, password: string): Promise<User> {
    // TODO: Implement in Phase 4
    return request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, name: string, role: 'student' | 'teacher'): Promise<User> {
    // TODO: Implement in Phase 4
    return request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  async logout(): Promise<void> {
    // TODO: Implement in Phase 4
    return request<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<User> {
    // TODO: Implement in Phase 4
    return request<User>('/api/auth/me');
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
// PROGRESS API (Phase 5 - Stubs for now)
// ============================================

export const progressAPI = {
  async getMyProgress(): Promise<UserProgress[]> {
    // TODO: Implement in Phase 5
    return request<UserProgress[]>('/api/progress');
  },

  async updateProgress(vocabId: number, data: {
    status: 'new' | 'learning' | 'learned' | 'difficult';
    times_reviewed?: number;
    times_correct?: number;
    times_incorrect?: number;
  }): Promise<UserProgress> {
    // TODO: Implement in Phase 5
    return request<UserProgress>(`/api/progress/${vocabId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSummary(): Promise<ProgressSummary> {
    // TODO: Implement in Phase 5
    return request<ProgressSummary>('/api/progress/summary');
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
