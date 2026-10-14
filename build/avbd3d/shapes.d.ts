import { Rigid } from './ref/body.ts';
import type { Solver } from './ref/solver.ts';
import { type HullShape } from './hull.ts';
export { convexHull, hullFromTriangles, MAX_HULL_VERTICES, type HullShape } from './hull.ts';
export declare const isSphere: (body: Rigid) => boolean;
/** Mark a (thin) box as a sail: the GPU solver's wind pushes on its local z faces. */
export declare function sail(body: Rigid): Rigid;
export declare const isSail: (body: Rigid) => boolean;
/** A solid sphere of radius r. */
export declare function sphere(solver: Solver, r: number, density: number, friction: number, position: ArrayLike<number>, velocity?: ArrayLike<number>): Rigid;
/** The convex hull a body collides as (GPU solver), if it is one. */
export declare const hullOf: (body: Rigid) => HullShape | undefined;
/**
 * A convex hull (./hull.ts: `convexHull(points)`) of the given density, its principal frame at
 * `position` (the hull's centre of mass) turned by `rotation` (x, y, z, w). Place it where points
 * were with the hull's `center` and `rotation`. The GPU solver collides it as a hull when the device
 * can bind the hull buffer (GpuSolver3D.hulls), else as its bounding box; the CPU reference would
 * treat it as that box.
 */
export declare function hull(solver: Solver, shape: HullShape, density: number, friction: number, position: ArrayLike<number>, rotation?: ArrayLike<number>, velocity?: ArrayLike<number>): Rigid;
//# sourceMappingURL=shapes.d.ts.map