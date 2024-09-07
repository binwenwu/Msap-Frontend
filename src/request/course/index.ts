import { request } from "./instance";

interface CourseQuery {
  status: number; // 0进行中 1已结课
  name?: string;
  practiceInstanceId?: number;
  pageNumber?: number;
  pageSize?: number;
}
/**
 * 实习课程列表
 * @param query
 * @returns
 */
export const queryCourse = (query: CourseQuery) => {
  return request.get("/internship/practice/instance/list", {
    params: query,
  }) as Promise<any>;
};

export const queryCourseDetail = (practiceInstanceId: number) => {
  return request.get(
    `/internship/practice/instance/detail/${practiceInstanceId}`
  ) as Promise<any>;
};

interface EndOfCourseBody {
  practiceInstance: {
    endTag: number;
    id: number;
    summary: string;
  };
}

export const endOfCourse = (body: EndOfCourseBody) => {
  return request.post(
    "/internship/practice/instance/updateStatus",
    body
  ) as Promise<any>;
};

/**
 * 评分界面学生列表
 * @param query
 */
export const queryCourseStudents = (query: CourseQuery) => {
  return request.get("/internship/practice/instance/list/student", {
    params: query,
  }) as Promise<any>;
};

interface ResultDetailQuery {
  taskId?: string;
  practiceInstanceId: string;
  sno: string;
}
/**
 * 获取学生提交的成果数据
 * @param query
 * @returns
 */
export const queryResultDetail = (query: ResultDetailQuery) => {
  return request.get("/internship/practice/result/detail", {
    params: query,
  }) as Promise<any>;
};

interface EvaluateBody {
  practiceInstanceId: string;
  sno: string;
  scoringItemsJson: string;
  studentName: string;
  gradeName: string;
  className: string;
  status: number;
}
/**
 * 学生成果评分
 * @param body
 * @returns
 */
export const evaluateScore = (body: EvaluateBody) => {
  return request.post("/internship/evaluate/submit", body) as Promise<any>;
};

interface ScoreDetail {
  practiceInstanceId: number;
  sno: string;
}
/**
 * 获取学生成绩详情
 * @param query
 * @returns
 */
export const queryScoreDetail = (query: ScoreDetail) => {
  return request.get("/internship/evaluate/detail", {
    params: query,
  }) as Promise<any>;
};

interface QueryScore {
  practiceInstanceId: number;
  department?: string;
  gradeName?: string;
  className?: string;
  searchKey?: string;
  snos?: number[];
  pageSize: number;
  pageNumber: number;
}
/**
 * 查询学生成绩列表
 * @param query
 * @returns
 */
export const queryScoreList = (query: QueryScore) => {
  return request.get("/internship/evaluate/list", {
    params: query,
  }) as Promise<any>;
};

/**
 * 获取及格/不及格学生人数
 * @param query
 * @returns
 */
export const queryScoreOverview = (query: number) => {
  return request.get("/internship/evaluate/overview", {
    params: { practiceInstanceId: query },
  }) as Promise<any>;
};

/**
 * 首页-课程总览
 */
export const overview = () => {
  return request.get("/internship/practice/instance/overview") as Promise<any>;
};

/**
 * 所有算子
 * @returns
 */
export const queryAllOperator = () => {
  return request.get("/datasource/model-edu/list/all") as Promise<any>;
};
