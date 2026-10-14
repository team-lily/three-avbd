/**
 * Bodies with radius above LARGE_FACTOR × median radius are tested brute-force against every
 * body instead of sizing the grid cells, up to MAX_LARGE of the largest (each costs a test
 * per body). Showcase balls are ~3x the median brick; at the 2D factor of 4 they set 4 m
 * cells and the wall-smash broadphase took most of an 8 ms step.
 */
export declare const LARGE_FACTOR = 2;
export declare const MAX_LARGE = 64;
/**
 * The k-th smallest of `a` (0-based), reordering `a` in place: Wirth's selection, linear on average, and balanced
 * on runs of equal values (a city's voxels are all one radius).
 */
export declare function select(a: Float64Array, k: number): number;
/**
 * The largest radius still small (it sizes the grid cells): at most LARGE_FACTOR × the median, or past MAX_LARGE
 * larger bodies, the largest left. Reorders `radii`.
 */
export declare function largestSmall(radii: Float64Array): number;
//# sourceMappingURL=radii.d.ts.map