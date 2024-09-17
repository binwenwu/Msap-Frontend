import * as Cesium from "cesium";

/**
 * 将2D屏幕坐标转换为经纬度坐标。
 *
 * @param viewer - Cesium Viewer 实例。
 * @param x - 2D屏幕坐标的x坐标。
 * @param y - 2D屏幕坐标的y坐标。
 * @returns 一个对象，包含经度和纬度。
 */
const coordToLonlat = (viewer: Cesium.Viewer, x: number, y: number) => {
    // 从viewer中获取相机和场景对象
    const { camera, scene } = viewer;

    // 创建一个2D屏幕坐标对象
    const d2 = new Cesium.Cartesian2(x, y);

    // 从场景的globe对象中获取椭球体
    const { ellipsoid } = scene.globe;

    // 将2D屏幕坐标转换为3D世界坐标
    const d3 = camera.pickEllipsoid(d2, ellipsoid) as Cesium.Cartesian3;

    // 将3D世界坐标转换为弧度坐标
    const upperLeftCartographic =
        scene.globe.ellipsoid.cartesianToCartographic(d3);

    // 将弧度坐标转换为经纬度
    const lon = Cesium.Math.toDegrees(upperLeftCartographic.longitude);
    const lat = Cesium.Math.toDegrees(upperLeftCartographic.latitude);

    // 返回经纬度坐标对象
    return { lon, lat };
};

/**
 * 获取地图视口的空间范围（经纬度）。
 *
 * @param viewer - Cesium Viewer 实例。
 * @returns 一个数组，包含视口的西经、南纬、东经和北纬。
 */
export const getMapSpatialRange = (viewer: Cesium.Viewer) => {
    // 获取视口的空间范围（矩形）对象
    const extend = viewer.camera.computeViewRectangle();

    if (typeof extend === "undefined") {
        // 如果无法计算视口矩形，则使用屏幕坐标的方法计算经纬度范围

        const { canvas } = viewer.scene;

        // 获取视口左上角的经纬度
        const upperLeftLonLat = coordToLonlat(viewer, 0, 0);

        // 获取视口右下角的经纬度
        const lowerRightLonLat = coordToLonlat(
            viewer,
            canvas.clientWidth,
            canvas.clientHeight
        );

        // 返回经纬度范围数组
        return [
            upperLeftLonLat.lon,
            upperLeftLonLat.lat,
            lowerRightLonLat.lon,
            lowerRightLonLat.lat,
        ];
    } else {
        // 如果可以计算视口矩形，则转换为经纬度并返回
        return [
            Cesium.Math.toDegrees(extend.west),
            Cesium.Math.toDegrees(extend.south),
            Cesium.Math.toDegrees(extend.east),
            Cesium.Math.toDegrees(extend.north),
        ];
    }
};

/**
 * 根据视图中的相机高度获取地图层级。
 *
 * @param viewer - Cesium Viewer 实例。
 * @returns 地图层级（一个整数值），根据相机高度来决定。
 */
export const getMapLevel = (viewer: Cesium.Viewer) => {
    // 获取相机的海拔高度
    const h = viewer.camera.positionCartographic.height;

    // 根据高度确定地图层级
    if (h <= 100) {
        // 海拔高度小于等于100米时，返回层级19
        return 19;
    } else if (h <= 300) {
        // 海拔高度小于等于300米时，返回层级18
        return 18;
    } else if (h <= 660) {
        // 海拔高度小于等于660米时，返回层级17
        return 17;
    } else if (h <= 1300) {
        // 海拔高度小于等于1300米时，返回层级16
        return 16;
    } else if (h <= 2600) {
        // 海拔高度小于等于2600米时，返回层级15
        return 15;
    } else if (h <= 6400) {
        // 海拔高度小于等于6400米时，返回层级14
        return 14;
    } else if (h <= 13200) {
        // 海拔高度小于等于13200米时，返回层级13
        return 13;
    } else if (h <= 26000) {
        // 海拔高度小于等于26000米时，返回层级12
        return 12;
    } else if (h <= 67985) {
        // 海拔高度小于等于67985米时，返回层级11
        return 11;
    } else if (h <= 139780) {
        // 海拔高度小于等于139780米时，返回层级10
        return 10;
    } else if (h <= 250600) {
        // 海拔高度小于等于250600米时，返回层级9
        return 9;
    } else if (h <= 380000) {
        // 海拔高度小于等于380000米时，返回层级8
        return 8;
    } else if (h <= 640000) {
        // 海拔高度小于等于640000米时，返回层级7
        return 7;
    } else if (h <= 1280000) {
        // 海拔高度小于等于1280000米时，返回层级6
        return 6;
    } else if (h <= 2600000) {
        // 海拔高度小于等于2600000米时，返回层级5
        return 5;
    } else if (h <= 6100000) {
        // 海拔高度小于等于6100000米时，返回层级4
        return 4;
    } else if (h <= 11900000) {
        // 海拔高度小于等于11900000米时，返回层级3
        return 3;
    } else {
        // 海拔高度大于11900000米时，返回层级2
        return 2;
    }
};

