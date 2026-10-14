import { type Force, type Rigid } from './body.ts';
import { type V3 } from './math.ts';
export interface SolverParams {
    dt: number;
    gravity: number;
    iterations: number;
    /** Stabilization: fraction of step-start constraint error left uncorrected (Eq. 18). */
    alpha: number;
    /** Penalty ramping rate for linear rows (Eq. 16); the demo splits beta by units. */
    betaLin: number;
    /** Penalty ramping rate for angular rows. */
    betaAng: number;
    /** Warm-start decay of penalty and lambda (Eq. 19). */
    gamma: number;
}
export declare const defaultParams: () => SolverParams;
export interface PickHit {
    body: Rigid;
    /** Hit point in the body's local frame. */
    local: V3;
    /** Ray parameter of the hit. */
    t: number;
}
export declare class Solver implements SolverParams {
    dt: number;
    gravity: number;
    iterations: number;
    alpha: number;
    betaLin: number;
    betaAng: number;
    gamma: number;
    /** In creation order; iterated newest-first to match the C++ linked lists. */
    bodies: Rigid[];
    forces: Force[];
    constructor();
    defaultParams(): void;
    clear(): void;
    /** Ray-cast the dynamic bodies (slab test in each box's local frame); nearest hit wins. */
    pick(origin: ArrayLike<number>, dir: ArrayLike<number>): PickHit | null;
    private readonly sys;
    private readonly dxLin;
    private readonly dxAng;
    private readonly dp;
    private readonly accel;
    step(): void;
}
//# sourceMappingURL=solver.d.ts.map