import { request } from "./instance";

interface ResourceQuery {
  format?: string;
  satelliteType?: string;
  sensor?: string;
  startTime?: string;
  endTime?: string;
  minCloud?: number;
  maxCloud?: number;
  nameFuzzyWord?: string;
  sortingType?: string;
  isDescSorting?: boolean;
  pageSize?: number;
  pageNumber?: number;
}

export const queryGridResource = (query: ResourceQuery) => {
  return request.get("/personal/list/grid", {
    params: query,
  }) as Promise<any>;
};

export const queryVectorResource = (query: ResourceQuery) => {
  return request.get("/personal/list/vector", {
    params: query,
  }) as Promise<any>;
};

export const uploadGridResource = (body: FormData) => {
  return request.post("/personal/upload/grid", body, {
    headers: {
      "Content-Type": "form-data",
    },
  }) as Promise<any>;
};

export const uploadVectorResource = (body: FormData) => {
  return request.post("/personal/upload/vector", body, {
    headers: {
      "Content-Type": "form-data",
    },
  }) as Promise<any>;
};

export const editGridResource = (body: FormData) => {
  return request.post("/personal/update/grid", body, {
    headers: {
      "Content-Type": "form-data",
    },
  }) as Promise<any>;
};

export const editVectorResource = (body: FormData) => {
  return request.post("/personal/update/vector", body, {
    headers: {
      "Content-Type": "form-data",
    },
  }) as Promise<any>;
};

export const shareResource = (body: string[]) => {
  return request.post("/personal/share", body) as Promise<any>;
};

export const cancelShareResource = (body: string[]) => {
  return request.post("/personal/unshare", body) as Promise<any>;
};

export const deleteResource = (body: string[]) => {
  return request.post("/personal/delete", body) as Promise<any>;
};

export const queryPlatformGridResource = (query: ResourceQuery) => {
  return request.get("/system/list/grid", {
    params: query,
  }) as Promise<any>;
};

export const queryPlatformVectorResource = (query: ResourceQuery) => {
  return request.get("/system/list/vector", {
    params: query,
  }) as Promise<any>;
};

export const deletePlatformResource = (body: string[]) => {
  return request.post("/system/delete", body) as Promise<any>;
};

export const detailPlatformGridResource = () => {
  return request.get("/system/detail/grid");
};

export const detailPlatformVectorResource = () => {
  return request.get("/system/detail/vector");
};
// 获取卫星列表
export const listSatelliteData = () => {
  return request.get("/system/satellite/list");
};
// 获取卫星对应的传感器
export const listSensorData = (satellite: string) => {
  return request.get(`/system/sensor/satellite?satellite=${satellite}`);
};
