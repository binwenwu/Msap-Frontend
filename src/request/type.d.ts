// 用于表示登录时不带验证码的参数
interface LoginWithoutCaptchaParams {
    username: string; // 用户名
    password: string; // 密码
}

// 用于表示通过验证码登录时的参数
interface LoginByCaptchaParams {
    username: string; // 用户名
    password: string; // 密码
    userUuid: string; // 用户的唯一标识符
    phone: string; // 手机号码
    captchaValue: string; // 验证码的值
    email: string; // 邮箱地址
}

// 用于表示通用的响应结构，其中 T 是数据的类型
interface BaseResponse<T> {
    code: number; // 响应码，通常用于表示请求是否成功
    msg: string; // 响应消息，通常用于说明请求结果
    data: T; // 响应数据，类型为泛型 T
}

// 用于表示登录成功后的响应数据
interface LoginResponse {
    token: string; // 访问令牌
    refreshToken: string; // 刷新令牌
    tokenHead: string; // 令牌头部
    expiresIn: number; // 令牌的有效时长（秒）
    exp: number; // 令牌的到期时间（时间戳）
    refreshExpiresIn: number; // 刷新令牌的有效时长（秒）
    refreshExp: number; // 刷新令牌的到期时间（时间戳）
}

// 用于表示文件信息
interface File {
    assetName: string; // 文件名称
    assetUuid: string; // 文件的唯一标识符
    createTime: string; // 文件的创建时间
}

// 用于表示文件夹信息，文件夹可以包含文件或子文件夹
interface Folder {
    folderName: string; // 文件夹名称
    children: Array<File | Folder>; // 文件夹内的内容，可以是文件或子文件夹
}

// 用于表示所有类别的文件夹结构，包括数据和脚本文件夹
interface AllCategory {
    data: Folder; // 数据文件夹
    script: Folder; // 脚本文件夹
}
