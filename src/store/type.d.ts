/*
 * @Description: 定义了项目中的一些类型和接口，用于描述用户信息、模板状态、结果图层对象等数据结构
 * @Version: 1.0
 * @Autor:
 * @Date: 2023-07-14 11:20:02
 * @LastEditors: 赵卓轩
 * @LastEditTime: 2023-07-23 00:20:28
 */

// 子页面的类型，定义了几种可能的子页面名称
type SubPage = "all" | "project" | "resource" | "task";

// 排序类型，可以是升序、降序或不排序
type SortType = "asc" | "desc" | "none";

// 用户信息接口，描述了用户的相关信息
interface UserInfo {
    role?: number | null; // 用户角色编号，可能为空
    roleId?: string; // 用户角色ID
    token?: string | null; // 用户的访问Token，可能为空
    refreshToken?: string | null; // 用于刷新Token的令牌，可能为空
    username?: string | null; // 用户名
    menu?: string | null; // 用户的菜单权限，可能为空
    userUuid?: string | null; // 用户的唯一标识符
    tokenHead?: string | null; // Token的前缀
    uid?: string | null; // 用户ID
    sno?: string | null; // 用户的学号或工号
}

// 用户状态接口，包含用户的基本信息
interface UserState {
    userInfo: UserInfo; // 用户的详细信息
}

// 语言状态接口，描述当前的语言类型
interface LanguageState {
    languageType: string; // 当前系统使用的语言类型
}

// 模板状态接口，包含模板的相关状态信息
interface TemplateState {
    open: boolean; // 模板是否处于打开状态
    current: number; // 当前选择的模板编号
    practiceTemplate: {
        id: number | null; // 模板的唯一标识符，可能为空
        name: string; // 模板名称
        creatorUid: number | null; // 创建者的用户ID，可能为空
        creatorName: string; // 创建者的名称
        submitReport?: number | null; // 是否需要提交报告
        intro: string; // 模板的简介
        coverPicPath: string; // 模板封面图片路径
        endTime: string; // 模板的结束时间
    };
    gradeCriterionJson: Record<string, any>[]; // 评分标准，键值对数组
    reportDict: Record<string, any>[]; // 报告字典，键值对数组
    practiceTaskTemplates: Record<string, any>[]; // 练习任务模板，键值对数组
}

// 结果图层对象接口，描述了某个结果图层的状态及其相关信息
interface ResultLayerObj {
    status: boolean; // 图层的状态（是否成功）
    layerName: string; // 图层的名称
    jobId: string; // 任务ID
    lnglatStr: string; // 图层的经纬度信息
    maxZoom: number; // 最大缩放级别
    minZoom: number; // 最小缩放级别
    identifier: string; // 图层的唯一标识符
    filePath: string; // 图层文件路径
}

// 图层工具箱状态接口，管理工具箱中的图层信息和操作状态
interface BoxState {
    saveOpen: boolean; // 保存对话框是否打开
    vectorOpen: boolean; // 矢量图层对话框是否打开
    currentLayer: Record<string, any>; // 当前操作的图层
    resourceLayers: ResourceLayer[]; // 资源图层列表
    drawLayers: Record<string, any>[]; // 绘制的图层列表
    resultLayers: ResultLayerObj[]; // 结果图层列表
}
