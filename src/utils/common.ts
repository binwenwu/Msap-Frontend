/**
 * 防抖函数
 * 返回一个新的函数，该函数在用户持续触发事件时会延迟执行 `fn` 函数，
 * 直到用户停止触发事件一段时间后才执行目标函数。
 *
 * @param fn - 需要防抖的目标函数
 * @param ms - 延迟时间，单位为毫秒
 * @returns 返回一个新的防抖函数
 */
export function debounce(fn: Function, ms: number) {
    let timeOut: null | number = null;

    return (...args: any) => {
        if (timeOut) {
            clearTimeout(timeOut);
        }
        timeOut = window.setTimeout(() => {
            timeOut = null;
            // @ts-ignore this指向
            fn.apply(this, args);
        }, ms);
    };
}

/**
 * 时间格式化函数
 * 将 Date 对象格式化为字符串，格式为 YYYY_MM_DD_HH_MM_SS。
 *
 * @param date - 需要格式化的 Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: Date) {
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

/**
 * 生成一个包含当前时间和6位随机数字的字符串
 * 字符串格式为 YYYYMMDDHHmmss + 随机6位数字。
 *
 * @param currentDate - 当前时间的 Date 对象
 * @returns 生成的随机字符串
 */
export function generateRandomString(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    return `${year}${month}${day}${hours}${minutes}${seconds}${randomDigits}`;
}

/**
 * 补零函数
 * 将数字补零到两位。
 *
 * @param value - 需要补零的数字
 * @returns 补零后的字符串
 */
function padZero(value: number) {
    return value.toString().padStart(2, "0");
}

/**
 * 创建一个下载链接并点击以触发下载
 * 返回一个 Promise，该 Promise 会在点击事件发生后 resolve。
 *
 * @param url - 文件的下载链接
 * @param name - 下载的文件名
 * @returns 返回一个 Promise 对象
 */
export function downloadPromise(url: string, name: string) {
    return new Promise((resolve) => {
        const a = document.createElement("a");
        a.download = name; // 设置下载文件名
        a.rel = "noopener"; // 设置 rel 属性
        a.href = url; // 设置下载链接
        a.addEventListener("click", () => {
            resolve(null); // 触发下载后 resolve
        });
        a.click(); // 模拟点击下载链接
    });
}

/**
 * 简单的下载链接点击函数
 * 直接触发下载，不使用 Promise。
 *
 * @param url - 文件的下载链接
 */
export const downloadByUrl = (url: string) => {
    const a = document.createElement("a");
    a.rel = "noopener";
    a.href = url;
    a.click();
};

/**
 * 递归遍历数组并修改每个对象的属性
 * 将每个对象的 `name` 属性值赋值给 `label`，`code` 属性值赋值给 `value`。
 * 如果对象有 `children` 属性，则递归处理 `children` 数组。
 *
 * @param list - 需要处理的对象数组
 */
export const recursionArr = (list: any[]) => {
    list.forEach((item) => {
        item.label = item.name;
        item.value = item.code;
        if (item.children && Array.isArray(item.children)) {
            recursionArr(item.children);
        }
    });
};

/**
 * 删除对象中值为 null 或 "null" 的字段
 *
 * @param obj - 需要处理的对象
 * @returns 处理后的新对象
 */
export const deleteNullValue = (obj: Record<string, any>) => {
    const newObj = { ...obj };
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
        if (value === null || value === "null") {
            delete newObj[key];
        }
    });
    return newObj;
};

/**
 * 在指定时间内执行任务一定次数
 *
 * @param task - 需要执行的任务函数，接收当前执行次数
 * @param totalTime - 总时间，单位为秒
 * @param repeat - 执行次数
 * @returns 返回一个函数，可以调用以清除定时器
 */
export const executeRepeatedly = (
    task: (value: number) => void,
    totalTime: number,
    repeat: number
) => {
    const interval = totalTime / repeat; // 计算每次执行的间隔时间（秒）
    let count = 0;

    const timer = setInterval(() => {
        if (count >= repeat) {
            clearInterval(timer); // 达到执行次数后清除定时器
        } else {
            task(count); // 执行任务
            count++;
        }
    }, interval * 1000);
    return () => {
        clearInterval(timer); // 返回的函数用于清除定时器
    };
};

/**
 * 将对象中布尔值的字符串值转换为首字母大写的字符串
 *
 * @param values - 需要处理的对象
 * @returns 处理后的新对象
 */
export const toInitialUpperCase = (values: Record<string, any>) => {
    const newObj = { ...values };
    Object.entries(values).forEach(([key, value]: [string, any]) => {
        if (value === true || value === false) {
            newObj[key] =
                String(value).charAt(0).toUpperCase() + String(value).slice(1);
        }
    });
    return newObj;
};

/**
 * 将对象转换为查询字符串
 * 将对象的每个键值对转换为 URL 查询参数格式。
 *
 * @param obj - 需要转换的对象
 * @returns 查询字符串
 */
export const objectToQueryString = (obj: Record<string, any>) => {
    if (!obj || Object.keys(obj).length === 0) {
        return "";
    }
    const queryPairs = Array.from(Object.entries(obj)).map(([key, value]) => {
        if (Array.isArray(value)) {
            value = value.map((item) => encodeURIComponent(item)).join(",");
        } else {
            value = encodeURIComponent(value as any);
        }
        return `${encodeURIComponent(key)}=${value}`;
    });
    return queryPairs.join("&");
};

/**
 * 将 JSON 字符串解析为对象，或直接返回对象
 *
 * @param jsonString - 需要解析的 JSON 字符串
 * @returns 解析后的对象或原始对象
 */
export const parseJSON = (jsonString: any) => {
    if (!jsonString?.length) return jsonString;
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
};

/**
 * 将对象转换为 JSON 字符串，或直接返回 JSON 字符串
 *
 * @param object - 需要转换的对象
 * @returns JSON 字符串或原始字符串
 */
export const toJSON = (object: any) => {
    return typeof object !== "string" ? JSON.stringify(object) : object;
};

/**
 * 将图层对象转换为 GeoJSON 格式的 FeatureCollection
 * 如果 `add` 为 false 且图层对象已经是 FeatureCollection，则直接返回
 * 否则从 `window.layerMap` 中获取每个图层的 GeoJSON 并组合成 FeatureCollection。
 *
 * @param layerObj - 需要转换的图层对象
 * @param add - 是否需要添加新的图层
 * @returns 转换后的 FeatureCollection 对象
 */
export const toFeatureCollection = (
    layerObj: Record<string, any>,
    add?: boolean
) => {
    if (!add && layerObj.geojson.type === "FeatureCollection") {
        return { ...JSON.parse(JSON.stringify(layerObj.geojson)) };
    }
    const geojson = {
        type: "FeatureCollection",
        features: [] as any[],
    };
    const ids = layerObj.layerIds as number[];
    ids.forEach((id) => {
        const json = window.layerMap[id]?.toGeoJSON();
        geojson.features.push(json);
    });
    return geojson;
};
