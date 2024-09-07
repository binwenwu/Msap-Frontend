import { request } from "./instance";

export const queryStudentInfo = () => {
  return request.get("/user/info/student") as Promise<any>;
};

export const queryTeacherInfo = () => {
  return request.get("/user/info/teacher") as Promise<any>;
};

export const queryAdministratorInfo = () => {
  return request.get("/user/info/administrator") as Promise<any>;
};

interface UpdateInfoBody {
  phone: string;
  email: string;
}

export const updateInfo = (body: UpdateInfoBody) => {
  return request.post("/user/info/update", body) as Promise<any>;
};

interface UpdatePasswordBody {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const updatePassword = (body: UpdatePasswordBody) => {
  return request.post("/user/password/update", body) as Promise<any>;
};

interface UpdatePasswordWithAdminBody {
  newPassword: string;
  confirmNewPassword: string;
  id: string;
}

export const updatePasswordWithAdmin = (body: UpdatePasswordWithAdminBody) => {
  return request.post("/user/password/update/admin", body) as Promise<any>;
};
// 教师编号是否存在
interface serialExistParams {
  username: number;
}
// 请求Jupyterhub数据
export const jupyterhubData = (params: any) => {
  return request.get(
    `jupyter/user/file/list?username=${params}`
  ) as Promise<any>;
};
// 确定后的请求
export const sendJupyterhub = (jsonData: any) => {
  return request.post(
    `internship/practice/result/save/result/jupyter`,
    jsonData
  ) as Promise<any>;
};
export const serialExist = (params: any) => {
  return request.get(
    `/user/info/check/exist?username=${params}`
  ) as Promise<any>;
};
