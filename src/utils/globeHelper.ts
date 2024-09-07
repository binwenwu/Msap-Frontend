import * as Cesium from "cesium";

const coordToLonlat = (viewer: Cesium.Viewer, x: number, y: number) => {
  const { camera, scene } = viewer;
  const d2 = new Cesium.Cartesian2(x, y);
  const { ellipsoid } = scene.globe;
  // 2D转3D世界坐标
  const d3 = camera.pickEllipsoid(d2, ellipsoid) as Cesium.Cartesian3;
  // 3D世界坐标转弧度
  const upperLeftCartographic =
    scene.globe.ellipsoid.cartesianToCartographic(d3);
  // 弧度转经纬度
  const lon = Cesium.Math.toDegrees(upperLeftCartographic.longitude);
  const lat = Cesium.Math.toDegrees(upperLeftCartographic.latitude);
  return { lon, lat };
};

// 获取视口的空间范围
export const getMapSpatialRange = (viewer: Cesium.Viewer) => {
  const extend = viewer.camera.computeViewRectangle();
  if (typeof extend === "undefined") {
    const { canvas } = viewer.scene;
    const upperLeftLonLat = coordToLonlat(viewer, 0, 0);
    const lowerRightLonLat = coordToLonlat(
      viewer,
      canvas.clientWidth,
      canvas.clientHeight
    );
    return [
      upperLeftLonLat.lon,
      upperLeftLonLat.lat,
      lowerRightLonLat.lon,
      lowerRightLonLat.lat,
    ];
  } else {
    // 三维视图
    return [
      Cesium.Math.toDegrees(extend.west),
      Cesium.Math.toDegrees(extend.south),
      Cesium.Math.toDegrees(extend.east),
      Cesium.Math.toDegrees(extend.north),
    ];
  }
};
// 获取地图层级
export const getMapLevel = (viewer: Cesium.Viewer) => {
  // const viewer = this.cesiumViewer;
  // let tiles = new Set();
  // let tilesToRender = viewer.scene.globe._surface._tilesToRender;
  // if (Cesium.defined(tilesToRender)) {
  //     let level = 0;
  //     for (let i = 0; i < tilesToRender.length; i++) {
  //         tiles.add(tilesToRender[i].level);
  //         if (tilesToRender[i].level > level) {
  //             level = tilesToRender[i].level;
  //         }
  //     }
  //     // 这里向上取整
  //     // return Math.ceil(level/index);
  //     // 返回最大值
  //     return level;
  // }
  const h = viewer.camera.positionCartographic.height;
  if (h <= 100) {
    return 19;
  } else if (h <= 300) {
    return 18;
  } else if (h <= 660) {
    return 17;
  } else if (h <= 1300) {
    return 16;
  } else if (h <= 2600) {
    return 15;
  } else if (h <= 6400) {
    return 14;
  } else if (h <= 13200) {
    return 13;
  } else if (h <= 26000) {
    return 12;
  } else if (h <= 67985) {
    return 11;
  } else if (h <= 139780) {
    return 10;
  } else if (h <= 250600) {
    return 9;
  } else if (h <= 380000) {
    return 8;
  } else if (h <= 640000) {
    return 7;
  } else if (h <= 1280000) {
    return 6;
  } else if (h <= 2600000) {
    return 5;
  } else if (h <= 6100000) {
    return 4;
  } else if (h <= 11900000) {
    return 3;
  } else {
    return 2;
  }
};

export const zoomToHeight = (zoomIndex: number) => {
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
  return zoomToHeightMap[zoomIndex];
};

// 扩大n倍
export const expandSpatialRange = (extension: number[], n: number) => {
  const detaX = extension[2] - extension[0];
  const detaY = extension[3] - extension[1];
  let xmin_extend = 0;
  let xmax_extend = 0;
  if (Math.abs(detaX) * (2 * n + 1) >= 360) {
    xmin_extend = -180;
    xmax_extend = 180;
  } else {
    xmin_extend =
      extension[0] - detaX * n < -180
        ? 360 + extension[0] - detaX * n
        : extension[0] - detaX * n;
    xmax_extend =
      extension[2] + detaX * n > 180
        ? extension[2] - detaX * n - 360
        : extension[2] + detaX * n;
  }
  const ymin_extend =
    extension[1] - detaY * n < -90 ? -90 : extension[1] - detaY * n;
  const ymax_extend =
    extension[3] + detaY * n > 90 ? 90 : extension[3] + detaY * n;
  return [xmin_extend, ymin_extend, xmax_extend, ymax_extend];
};

