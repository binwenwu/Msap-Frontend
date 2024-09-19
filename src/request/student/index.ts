import { request } from "./instance"; // 引入 axios 实例，用于发送 HTTP 请求

// 定义查询任务列表的接口参数
interface TaskQueryParams {
    practiceName?: string; // 实习名称，可选
    teacherName?: string; // 教师名称，可选
    status?: number; // 任务状态，可选
    sno?: string; // 学号，可选
    pageNumber?: number; // 页码，可选
    pageSize?: number; // 每页数量，可选
}

/**
 * 获取学生首页的实习任务列表
 * @param query 查询参数
 * @returns 返回一个 Promise，包含实习任务列表的数据
 */
export const getTaskList = (query: TaskQueryParams) => {
    return request.get("/practice/instance/task/list", {
        params: query, // 将 query 对象作为查询参数传递给请求
    }) as Promise<any>;
};

/**
 * 获取某个任务的详细信息
 * @param taskId 任务 ID
 * @returns 返回一个 Promise，包含任务的详细数据
 */
export const getTaskDetail = (taskId: string) => {
    return request.get(
        `/practice/instance/task/detail/${taskId}` // 将任务 ID 拼接到请求 URL 中
    ) as Promise<any>;
};

// 定义上传实习任务成果的接口参数
interface ResultBody {
    practiceReports: Record<string, any>[]; // 实习报告列表
    practiceTaskResults: Record<string, any>[]; // 实习任务结果列表
}

/**
 * 提交实习任务的成果数据
 * @param body 包含成果数据的请求体
 * @returns 返回一个 Promise，表示提交的结果
 */
export const submitResult = (body: ResultBody) => {
    return request.post("/practice/result/submit/result", body) as Promise<any>;
};

/**
 * 获取学生计算出的成果列表
 * @param taskId 任务 ID
 * @returns 返回一个 Promise，包含学生计算的成果列表
 */
export const getResultList = (taskId: number) => {
    return request.get("/practice/result/list", {
        params: {
            taskId, // 将任务 ID 作为查询参数传递
        },
    }) as Promise<any>;
};

/**
 * 获取提醒学生逾期提交的学生列表
 * @param count 逾期学生数量
 * @returns 返回一个 Promise，包含逾期学生列表的数据
 */
export const queryOverdueStudents = (count: number) => {
    return request.get("/practice/instance/student/listRemind", {
        params: {
            count, // 将逾期学生数量作为查询参数传递
        },
    }) as Promise<any>;
};

// 定义查询逾期课程的接口参数
interface RemindCourseQuery {
    count?: number; // 逾期学生数量，可选
    pageNumber: number; // 页码
    pageSize: number; // 每页数量
}

/**
 * 获取逾期提醒的课程列表
 * @param query 查询参数，包括逾期学生数量、页码和每页数量
 * @returns 返回一个 Promise，包含逾期课程列表的数据
 */
export const queryRemidCourse = (query: RemindCourseQuery) => {
    return request.get("/practice/instance/student/listRemind", {
        params: query, // 将 query 对象作为查询参数传递
    }) as Promise<any>;
};
