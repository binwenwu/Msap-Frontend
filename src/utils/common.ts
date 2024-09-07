// 防抖函数
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

// 时间formatter YYYY_MM_DD_HH_MM_SS
export function formatTime(date: Date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

export function generateRandomString(currentDate: Date) {
  // const currentDate = new Date();

  // 获取年、月、日、时、分、秒的各个部分
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  // 生成6位的随机数字
  const randomDigits = Math.floor(100000 + Math.random() * 900000);

  // 组合成字符串
  return `${year}${month}${day}${hours}${minutes}${seconds}${randomDigits}`;
}

function padZero(value: number) {
  return value.toString().padStart(2, "0");
}

export function downloadPromise(url: string, name: string) {
  return new Promise((resolve) => {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    a.href = url;
    a.addEventListener("click", () => {
      resolve(null);
    });
    a.click();
  });
}

export const downloadByUrl = (url: string) => {
  const a = document.createElement("a");
  a.rel = "noopener";
  a.href = url;
  a.click();
};

export const recursionArr = (list: any[]) => {
  // 遍历数组中的每个对象
  list.forEach((item) => {
    // 调用modifyFn函数修改当前对象的属性
    item.label = item.name;
    item.value = item.code;
    // 如果当前对象有children字段，则递归地对其children数组执行同样的操作
    if (item.children && Array.isArray(item.children)) {
      recursionArr(item.children);
    }
  });
};

/**
 * 删除对象中的有value为null的字段
 * @param obj
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
 * 指定时间内执行多少次方法
 * @param task
 * @param totalTime
 * @param repeat
 */
export const executeRepeatedly = (
  task: (value: number) => void,
  totalTime: number,
  repeat: number
) => {
  const interval = totalTime / repeat; // 计算每次执行的间隔时间（毫秒）
  let count = 0;

  const timer = setInterval(() => {
    if (count >= repeat) {
      clearInterval(timer);
    } else {
      task(count);
      count++;
    }
  }, interval * 1000);
  return () => {
    clearInterval(timer);
  };
};

/**
 * 对象value转成道字母大写
 * @param values
 * @returns
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

// 将对象转换为查询字符串
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

export const parseJSON = (jsonString: any) => {
  if (!jsonString?.length) return jsonString;
  return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
};

export const toJSON = (object: any) => {
  return typeof object !== "string" ? JSON.stringify(object) : object;
};

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
