import { request } from "./instance";

export const getPersonInfo = () => {
  return request.get("/user/info/administrator") as Promise<any>;
};

export interface OverAllType {
  completedPractice: number;
  dataNum: number;
  practiceNum: number;
  runningPractice: number;
  userTotal: number;
}

export const overall = () => {
  return request.get(
    "/internship/practice/instance/overview"
  ) as Promise<OverAllType>;
};

interface OverViewQuery {
  startTime: string;
  endTime: string;
}

export interface OvewViewSource {
  time: string;
  count: number;
}

export const querySubmitTask = (query: OverViewQuery) => {
  return request.get("/internship/practice/result/overview", {
    params: query,
  }) as Promise<OvewViewSource[]>;
};

interface DailyQuery {
  deadlineTime: string;
}

export interface DailySource {
  date: string;
  activeUsersCount: number;
}

export const queryDailyActive = (query: DailyQuery) => {
  return request.get("/internship/statistics/active/daily", {
    params: query,
  }) as Promise<DailySource[]>;
};

export interface CategorySource {
  category: string;
  count: number;
}

export const queryCategory = () => {
  return request.get(
    "/internship/practice/instance/statistics/category"
  ) as Promise<CategorySource[]>;
};