/**
 * 根据地图层级获取对应的视图高度。
 *
 * @param zoomIndex - 地图层级（1到19之间的整数）。
 * @returns 对应层级的视图高度（单位：米）。如果层级不在定义的范围内，则返回 `undefined`。
 */
export const zoomToHeight = (zoomIndex: number) => {
    // 定义一个映射关系，从层级到对应的视图高度
    const zoomToHeightMap: { [index: number]: number } = {
        19: 100,
        18: 300,
        17: 660,
        16: 1300,
        15: 2600,
        14: 6400,
        13: 13200,
        12: 26000,
        11: 67985,
        10: 139780,
        9: 250600,
        8: 380000,
        7: 640000,
        6: 1280000,
        5: 2600000,
        4: 6100000,
        3: 11900000,
        2: 25000000,
        1: 50000000,
    };

    // 根据层级返回对应的视图高度
    return zoomToHeightMap[zoomIndex];
};

/**
 * 扩大空间范围 n 倍。
 *
 * @param extension - 当前空间范围的数组，格式为 [xmin, ymin, xmax, ymax]。
 * @param n - 扩大的倍数。
 * @returns 扩大后的空间范围数组，格式为 [xmin, ymin, xmax, ymax]。
 */
export const expandSpatialRange = (extension: number[], n: number) => {
    // 计算当前范围的宽度和高度
    const detaX = extension[2] - extension[0];
    const detaY = extension[3] - extension[1];

    let xmin_extend = 0;
    let xmax_extend = 0;

    // 处理经度的扩展
    if (Math.abs(detaX) * (2 * n + 1) >= 360) {
        // 如果扩展后范围覆盖了整个地球经度范围，则设置经度范围为全地球范围
        xmin_extend = -180;
        xmax_extend = 180;
    } else {
        // 否则，根据扩展倍数计算经度范围
        xmin_extend =
            extension[0] - detaX * n < -180
                ? 360 + extension[0] - detaX * n
                : extension[0] - detaX * n;
        xmax_extend =
            extension[2] + detaX * n > 180
                ? extension[2] + detaX * n - 360
                : extension[2] + detaX * n;
    }

    // 处理纬度的扩展
    const ymin_extend =
        extension[1] - detaY * n < -90 ? -90 : extension[1] - detaY * n;
    const ymax_extend =
        extension[3] + detaY * n > 90 ? 90 : extension[3] + detaY * n;

    // 返回扩大后的空间范围
    return [xmin_extend, ymin_extend, xmax_extend, ymax_extend];
};

/**
 * 比较两次空间范围的变化，判断范围是否变化较小，不需要重新请求数据。
 *
 * @param level - 当前地图层级。
 * @param spatialRange - 当前空间范围，格式为 [xmin, ymin, xmax, ymax]。
 * @param preLevel - 上一次地图层级，如果没有则为 null。
 * @param preSpatialRange - 上一次的空间范围，格式为 [xmin, ymin, xmax, ymax]。
 * @returns 如果范围变化较小，返回 true，表示不需要请求；否则返回 false。
 */
