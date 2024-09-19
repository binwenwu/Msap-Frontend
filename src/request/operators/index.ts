import { store } from "@/store/store"; // 引入 Redux store 用于管理全局状态
import { BASE_PATH } from "@/utils/globalVariable"; // 引入全局变量中定义的 API 基础路径
import axios from "axios"; // 引入 axios 库用于发出 HTTP 请求

// 创建第一个 axios 实例，用于内部 API 请求
const request = axios.create({
    baseURL: `${BASE_PATH}/api`, // 设置基础 URL
    timeout: 60000, // 请求超时时间为 60 秒
    headers: {
        "Content-Type": "application/json", // 设置请求头类型为 JSON
    },
});

// 请求拦截器：在发送请求之前，自动在请求头中添加认证信息
request.interceptors.request.use((config) => {
    const token = localStorage.getItem("education-token"); // 获取本地存储的 token
    const head = localStorage.getItem("education-tokenHead"); // 获取本地存储的 token 头
    if (token && head) {
        config.headers.Authorization = head + "" + token; // 拼接 Authorization 头部信息
    }
    return config;
});

// 响应拦截器：对每个响应进行统一处理
request.interceptors.response.use(
    (response) => {
        const { dispatch } = store; // 从 store 获取 dispatch 方法
        if (response.status === 200) {
            const data = response.data; // 提取响应数据
            return data; // 返回数据
        } else {
            return Promise.reject("请求失败"); // 如果状态码不是 200，返回错误信息
        }
    },
    (error) => {
        console.log(error); // 输出错误日志
        return Promise.reject(error.message); // 返回错误消息
    }
);

// 创建第二个 axios 实例，用于外部 API 请求
const request2 = axios.create({
    baseURL: `http://openge.org.cn/`, // 设置基础 URL 为外部服务
    timeout: 360000, // 请求超时时间为 6 分钟
    headers: {
        "Content-Type": "application/json", // 设置请求头类型为 JSON
    },
});

// 请求拦截器：为 request2 实例添加认证信息
request2.interceptors.request.use((config) => {
    const token = localStorage.getItem("education-token");
    const head = localStorage.getItem("education-tokenHead");
    if (token && head) {
        config.headers.Authorization = head + "" + token;
    }
    return config;
});

// 响应拦截器：对 request2 的每个响应进行统一处理
request2.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            const data = response.data; // 提取响应数据
            return data; // 返回数据
        } else {
            return Promise.reject("请求失败"); // 返回错误信息
        }
    },
    (error) => {
        console.log(error); // 输出错误日志
        return Promise.reject(error.message); // 返回错误消息
    }
);

/**
 * 上传 GeoJSON 数据
 * @param name GeoJSON 的名称
 * @param geojsonstr GeoJSON 字符串
 * @returns Promise<any>
 */
export const uploadGeojson = (
    name: string,
    geojsonstr: string
): Promise<any> => {
    return request.post(`/resource/personal/upload/geoJsonStr`, {
        name: name,
        geojsonstr: geojsonstr,
    });
};

interface ConversionPathQuery {
    paths: string;
}

/**
 * 获取影像资源完整地址
 * @param query 路径查询参数
 * @returns Promise<any>
 */
export const conversionPath = (query: ConversionPathQuery) => {
    return request.get("/datasource/model-edu/path/r2m-conversion", {
        params: query,
    }) as Promise<any>;
};

export interface ExecuteBody {
    identifier: string;
    mode: "sync" | "async";
    inputs: Record<string, any>;
    host_output_path?: string;
}

export interface ExecuteResponse {
    completionTime: string;
    identifier: string;
    jobId: string;
    message: string;
    result: {
        data_type: string;
        name: string;
        value: string;
    }[];
    status: string;
    timestamp: number;
}

/**
 * 执行异步或同步任务
 * @param body 执行参数
 * @returns Promise<ExecuteResponse>
 */
export const execute = (body: ExecuteBody) => {
    return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

/**
 * 获取范围和缩放级别
 * @param body 执行参数
 * @returns Promise<ExecuteResponse>
 */
export const getExtentAndZoom = (body: ExecuteBody) => {
    return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

/**
 * 执行 TMS 服务
 * @param body 执行参数
 * @returns Promise<ExecuteResponse>
 */
export const executeTmsServer = (body: ExecuteBody) => {
    return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

/**
 * 获取影像资源完整地址
 * @param query 路径查询参数
 * @returns Promise<any>
 */
export const getPath = (query: ConversionPathQuery) => {
    return request.get("/datasource/model-edu/path/r2m-conversion", {
        params: query,
    }) as Promise<any>;
};

/**
 * 将结果上传至 Minio
 * @param body 包含结果数据的 FormData
 * @returns Promise<any>
 */
export const mntToMinio = (body: FormData) => {
    return request.post(
        "datasource/api/dataupload/upload/computingResult",
        body,
        {
            headers: {
                "Content-Type": "application/form-data",
            },
        }
    );
};

interface StatisticQuery {
    dbfFilePath: string;
}

/**
 * 统计分析
 * @param query 统计查询参数
 * @returns Promise<any>
 */
export const statisticsAnalysis = (query: StatisticQuery) => {
    return request.get(`/datasource/model-edu/analyze/StatisticRes`, {
        params: query,
    }) as Promise<any>;
};

interface ExecuteOperatorBody extends ExecuteBody {
    practiceInstanceId: string;
    practiceTaskId: string;
    flag: number;
}

/**
 * 执行操作并展示结果
 * @param body 执行参数
 * @returns Promise<{
 *   code: number;
 *   data: {
 *     name: string;
 *     result: ExecuteResponse;
 *   };
 *   msg: string;
 * }>
 */
export const executeOperator = (body: ExecuteOperatorBody) => {
    return request2.post(
        "/gateway/calculate/calculateAndShow",
        body
    ) as Promise<{
        code: number;
        data: {
            name: string;
            result: ExecuteResponse;
        };
        msg: string;
    }>;
};

interface SaveResultBody {
    practiceInstanceId: string;
    practiceTaskId: string;
    resultPath: string;
    resultName: string;
    jobId: string;
    maxZoom: number;
    minZoom: number;
    lnglatStr: string;
}

/**
 * 保存操作结果
 * @param body 保存结果的请求体
 * @returns Promise<any>
 */
export const saveOperatorResult = (body: SaveResultBody) => {
    return request.post(
        "/internship/practice/result/save/result",
        body
    ) as Promise<any>;
};

/**
 * 删除操作结果
 * @param id 结果 ID
 * @returns Promise<any>
 */
export const deleteOperatorResult = (id: string) => {
    return request.post(
        `/internship/practice/result/delete/result?resultId=${id}`
    ) as Promise<any>;
};
