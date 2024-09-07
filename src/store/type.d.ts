/*
 * @Description:
 * @Version: 1.0
 * @Autor:
 * @Date: 2023-07-14 11:20:02
 * @LastEditors: 赵卓轩
 * @LastEditTime: 2023-07-23 00:20:28
 */
type SubPage = "all" | "project" | "resource" | "task";

type SortType = "asc" | "desc" | "none";

interface UserInfo {
  role?: number | null;
  roleId?: string;
  token?: string | null;
  refreshToken?: string | null;
  username?: string | null;
  menu?: string | null;
  userUuid?: string | null;
  tokenHead?: string | null;
  uid?: string | null;
  sno?: string | null;
}

interface UserState {
  userInfo: UserInfo;
}
interface LanguageState {
  languageType: string;
}

// interface TemplateState {
//   practiceTemplate: {
//     id: number | nbull;
//     name: string;
//     creatorUid: number | null;
//     creatorName: string;
//     gradeCriterionJson: {
//       name: string;
//       value: number;
//     }[];
//     reportDict: {
//       id: number | null;
//       name: string;
//       path: string;
//     }[];
//     submitReport?: number | null;
//     intro: string;
//     coverPicPath: string
//     endTime: string;
//   };
//   parachuteTaskTemplates: [
//     {
//       id?: number | null;
//       practiceTid?: number | null;
//       name: string;
//       type: number;
//       description?: string;
//       providedAlgorithmsIds: string[];
//       submissionType: number;
//       providedDataIds?: [{
//         id: number | null;
//         name: string;
//         path: string;
//       }];
//       resultsRequirementIds?: [{
//         id: number | null;
//         name: string;
//         path: string;
//       }];
//       taskAttachmentIds?: [{
//         id: number | null;
//         name: string;
//         path: string;
//       }];
//     }
//   ]
// }

interface TemplateState {
  open: boolean;
  current: number;
  practiceTemplate: {
    id: number | nbull;
    name: string;
    creatorUid: number | null;
    creatorName: string;
    submitReport?: number | null;
    intro: string;
    coverPicPath: string;
    endTime: string;
  };
  gradeCriterionJson: Record<string, any>[];
  reportDict: Record<string, any>[];
  practiceTaskTemplates: Record<string, any>[];
}

interface ResultLayerObj {
  status: boolean;
  layerName: string;
  jobId: string;
  lnglatStr: string;
  maxZoom: number;
  minZoom: number;
  identifier: string;
  filePath: string;
}

interface BoxState {
  saveOpen: boolean;
  vectorOpen: boolean;
  currentLayer: Record<string, any>;
  resourceLayers: ResourceLayer[];
  drawLayers: Record<string, any>[];
  resultLayers: ResultLayerObj[];
}
