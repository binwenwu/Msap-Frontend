import { request } from "./instance"; // 导入封装好的 request 实例

// 定义获取实习课程列表的查询参数类型
interface CourseQuery {
    status: number; // 课程状态：0 表示进行中，1 表示已结课
    name?: string; // 可选参数，课程名称
    practiceInstanceId?: number; // 可选参数，实习实例 ID
    pageNumber?: number; // 可选参数，页码
    pageSize?: number; // 可选参数，每页记录数
}

/**
 * 获取实习课程列表
 * @param query 查询参数
 * @returns Promise，返回课程列表数据
 */
export const queryCourse = (query: CourseQuery) => {
    return request.get("/internship/practice/instance/list", {
        params: query, // 使用 query 参数发送请求
    }) as Promise<any>;
};

/**
 * 获取课程详情
 * @param practiceInstanceId 实习实例 ID
 * @returns Promise，返回课程详情数据
 */
export const queryCourseDetail = (practiceInstanceId: number) => {
    return request.get(
        `/internship/practice/instance/detail/${practiceInstanceId}`
    ) as Promise<any>;
};

// 定义结束课程的请求体
interface EndOfCourseBody {
    practiceInstance: {
        endTag: number; // 课程结束标志
        id: number; // 课程实例 ID
        summary: string; // 课程总结
    };
}

/**
 * 结束课程
 * @param body 请求体，包含课程结束信息
 * @returns Promise，返回操作结果
 */
export const endOfCourse = (body: EndOfCourseBody) => {
    return request.post(
        "/internship/practice/instance/updateStatus",
        body
    ) as Promise<any>;
};

/**
 * 获取评分页面的学生列表
 * @param query 查询参数
 * @returns Promise，返回学生列表数据
 */
export const queryCourseStudents = (query: CourseQuery) => {
    return request.get("/internship/practice/instance/list/student", {
        params: query,
    }) as Promise<any>;
};

// 定义获取学生提交成果详情的查询参数
interface ResultDetailQuery {
    taskId?: string; // 可选参数，任务 ID
    practiceInstanceId: string; // 实习实例 ID
    sno: string; // 学生编号
}

/**
 * 获取学生提交的成果详情
 * @param query 查询参数
 * @returns Promise，返回成果详情数据
 */
export const queryResultDetail = (query: ResultDetailQuery) => {
    return request.get("/internship/practice/result/detail", {
        params: query,
    }) as Promise<any>;
};

// 定义提交评分的请求体
interface EvaluateBody {
    practiceInstanceId: string; // 实习实例 ID
    sno: string; // 学生编号
    scoringItemsJson: string; // 评分项的 JSON 字符串
    studentName: string; // 学生姓名
    gradeName: string; // 年级名称
    className: string; // 班级名称
    status: number; // 评分状态
}

/**
 * 提交学生成绩评分
 * @param body 请求体，包含评分信息
 * @returns Promise，返回操作结果
 */
export const evaluateScore = (body: EvaluateBody) => {
    return request.post("/internship/evaluate/submit", body) as Promise<any>;
};

// 定义查询学生成绩详情的查询参数
interface ScoreDetail {
    practiceInstanceId: number; // 实习实例 ID
    sno: string; // 学生编号
}

/**
 * 获取学生成绩详情
 * @param query 查询参数
 * @returns Promise，返回学生成绩详情数据
 */
export const queryScoreDetail = (query: ScoreDetail) => {
    return request.get("/internship/evaluate/detail", {
        params: query,
    }) as Promise<any>;
};

// 定义查询学生成绩列表的查询参数
interface QueryScore {
    practiceInstanceId: number; // 实习实例 ID
    department?: string; // 可选参数，部门名称
    gradeName?: string; // 可选参数，年级名称
    className?: string; // 可选参数，班级名称
    searchKey?: string; // 可选参数，搜索关键词
    snos?: number[]; // 可选参数，学生编号数组
    pageSize: number; // 每页记录数
    pageNumber: number; // 页码
}

/**
 * 查询学生成绩列表
 * @param query 查询参数
 * @returns Promise，返回学生成绩列表数据
 */
export const queryScoreList = (query: QueryScore) => {
    return request.get("/internship/evaluate/list", {
        params: query,
    }) as Promise<any>;
};

/**
 * 获取及格/不及格学生人数概览
 * @param query 实习实例 ID
 * @returns Promise，返回学生人数概览数据
 */
export const queryScoreOverview = (query: number) => {
    return request.get("/internship/evaluate/overview", {
        params: { practiceInstanceId: query },
    }) as Promise<any>;
};

/**
 * 获取首页的课程总览数据
 * @returns Promise，返回课程总览数据
 */
export const overview = () => {
    return request.get(
        "/internship/practice/instance/overview"
    ) as Promise<any>;
};

/**
 * 获取所有算子列表
 * @returns Promise，返回算子列表数据
 */
export const queryAllOperator = () => {
    return request.get("/datasource/model-edu/list/all") as Promise<any>;
};
