import { request } from "./instance";

interface TaskQueryParams {
  practiceName?: string;
  teacherName?: string;
  status?: number;
  sno?: string;
  pageNumber?: number;
  pageSize?: number;
}
/**
 * 学生首页获取实习任务列表
 * @param query
 * @returns
 */
export const getTaskList = (query: TaskQueryParams) => {
  return request.get("/practice/instance/task/list", {
    params: query,
  }) as Promise<any>;
};
/**
 * 获取任务详情
 * @param taskId
 * @returns
 */
export const getTaskDetail = (taskId: string) => {
  return request.get(
    `/practice/instance/task/detail/${taskId}`
  ) as Promise<any>;
};

interface ResultBody {
  practiceReports: Record<string, any>[];
  practiceTaskResults: Record<string, any>[];
}
/**
 * 实习任务上传成果数据
 * @param body
 * @returns
 */
export const submitResult = (body: ResultBody) => {
  return request.post("/practice/result/submit/result", body) as Promise<any>;
};

/**
 * 获取学生计算的成果列表
 * @param taskId
 * @returns
 */
export const getResultList = (taskId: number) => {
  return request.get("/practice/result/list", {
    params: {
      taskId,
    },
  }) as Promise<any>;
};

export const queryOverdueStudents = (count: number) => {
  return request.get("/practice/instance/student/listRemind", {
    params: {
      count,
    },
  }) as Promise<any>;
};

interface RemindCourseQuery {
  count?: number;
  pageNumber: number;
  pageSize: number;
}

export const queryRemidCourse = (query: RemindCourseQuery) => {
  return request.get("/practice/instance/student/listRemind", {
    params: query,
  }) as Promise<any>;
};
