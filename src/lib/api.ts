import axios from 'axios';
import { Todo, CreateTodoDto, UpdateTodoDto } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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