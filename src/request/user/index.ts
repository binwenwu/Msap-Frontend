import axios from "axios";
import { request } from "./instance";
import { BASE_PATH } from "@/utils/globalVariable";

export const request2 = axios.create({
  baseURL: `${BASE_PATH}/api`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

request2.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      const data = response.data as BaseResponse<any>;
      if (data.code === 20000) {
        return data.data;
      } else {
        return Promise.reject(data.msg);
      }
    }
  },
  (error) => {
    console.log(error);
    // TODO: 错误提示
    return Promise.reject(error.message);
  }
);

export interface LoginWithAuthQuery {
  username: string;
  password: string;
  scopes: string;
  client_secret: number;
  client_id: string;
  grant_type: string;
}

export const loginWithAuth = (params: any): Promise<LoginResponse> => {
  return request2.post(`/oauth/token?${params}`);
};

export const queryRole = () => {
  return request.get("/user/info/role") as Promise<number>;
};

export const buryPoint = () => {
  return request.post("/internship/statistics/active/user") as Promise<any>;
};

export default {
  loginWithAuth,
};
