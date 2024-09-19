import axios from "axios"; // 引入 axios 用于 HTTP 请求
import { request } from "./instance"; // 引入另一个请求实例，用于不同的 API 请求
import { BASE_PATH } from "@/utils/globalVariable"; // 引入全局常量 BASE_PATH

// 创建 axios 实例，用于特定的 API 请求，设置基础路径和超时时间
export const request2 = axios.create({
    baseURL: `${BASE_PATH}/api`, // 设置基础 URL 路径
    timeout: 60000, // 设置超时时间为 60 秒
    headers: {
        "Content-Type": "application/json", // 请求头设置为 JSON 格式
    },
});

// 响应拦截器：在接收到响应后执行
request2.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            // 如果响应状态码是 200
            const data = response.data as BaseResponse<any>; // 将响应数据类型断言为 BaseResponse
            if (data.code === 20000) {
                // 如果业务响应代码是 20000，则表示请求成功
                return data.data; // 返回实际的数据
            } else {
                // 对于其他业务代码，返回被拒绝的 Promise，并附带错误信息
                return Promise.reject(data.msg);
            }
        }
    },
    (error) => {
        console.log(error); // 打印错误信息

        // TODO: 错误提示
        return Promise.reject(error.message); // 返回被拒绝的 Promise，并附带错误消息
    }
);

// 定义接口 LoginWithAuthQuery，用于描述 loginWithAuth 函数中所需的参数类型
export interface LoginWithAuthQuery {
    username: string; // 用户名
    password: string; // 密码
    scopes: string; // 权限范围
    client_secret: number; // 客户端密钥
    client_id: string; // 客户端 ID
    grant_type: string; // 授权类型
}

// 登录认证请求，向 `/oauth/token` 发起 POST 请求，传入查询参数
export const loginWithAuth = (params: any): Promise<LoginResponse> => {
    return request2.post(`/oauth/token?${params}`); // 使用 request2 发起 POST 请求
};

// 获取用户角色信息，向 `/user/info/role` 发起 GET 请求
export const queryRole = () => {
    return request.get("/user/info/role") as Promise<number>; // 返回角色 ID 的 Promise
};

// 统计活跃用户数据埋点，向 `/internship/statistics/active/user` 发起 POST 请求
export const buryPoint = () => {
    return request.post("/internship/statistics/active/user") as Promise<any>; // 返回统计结果的 Promise
};

// 默认导出模块对象，包含 `loginWithAuth` 方法
export default {
    loginWithAuth,
};
