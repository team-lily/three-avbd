export interface HullFace {
    /** Outward unit normal and plane offset (n·x = d), principal frame. */
    normal: [number, number, number];
    d: number;
    /** Vertex indices, counter-clockwise seen from outside. */
    verts: number[];
}
export interface HullShape {
    /** Vertices, principal frame (x, y, z per vertex). */
    vertices: Float32Array;
    faces: HullFace[];
    /** Edges: vertex a, vertex b, the face on each side (face with a→b, face with b→a). */
    edges: Array<[number, number, number, number]>;
    /** Volume, and principal moments of inertia per unit density. */
    volume: number;
    moments: [number, number, number];
    /** Full widths of the vertices' bounds along the principal axes (symmetric about the centre of mass). */
    size: [number, number, number];
    /** Distance of the farthest vertex from the centre of mass. */
    radius: number;
    /** Where the principal frame sits in the input points' frame: centre of mass and rotation (x, y, z, w). */
    center: [number, number, number];
    rotation: [number, number, number, number];
}
/**
 * Most vertices a hull keeps (bigger ones are simplified: see `convexHull`). The GPU narrowphase
 * costs faces × vertices and edges × edges per touching pair, in one thread, and its contact feature
 * keys hold face and point indices in 8 bits; 32 vertices means at most 60 faces and 90 edges (a
 * fracture piece has 10-30 vertices).
 */
export declare const MAX_HULL_VERTICES = 32;
/**
 * The convex hull of xyz points and its mass properties, or null when the points span no volume
 * (fewer than four, or all on a plane or line). A hull of more than MAX_HULL_VERTICES vertices is
 * replaced by the hull of that many of them, spread out (farthest-point sampling): slightly smaller,
 * much cheaper to collide.
 */
export declare function convexHull(points: ArrayLike<number>): HullShape | null;
/**
 * A hull from a closed, outward-wound triangulation of a convex point set (e.g. three.js's
 * ConvexHull, or `convexHull` above): coplanar neighbouring triangles merged into polygon faces,
 * the edges with their two faces, and the mass properties. Null when the triangles don't close up
 * (every edge on exactly two faces) or enclose no volume.
 */
export declare function hullFromTriangles(positions: ArrayLike<number>, indices: ArrayLike<number>): HullShape | null;
//# sourceMappingURL=hull.d.ts.map