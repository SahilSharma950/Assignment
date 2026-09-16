export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  list: string; // The ID of the list
  order: number;
  assignees: User[];
  dueDate?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  name: string;
  board: string;
  order: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
