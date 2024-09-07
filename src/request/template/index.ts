import { request } from "./instance";

// 截止时间
interface TemplateBody {
  practiceTemplate: {
    id?: number;
    name: string;
    creatorUid?: any;
    creatorName?: any;
    gradeCriterionJson: any;
    // gradeCriterionJson: {
    //   name: string;
    //   value: number;
    // }[];
    reportDict: any;
    // reportDict: {
    //   id: number;
    //   name: string;
    //   path: string;
    // }[];
    submitReport?: number; // 是否提交报告 0 不提交 1 不提交
    intro: string;
    coverPicPath: string;
    endTime: any;
  };
  practiceTaskTemplates: Record<string, any>[];
  // practiceTaskTemplates: [
  //   {
  //     id?: number;
  //     practiceTid?: number;
  //     name: string; // 任务名称
  //     type: number; // 1 工具箱 2 编程
  //     description?: string;
  //     providedAlgorithmsIds: string[]; // 算子ID
  //     submissionType: number; // 1 个人 2 小组
  //     providedDataIds: [{
  //       id: number;
  //       name: string;
  //       path: string;
  //     }]; // 实习数据 []
  //     resultsRequirementIds: [{
  //       id: number;
  //       name: string;
  //       path: string;
  //     }]; // 成果要求
  //     taskAttachmentIds: [{
  //       id: number;
  //       name: string;
  //       path: string;
  //     }]; // 实习附件
  //   }
  // ]
}

export const createTemplate = (body: TemplateBody) => {
  return request.post("/practice/template/create", body) as Promise<any>;
};

export const editTemplate = (body: TemplateBody) => {
  return request.post("/practice/template/update", body) as Promise<any>;
};

export const deleteTemplate = (practiceTid: number) => {
  return request.post(
    `/practice/template/delete/${practiceTid}`
  ) as Promise<any>;
};

interface ShareTemplateBody {
  endTime?: string;
  practiceTid: number;
  uids?: number[];
  students?: Record<string, any>[];
  pageNumber?: number;
  pageSize?: number;
}

export const shareTemplate = (body: ShareTemplateBody) => {
  return request.post("/practice/template/share", body) as Promise<any>;
};

export const shareTeacherList = (id: number) => {
  return request.get(`/practice/template/share/teacher/${id}`) as Promise<any>;
};

interface TemplateQuery {
  type: number; // 我的/(平台|分享) 1/2
  name?: string;
  pageNumber: number;
  pageSize: number;
}

export const queryTemplate = (query: TemplateQuery) => {
  return request.get("/practice/template/list", {
    params: query,
  }) as Promise<any>;
};

export const queryTemplateDetail = (practiceTid: number) => {
  return request.get(
    `/practice/template/detail/${practiceTid}`
  ) as Promise<any>;
};

export const queryStudentsByTemplateId = (id: number) => {
  return request.get(
    `/practice/template/instance/student/${id}`
  ) as Promise<any>;
};

export const instanceTemplate = (body: ShareTemplateBody) => {
  return request.post("/practice/template/instance", body) as Promise<any>;
};
