import axios from 'axios';
import { Todo, CreateTodoDto, UpdateTodoDto } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await api.get<{ content: Todo[] }>('/todos');
    return response.data.content;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  create: async (dto: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>('/todos', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateTodoDto): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};