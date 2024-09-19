// 定义一个接口表示地理坐标，包含经度和纬度
export interface Position {
    longitude: number; // 经度
    latitude: number; // 纬度
}

// 定义一个接口表示三维地理坐标，继承自Position，并额外包含高度信息
interface Position3D extends Position {
    height: number; // 高度
}

/**
 * 计算多边形的中心点（忽略高度）
 *
 * @param positions - 一个由多个位置组成的数组，这些位置包含经度和纬度信息
 * @returns 返回计算出来的中心点，其经度和纬度是所有顶点的平均值
 */
export const getCenterFromPolygon = (positions: Position[]) => {
    // 初始化中心点为0，准备累加所有位置的经度和纬度
    const centroid = {
        longitude: 0,
        latitude: 0,
        height: 0, // 尽管不涉及高度计算，仍然初始化为0
    };
    const length = positions.length; // 获取顶点数量

    // 遍历每个顶点，累加其经度和纬度
    for (let i = 0; i < length; i++) {
        const position = positions[i];
        centroid.longitude += position.longitude;
        centroid.latitude += position.latitude;
    }

    // 计算经度和纬度的平均值，得到中心点
    centroid.longitude /= length;
    centroid.latitude /= length;

    return centroid; // 返回中心点
};

/**
 * 计算多边形的中心点（包含高度）
 *
 * @param positions - 一个包含经度、纬度和高度的三维坐标数组
 * @returns 返回计算出来的中心点，包含经度、纬度和高度的平均值
 */
export const getCenterFromPolygonWithHeight = (positions: Position3D[]) => {
    // 初始化中心点为0，准备累加所有位置的经度、纬度和高度
    const center = {
        longitude: 0,
        latitude: 0,
        height: 0,
    };
    const length = positions.length; // 获取顶点数量

    // 遍历每个顶点，累加其经度、纬度和高度
    for (let i = 0; i < length; i++) {
        const position = positions[i];
        center.longitude += position.longitude;
        center.latitude += position.latitude;
        center.height += position.height || 0; // 如果高度为undefined，默认为0
    }

    // 计算经度、纬度和高度的平均值，得到中心点
    center.longitude /= length;
    center.latitude /= length;
    center.height /= length;

    return center; // 返回中心点
};

/**
 * 计算由一维数组表示的多个点的中心点（忽略高度）
 *
 * @param positions - 一个一维数组，每两个元素表示一个位置的经度和纬度
 * @returns 返回计算出来的中心点，其经度和纬度是所有点的平均值
 */
export const getCenterFromPoints = (positions: number[]) => {
    // 初始化中心点为0，准备累加所有位置的经度和纬度
    const centroid = {
        longitude: 0,
        latitude: 0,
        height: 0, // 尽管不涉及高度计算，仍然初始化为0
    };
    const length = positions.length; // 获取数组长度

    // 遍历数组中每对经度和纬度，累加其值
    for (let i = 0; i < length; i += 2) {
        centroid.longitude += positions[i]; // 累加经度
        centroid.latitude += positions[i + 1]; // 累加纬度
    }

    // 计算经度和纬度的平均值，得到中心点
    centroid.longitude /= length / 2;
    centroid.latitude /= length / 2;

    return centroid; // 返回中心点
};