// 比较两次的空的参数 true表示范围变化较小不需要请求
export const compareSpatialRange = (
  level: number,
  spatialRange: number[],
  preLevel: number | null,
  preSpatialRange: number[]
) => {
  if (preLevel === null || preSpatialRange.length === 0) {
    return false;
  }
  if (preLevel !== level) {
    return false;
  }
  // 浅比较数组
  if (JSON.stringify(preSpatialRange) === JSON.stringify(spatialRange)) {
    return true;
  }
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
  return false;
};

export const loadImageEntity = (
  viewer: Cesium.Viewer,
  imageURL: string,
  lblong: number,
  lblat: number,
  rtlong: number,
  rtlat: number,
  height: number
) => {
  viewer.entities.add({
    id: `${imageURL}_wall`,
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        lblong,
        rtlat,
        height * 1000,
        rtlong,
        rtlat,
        height * 1000,
        rtlong,
        lblat,
        height * 1000,
        lblong,
        lblat,
        height * 1000,
        lblong,
        rtlat,
        height * 1000,
      ]),
      material: Cesium.Color.WHITE.withAlpha(0.01),
      outline: false,
    },
  });
  viewer.entities.add({
    id: `${imageURL}_polygon`,
    polygon: {
      // @ts-ignore hierarchy
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        lblong,
        lblat,
        rtlong,
        lblat,
        rtlong,
        rtlat,
        lblong,
        rtlat,
        lblong,
        lblat,
      ]),
      // @ts-ignore material
      material: imageURL,
      height: height * 1000,
    },
  });
  const latlng = {
    lat: (lblat + rtlat) / 2,
    lng: (lblong + rtlong) / 2,
  };
  const angle = -30; // 俯视角度，默认90°，可手动更改
  // 做计算
  const centerLatlng = getCenterLatlng(
    latlng.lng,
    latlng.lat,
    0,
    (height * 1000 * 5) / Math.tan((angle * Math.PI) / 180)
  );
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      centerLatlng.lng,
      centerLatlng.lat,
      height * 1000 * 5
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: Cesium.Math.toRadians(0),
    },
    duration: 0.5,
  });
};

const getCenterLatlng = (
  lng: number,
  lat: number,
  brng: number,
  dist: number
) => {
  const a = 6378137;
  const b = 6356752.3142;
  const f = 1 / 298.257223563;

  const lon1 = lng * 1;
  const lat1 = lat * 1;
  const s = dist;
  const alpha1 = brng * (Math.PI / 180);
  const sinAlpha1 = Math.sin(alpha1);
  const cosAlpha1 = Math.cos(alpha1);
  const tanU1 = (1 - f) * Math.tan(lat1 * (Math.PI / 180));
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;
  const sigma1 = Math.atan2(tanU1, cosAlpha1);
  const sinAlpha = cosU1 * sinAlpha1;
  const cosSqAlpha = 1 - sinAlpha * sinAlpha;
  const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  let sigma = s / (b * A);
  let sigmaP = 2 * Math.PI;
  let cos2SigmaM = 0;
  let sinSigma = 0;
  let cosSigma = 0;
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
          (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

  // const revAz = Math.atan2(sinAlpha, -tmp);

  const lngLatObj = {
    lng: lon1 + L * (180 / Math.PI),
    lat: lat2 * (180 / Math.PI),
  };
  return lngLatObj;
};

// 获取当前窗口下的分辨率
export const getResolution = (viewer: Cesium.Viewer) => {
  const { scene } = viewer;
  // 获取画布的大小
  const width = scene.canvas.clientWidth;
  const height = scene.canvas.clientHeight;
  // 获取画布中心两个像素的坐标（默认地图渲染在画布中心位置）
  const left = scene.camera.getPickRay(
    new Cesium.Cartesian2(width / 2, (height - 1) / 2)
  );
  const right = scene.camera.getPickRay(
    new Cesium.Cartesian2(1 + width / 2, (height - 1) / 2)
  );

  if (!left || !right) return;

  const { globe } = scene;
  const leftPosition = globe.pick(left, scene);
  const rightPosition = globe.pick(right, scene);

  if (
    !leftPosition ||
    !rightPosition ||
    !Cesium.defined(leftPosition) ||
    !Cesium.defined(rightPosition)
  ) {
    return;
  }

  const leftCartographic =
    globe.ellipsoid.cartesianToCartographic(leftPosition);
  const rightCartographic =
    globe.ellipsoid.cartesianToCartographic(rightPosition);
  const geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(leftCartographic, rightCartographic);
  return geodesic.surfaceDistance; // 分辨率
};
