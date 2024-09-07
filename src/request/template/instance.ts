import axios from "axios";
import { store } from "@/store/store";
import { emptyUserInfo, setUserInfo } from "@/store/slices/userSlice";
import { BASE_PATH } from "@/utils/globalVariable";
import { eventEmitter } from "@/utils/events";

export const request = axios.create({
  baseURL: `${BASE_PATH}/api/internship`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  if (token && head) {
    config.headers.Authorization = head + "" + token;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const { dispatch } = store;
    if (response.status === 200) {
      const data = response.data as BaseResponse<any>;
      if (data.code === 20000) {
        return data.data;
      } else if (data.code === 20001) {
        return {
          total: 0,
          records: [],
        };
      } else if (data.code === 40003) {
        dispatch(emptyUserInfo());
        eventEmitter.emit("logout");
      } else {
        return Promise.reject(data.msg);
      }
    } else {
      return Promise.reject("请求失败");
    }
  },
  (error) => {
    console.log(error);
    // TODO: 错误提示
    return Promise.reject(error.message);
  }
);
