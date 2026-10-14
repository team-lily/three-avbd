import { Force, type BodySystem, type Rigid } from './body.ts';
import { type V3 } from './math.ts';
import type { Solver } from './solver.ts';
/**
 * Ball-socket joint (linear rows) plus an angle lock (angular rows), with optional fracture
 * on the angular force. Stiffness Infinity makes a row hard (dual variable + stabilization);
 * a finite stiffness makes it a spring; 0 disables it. When bodyA is null, rA is a world point.
 */
export declare class Joint extends Force {
    readonly rA: V3;
    readonly rB: V3;
    readonly C0Lin: V3;
    readonly C0Ang: V3;
    readonly penaltyLin: V3;
    readonly penaltyAng: V3;
    readonly lambdaLin: V3;
    readonly lambdaAng: V3;
    stiffnessLin: number;
    stiffnessAng: number;
    fracture: number;
    torqueArm: number;
    broken: boolean;
    constructor(solver: Solver, bodyA: Rigid | null, bodyB: Rigid, rA: ArrayLike<number>, rB: ArrayLike<number>, stiffnessLin?: number, stiffnessAng?: number, fracture?: number);
    /** Linear constraint: anchor A minus anchor B, in world space. */
    evaluateLin(out: V3): V3;
    /** Angular constraint: relative rotation vector, scaled by torqueArm to length units. */
    evaluateAng(out: V3): V3;
    initialize(): boolean;
    updatePrimal(body: Rigid, alpha: number, sys: BodySystem): void;
    updateDual(alpha: number): void;
}
/** Standard spring between two anchors; rest < 0 takes the current distance. */
export declare class Spring extends Force {
    readonly rA: V3;
    readonly rB: V3;
    rest: number;
    stiffness: number;
    constructor(solver: Solver, bodyA: Rigid, bodyB: Rigid, rA: ArrayLike<number>, rB: ArrayLike<number>, stiffness: number, rest?: number);
    initialize(): boolean;
    updatePrimal(body: Rigid, _alpha: number, sys: BodySystem): void;
    updateDual(): void;
}
/** No physical effect; stops the broadphase creating a contact manifold for the pair. */
export declare class IgnoreCollision extends Force {
    initialize(): boolean;
    updatePrimal(): void;
    updateDual(): void;
}
//# sourceMappingURL=forces.d.ts.map