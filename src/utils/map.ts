export interface Position {
  longitude: number;
  latitude: number;
}
interface Position3D extends Position {
  height: number;
}
/**
 * 计算面的中心点(不含高度)
 * @param positions
 * @returns
 */
export const getCenterFromPolygon = (positions: Position[]) => {
  const centroid = {
    longitude: 0,
    latitude: 0,
    height: 0,
  };
  const length = positions.length;

  for (let i = 0; i < length; i++) {
    const position = positions[i];
    centroid.longitude += position.longitude;
    centroid.latitude += position.latitude;
  }

  centroid.longitude /= length;
  centroid.latitude /= length;

  return centroid;
};
/**
 * 计算面的中心点(含高度)
 * @param positions
 * @returns
 */
export const getCenterFromPolygonWithHeight = (positions: Position3D[]) => {
  const center = {
    longitude: 0,
    latitude: 0,
    height: 0,
  };
  const length = positions.length;

  for (let i = 0; i < length; i++) {
    const position = positions[i];
    center.longitude += position.longitude;
    center.latitude += position.latitude;
    center.height += position.height || 0;
  }

  center.longitude /= length;
  center.latitude /= length;
  center.height /= length;

  return center;
};

/**
 * 计算面的中心点(不含高度)
 * @param positions
 * @returns
 */
export const getCenterFromPoints = (positions: number[]) => {
  const centroid = {
    longitude: 0,
    latitude: 0,
    height: 0,
  };
  const length = positions.length;

  for (let i = 0; i < length; i += 2) {
    centroid.longitude += positions[i];
    centroid.latitude += positions[i + 1];
  }

  centroid.longitude /= length / 2;
  centroid.latitude /= length / 2;

  return centroid;
};
