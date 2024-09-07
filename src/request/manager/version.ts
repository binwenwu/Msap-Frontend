import { request } from "./instance";

interface VersionQuery {
  version?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  pageNumber: number;
  pageSize: number;
}

export const queryVersionList = (query?: VersionQuery) => {
  return request.get("/internship/version/list", {
    params: query || {},
  }) as Promise<any>;
};

export interface VersionBody {
  version: string;
  title: string;
  detail: string;
}

export const addVersion = (body: VersionBody) => {
  return request.post("/internship/version/add", body) as Promise<any>;
};
