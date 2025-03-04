export type Point = {
  type: "Point";
  coordinates: [number, number];
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
};

export type LineString = {
  type: "LineString";
  coordinates: [number, number][];
};

export type Polygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export type MultiPoint = {
  type: "MultiPoint";
  coordinates: [number, number][];
};

export type MultiLineString = {
  type: "MultiLineString";
  coordinates: [number, number][][];
};

export type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: [number, number][][][];
};

export type GeometryCollection = {
  type: "GeometryCollection";
  geometries: Geometry[];
};

export type Geometry =
  | Point
  | LineString
  | Polygon
  | MultiPoint
  | MultiLineString
  | MultiPolygon
  | GeometryCollection;

export type GeometryInput = Geometry | string;
