interface LoginWithoutCaptchaParams {
  username: string;
  password: string;
}

interface LoginByCaptchaParams {
  username: string;
  password: string;
  userUuid: string;
  phone: string;
  captchaValue: string;
  email: string;
}

interface BaseResponse<T> {
  code: number;
  msg: string;
  data: T;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenHead: string;
  expiresIn: number;
  exp: number;
  refreshExpiresIn: number;
  refreshExp: number;
}
interface File {
  assetName: string;
  assetUuid: string;
  createTime: string;
}

interface Folder {
  folderName: string;
  children: Array<File | Folder>;
}

interface AllCategory {
  data: Folder;
  script: Folder;
}
