export type V3 = Float64Array;
export type Quat = Float64Array;
export type M3 = Float64Array;
export declare const vec3: (x?: number, y?: number, z?: number) => V3;
export declare const quat: (x?: number, y?: number, z?: number, w?: number) => Quat;
export declare const mat3: () => M3;
export declare const rad: (deg: number) => number;
export declare const sign: (x: number) => number;
export declare const min: (a: number, b: number) => number;
export declare const max: (a: number, b: number) => number;
export declare const clamp: (x: number, a: number, b: number) => number;
export declare const dot: (a: ArrayLike<number>, b: ArrayLike<number>) => number;
export declare const lengthSq: (v: ArrayLike<number>) => number;
export declare const length: (v: ArrayLike<number>) => number;
export declare function set3(out: V3, x: number, y: number, z: number): V3;
export declare const add3: (out: V3, a: ArrayLike<number>, b: ArrayLike<number>) => V3;
export declare const sub3: (out: V3, a: ArrayLike<number>, b: ArrayLike<number>) => V3;
export declare const scale3: (out: V3, a: ArrayLike<number>, s: number) => V3;
export declare const div3: (out: V3, a: ArrayLike<number>, s: number) => V3;
export declare const neg3: (out: V3, a: ArrayLike<number>) => V3;
export declare const abs3: (out: V3, a: ArrayLike<number>) => V3;
/** out = a + b * s */
export declare const addScaled3: (out: V3, a: ArrayLike<number>, b: ArrayLike<number>, s: number) => V3;
export declare const normalize3: (out: V3, v: ArrayLike<number>) => V3;
export declare const cross: (out: V3, a: ArrayLike<number>, b: ArrayLike<number>) => V3;
export declare function set4(out: Quat, x: number, y: number, z: number, w: number): Quat;
export declare function qmul(out: Quat, a: ArrayLike<number>, b: ArrayLike<number>): Quat;
export declare const conjugate: (out: Quat, q: ArrayLike<number>) => Quat;
export declare const qlengthSq: (q: ArrayLike<number>) => number;
export declare function qinverse(out: Quat, q: ArrayLike<number>): Quat;
export declare function qnormalize(out: Quat, q: ArrayLike<number>): Quat;
/** The demo's `quat - quat`: rotation vector (small angle) taking b to a, 2·vec(a·b⁻¹). */
export declare function qsub(out: V3, a: ArrayLike<number>, b: ArrayLike<number>): V3;
/** The demo's `quat + float3`: integrate a rotation vector, normalize(a + (b, 0)·a·½). */
export declare function qaddv(out: Quat, a: ArrayLike<number>, b: ArrayLike<number>): Quat;
export declare function rotate(out: V3, q: ArrayLike<number>, v: ArrayLike<number>): V3;
export declare function transform(out: V3, p: ArrayLike<number>, q: ArrayLike<number>, v: ArrayLike<number>): V3;
/** Rotate by the conjugate of q (world to body-local for a unit quaternion). */
export declare function rotateInv(out: V3, q: ArrayLike<number>, v: ArrayLike<number>): V3;
export declare function diagonal(out: M3, a: number, b: number, c: number): M3;
export declare function skew(out: M3, r: ArrayLike<number>): M3;
export declare function transpose(out: M3, a: M3): M3;
/** out = a · b, each entry dot(a.row(i), b.col(j)) as in maths.h. */
export declare function mul(out: M3, a: M3, b: M3): M3;
export declare function mulv(out: V3, a: M3, v: ArrayLike<number>): V3;
export declare function addm(out: M3, a: M3): M3;
export declare function scalem(out: M3, a: M3, s: number): M3;
export declare function negm(out: M3, a: M3): M3;
/** outer(a, b): rows b·a.x, b·a.y, b·a.z. */
export declare function outer(out: M3, a: ArrayLike<number>, b: ArrayLike<number>): M3;
/** Diagonal of the column norms (the paper's lumped geometric stiffness, Sec. 3.5). */
export declare function diagonalize(out: M3, m: M3): M3;
/** Rows (n, t1, t2): the contact basis with the normal first. */
export declare function orthonormal(out: M3, n: ArrayLike<number>): M3;
/**
 * Solve the 6x6 SPD system [aLin aCrossᵀ; aCross aAng]·x = b with an LDLᵀ decomposition
 * (maths.h `solve`). Only the lower triangle is read.
 */
export declare function solve6(aLin: M3, aAng: M3, aCross: M3, bLin: ArrayLike<number>, bAng: ArrayLike<number>, xLin: V3, xAng: V3): void;
//# sourceMappingURL=math.d.ts.map