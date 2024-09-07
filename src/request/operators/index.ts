import { store } from "@/store/store";
import { BASE_PATH } from "@/utils/globalVariable";
import axios from "axios";

const request = axios.create({
  baseURL: `${BASE_PATH}/api`,
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
      const data = response.data;
      return data;
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

const request2 = axios.create({
  baseURL: `http://openge.org.cn/`,
  timeout: 360000,
  headers: {
    "Content-Type": "application/json",
  },
});

request2.interceptors.request.use((config) => {
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  if (token && head) {
    config.headers.Authorization = head + "" + token;
  }
  return config;
});

request2.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      const data = response.data;
      return data;
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

/**
 * sjwlfl上传geoJSON
 * @param name
 * @param geojsonstr
 * @returns
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
 * @param query
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

export const execute = (body: ExecuteBody) => {
  return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

export const getExtentAndZoom = (body: ExecuteBody) => {
  return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

export const executeTmsServer = (body: ExecuteBody) => {
  return request2.post("/pywps/jobs", body) as Promise<ExecuteResponse>;
};

interface ConversionPathQuery {
  paths: string;
}
/**
 * 获取影像资源完整地址
 * @param query
 */
export const getPath = (query: ConversionPathQuery) => {
  return request.get("/datasource/model-edu/path/r2m-conversion", {
    params: query,
  }) as Promise<any>;
};

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

interface StatisticQeury {
  dbfFilePath: string;
}

export const statisticsAnalysis = (query: StatisticQeury) => {
  return request.get(`/datasource/model-edu/analyze/StatisticRes`, {
    params: query,
  }) as Promise<any>;
};

interface ExecuteOperatorBody extends ExecuteBody {
  practiceInstanceId: string;
  practiceTaskId: string;
  flag: number;
}

export const executeOperator = (body: ExecuteOperatorBody) => {
  return request2.post("/gateway/calculate/calculateAndShow", body) as Promise<{
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

export const saveOperatorResult = (body: SaveResultBody) => {
  return request.post(
    "/internship/practice/result/save/result",
    body
  ) as Promise<any>;
};

export const deleteOperatorResult = (id: string) => {
  return request.post(
    `/internship/practice/result/delete/result?resultId=${id}`
  ) as Promise<any>;
};
