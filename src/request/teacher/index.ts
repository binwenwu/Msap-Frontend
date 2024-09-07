import { request } from "./instance";

interface RemindCourseQuery {
  pageNumber: number;
  pageSize: number;
}

export const queryOverdueStudents = (query: RemindCourseQuery) => {
  return request.get("/practice/instance/teacher/listRemind", {
    params: query,
  }) as Promise<any>;
};
