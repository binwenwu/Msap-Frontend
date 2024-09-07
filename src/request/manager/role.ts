import { request } from "./instance";

interface RoleQuery {
  fuzzyKey?: string;
  pageNum: number;
  pageSize: number;
}

export const queryRoleList = (query: RoleQuery) => {
  return request.get("/user/role/list", {
    params: query,
  }) as Promise<any>;
};

export interface RoleBody {
  name: string;
  permission: string;
  description: string;
}

export const addRole = (body: RoleBody) => {
  return request.post("/user/role/create", body) as Promise<any>;
};

export const editRole = (body: RoleBody) => {
  return request.post("/user/role/edit", body) as Promise<any>;
};

export const delRole = (body: number[]) => {
  return request.post("/user/role/delete", body) as Promise<any>;
};