export const compareSpatialRange = (
    level: number,
    spatialRange: number[],
    preLevel: number | null,
    preSpatialRange: number[]
) => {
    // 如果上一次的层级为空或上一次的空间范围为空，返回 false
    if (preLevel === null || preSpatialRange.length === 0) {
        return false;
    }

    // 如果当前层级与上一次的层级不同，返回 false
    if (preLevel !== level) {
        return false;
    }

    // 使用 JSON 字符串化进行浅比较，检查当前空间范围是否与上一次相同
    if (JSON.stringify(preSpatialRange) === JSON.stringify(spatialRange)) {
        return true;
    }

    // 检查空间范围的变化是否非常小，如果变化在水平和垂直方向上都是相对较小，则返回 true
    if (
        (preSpatialRange[0] - spatialRange[0]) *
            (preSpatialRange[2] - spatialRange[2]) <
            0 &&
        (preSpatialRange[1] - spatialRange[1]) *
            (preSpatialRange[3] - spatialRange[3]) <
            0
    ) {
        return true;
    }

    // 其他情况，返回 false
    return false;
};

/**
 * 在 Cesium 视图中加载一个图片实体，并将视角飞行到图片中心。
 *
 * @param viewer - Cesium 视图对象。
 * @param imageURL - 图片的 URL，用于指定图片材质。
 * @param lblong - 图片左下角的经度。
 * @param lblat - 图片左下角的纬度。
 * @param rtlong - 图片右上角的经度。
 * @param rtlat - 图片右上角的纬度。
 * @param height - 图片的高度，单位为千米。
 */
export const loadImageEntity = (
    viewer: Cesium.Viewer,
    imageURL: string,
    lblong: number,
    lblat: number,
    rtlong: number,
    rtlat: number,
    height: number
) => {
    // 添加墙体实体
    viewer.entities.add({
        id: `${imageURL}_wall`,
        wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                lblong, // 左下角经度
                rtlat, // 右上角纬度
                height * 1000, // 墙体高度
                rtlong, // 右上角经度
                rtlat, // 右上角纬度
                height * 1000, // 墙体高度
                rtlong, // 右上角经度
                lblat, // 左上角纬度
                height * 1000, // 墙体高度
                lblong, // 左下角经度
                lblat, // 左下角纬度
                height * 1000, // 墙体高度
                lblong, // 左下角经度
                rtlat, // 右上角纬度
                height * 1000, // 墙体高度
            ]),
            material: Cesium.Color.WHITE.withAlpha(0.01), // 设置墙体材质为半透明白色
            outline: false, // 不显示轮廓线
        },
    });

    // 添加多边形实体
    viewer.entities.add({
        id: `${imageURL}_polygon`,
        polygon: {
            // @ts-ignore hierarchy
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                lblong, // 左下角经度
                lblat, // 左下角纬度
                rtlong, // 右下角经度
                lblat, // 左下角纬度
                rtlong, // 右下角经度
                rtlat, // 右上角纬度
                lblong, // 左上角经度
                rtlat, // 右上角纬度
                lblong, // 左上角经度
                lblat, // 左下角纬度
            ]),
            // @ts-ignore material
            material: imageURL, // 设置多边形的材质为图片
            height: height * 1000, // 设置多边形的高度
        },
    });

    // 计算中心点坐标
    const latlng = {
        lat: (lblat + rtlat) / 2,
        lng: (lblong + rtlong) / 2,
    };

    const angle = -30; // 俯视角度，默认 30°，可根据需要调整

    // 计算视角中心点
    const centerLatlng = getCenterLatlng(
        latlng.lng,
        latlng.lat,
        0,
        (height * 1000 * 5) / Math.tan((angle * Math.PI) / 180)
    );

    // 飞行到图片的中心点
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            centerLatlng.lng,
            centerLatlng.lat,
            height * 1000 * 5 // 相机距离地面的高度
        ),
        orientation: {
            heading: Cesium.Math.toRadians(0), // 朝向
            pitch: Cesium.Math.toRadians(angle), // 俯视角度
            roll: Cesium.Math.toRadians(0), // 旋转角度
        },
        duration: 0.5, // 飞行时间
    });
};

/**
 * 根据起始经纬度、方向和距离计算目标点的经纬度。
 *
 * @param lng - 起始点的经度（单位：度）。
 * @param lat - 起始点的纬度（单位：度）。
 * @param brng - 从起始点到目标点的方向（单位：度）。
 * @param dist - 起始点到目标点的距离（单位：米）。
 * @returns 目标点的经纬度对象，包括 `lng`（经度）和 `lat`（纬度），单位为度。
 */
