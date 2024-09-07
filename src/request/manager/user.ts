import { request } from "./instance";

interface StudentQuery {
  pageSize?: number;
  pageNumber?: number;
  department?: string;
  gradeName?: string;
  className?: string;
  fuzzyWords?: string;
  sortingType?: string;
  isDescSorting?: string;
}
export const getStudentList = (query: StudentQuery) => {
  return request.get("/user/administrate/student/list", {
    params: query,
  }) as Promise<any>;
};

interface EditStudentBody {
  sname: string;
  department: string;
  sex: number;
  gradeName: string;
  className: string;
  phone: string;
  email: string;
  id: string;
}

export const editStudent = (body: EditStudentBody) => {
  return request.post("/user/administrate/student/edit", body) as Promise<any>;
};

interface CreateTeacherBody {
  tname: string;
  tno: string;
  department: string;
  sex: number;
  phone: string;
  email: string;
  password: string;
  secondConfirmPassword: string;
}

export const addStudent = (body: CreateTeacherBody) => {
  return request.post(
    "/user/administrate/student/create",
    body
  ) as Promise<any>;
};

export const deleteStudent = (body: number[]) => {
  return request.post(
    "/user/administrate/student/delete",
    body
  ) as Promise<any>;
};

interface TeacherQuery {
  department?: string;
  fuzzyWords?: string;
  pageNumber?: number;
  pageSize?: number;
}
export const getTeacherList = (query: TeacherQuery) => {
  return request.get("/user/administrate/teacher/list", {
    params: query,
  }) as Promise<any>;
};

interface EditTeacherBody {
  tname: string;
  department: string;
  sex: number;
  phone: string;
  email: string;
  id: string;
}
export const editTeacher = (body: EditTeacherBody) => {
  return request.post("/user/administrate/teacher/edit", body) as Promise<any>;
};

interface CreateTeacherBody {
  tname: string;
  tno: string;
  department: string;
  sex: number;
  phone: string;
  email: string;
  password: string;
  secondConfirmPassword: string;
}

export const addTeacher = (body: CreateTeacherBody) => {
  return request.post(
    "/user/administrate/teacher/create",
    body
  ) as Promise<any>;
};

export const deleteTeacher = (body: number[]) => {
  return request.post(
    "/user/administrate/teacher/delete",
    body
  ) as Promise<any>;
};

export const getPersonInfo = () => {
  return request.get("/user/info/student") as Promise<any>;
};

interface TaskQueryParams {
  practiceName?: string;
  teacherName?: string;
  status?: number;
  sno?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const getTaskList = (query: TaskQueryParams) => {
  return request.get("/internship/practice/instance/task/list", {
    params: query,
  }) as Promise<any>;
};
