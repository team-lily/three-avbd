import { type M3, type V3 } from './math.ts';
import type { Solver } from './solver.ts';
export declare const PENALTY_MIN = 1;
export declare const PENALTY_MAX = 10000000000;
export declare const COLLISION_MARGIN = 0.01;
export declare const STICK_THRESH = 0.00001;
export declare class Rigid {
    readonly solver: Solver;
    readonly forces: Force[];
    readonly positionLin: V3;
    readonly positionAng: import("./math.ts").Quat;
    readonly initialLin: V3;
    readonly initialAng: import("./math.ts").Quat;
    readonly inertialLin: V3;
    readonly inertialAng: import("./math.ts").Quat;
    readonly velocityLin: V3;
    readonly velocityAng: V3;
    readonly prevVelocityLin: V3;
    /** Full widths along each local axis. */
    readonly size: V3;
    mass: number;
    readonly moment: V3;
    friction: number;
    radius: number;
    constructor(solver: Solver, size: ArrayLike<number>, density: number, friction: number, position: ArrayLike<number>, velocity?: ArrayLike<number>);
    constrainedTo(other: Rigid): boolean;
}
/** The per-body 6x6 linear system (Eqs. 5, 6): [lin, crossᵀ; cross, ang]·dx = -rhs. */
export interface BodySystem {
    lhsLin: M3;
    lhsAng: M3;
    lhsCross: M3;
    rhsLin: V3;
    rhsAng: V3;
}
export declare const bodySystem: () => BodySystem;
/** Common interface for all forces. When bodyA is null the force attaches bodyB to the world. */
export declare abstract class Force {
    readonly solver: Solver;
    readonly bodyA: Rigid | null;
    readonly bodyB: Rigid;
    constructor(solver: Solver, bodyA: Rigid | null, bodyB: Rigid);
    /** Unlink from the solver and both bodies (the C++ destructor). */
    destroy(): void;
    /** Unlink from the bodies only; used when the solver rebuilds its own list in bulk. */
    unlinkFromBodies(): void;
    /** Cache anything constant over the step and warm-start. Returning false removes the force. */
    abstract initialize(): boolean;
    /** Stamp this force's gradient and Hessian for `body` into its linear system. */
    abstract updatePrimal(body: Rigid, alpha: number, sys: BodySystem): void;
    abstract updateDual(alpha: number): void;
}
//# sourceMappingURL=body.d.ts.map