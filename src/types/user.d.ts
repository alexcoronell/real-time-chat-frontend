import { Department } from './enums/Department.enum';

export interface User {
  id: string;
  nickname: string;
  department: Department;
  createdAt: Date;
}