const getCenterLatlng = (
    lng: number,
    lat: number,
    brng: number,
    dist: number
) => {
    const a = 6378137; // WGS-84 椭球体长半轴 (米)
    const b = 6356752.3142; // WGS-84 椭球体短半轴 (米)
    const f = 1 / 298.257223563; // WGS-84 椭球体扁率

    const lon1 = lng; // 起始经度
    const lat1 = lat; // 起始纬度
    const s = dist; // 距离
    const alpha1 = brng * (Math.PI / 180); // 方向角（从度转换为弧度）
    const sinAlpha1 = Math.sin(alpha1);
    const cosAlpha1 = Math.cos(alpha1);
    const tanU1 = (1 - f) * Math.tan(lat1 * (Math.PI / 180)); // 计算纬度的正切值
    const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1); // 计算纬度的余弦值
    const sinU1 = tanU1 * cosU1;
    const sigma1 = Math.atan2(tanU1, cosAlpha1); // 起始点的角距
    const sinAlpha = cosU1 * sinAlpha1; // 方向角的正弦值
    const cosSqAlpha = 1 - sinAlpha * sinAlpha; // 方向角的余弦平方值
    const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b); // 参数 u^2
    const A =
        1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))); // 参数 A
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))); // 参数 B

    let sigma = s / (b * A); // 初始角距
    let sigmaP = 2 * Math.PI; // 上一次角距
    let cos2SigmaM = 0;
    let sinSigma = 0;
    let cosSigma = 0;

    // 迭代计算角距 sigma
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        cos2SigmaM = Math.cos(2 * sigma1 + sigma);
        sinSigma = Math.sin(sigma);
        cosSigma = Math.cos(sigma);
        const deltaSigma =
            B *
            sinSigma *
            (cos2SigmaM +
                (B / 4) *
                    (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                        (B / 6) *
                            cos2SigmaM *
                            (-3 + 4 * sinSigma * sinSigma) *
                            (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    }

    // 计算目标点的纬度和经度
    const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    const lat2 = Math.atan2(
        sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
        (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)
    );
    const lambda = Math.atan2(
        sinSigma * sinAlpha1,
        cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
    );
    const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    const L =
        lambda -
        (1 - C) *
            f *
            sinAlpha *
            (sigma +
                C *
                    sinSigma *
                    (cos2SigmaM +
                        C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

    // 计算目标点的经纬度
    const lngLatObj = {
        lng: lon1 + L * (180 / Math.PI), // 目标经度
        lat: lat2 * (180 / Math.PI), // 目标纬度
    };
    return lngLatObj;
};

/**
 * 获取当前窗口下的分辨率
 *
 * @param viewer - Cesium 的 Viewer 实例
 * @returns 当前视图的分辨率，单位为米
 */
export const getResolution = (viewer: Cesium.Viewer) => {
    const { scene } = viewer;

    // 获取画布的大小
    const width = scene.canvas.clientWidth; // 画布宽度
    const height = scene.canvas.clientHeight; // 画布高度

    // 获取画布中心两个像素的坐标（默认地图渲染在画布中心位置）
    const left = scene.camera.getPickRay(
        new Cesium.Cartesian2(width / 2, (height - 1) / 2)
    );
    const right = scene.camera.getPickRay(
        new Cesium.Cartesian2(1 + width / 2, (height - 1) / 2)
    );

    // 如果获取的射线为空，则返回 undefined
    if (!left || !right) return;

    const { globe } = scene;

    // 计算两个射线在地球表面的交点位置
    const leftPosition = globe.pick(left, scene);
    const rightPosition = globe.pick(right, scene);

    // 如果交点为空，则返回 undefined
    if (
        !leftPosition ||
        !rightPosition ||
        !Cesium.defined(leftPosition) ||
        !Cesium.defined(rightPosition)
    ) {
        return;
    }

    // 将交点的笛卡尔坐标转换为大地坐标（经纬度）
    const leftCartographic =
        globe.ellipsoid.cartesianToCartographic(leftPosition);
    const rightCartographic =
        globe.ellipsoid.cartesianToCartographic(rightPosition);

    // 创建一个地球椭球体的大地测量对象
    const geodesic = new Cesium.EllipsoidGeodesic();
    // 设置大地测量的起点和终点
    geodesic.setEndPoints(leftCartographic, rightCartographic);

    // 返回两点之间的地表距离作为分辨率
    return geodesic.surfaceDistance; // 分辨率，单位为米
};
