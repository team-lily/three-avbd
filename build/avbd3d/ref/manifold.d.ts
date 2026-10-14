import { Force, type BodySystem, type Rigid } from './body.ts';
import { type M3, type V3 } from './math.ts';
import type { Solver } from './solver.ts';
export interface Contact {
    feature: number;
    /** Contact offsets in each body's local frame. */
    rA: V3;
    rB: V3;
    /** Constraint at x- (normal, tangent1, tangent2), including the collision margin. */
    C0: V3;
    penalty: V3;
    lambda: V3;
    stick: boolean;
}
export declare class Manifold extends Force {
    contacts: Contact[];
    /** Rows: normal (pointing from B to A), then the two tangents. */
    readonly basis: M3;
    friction: number;
    constructor(solver: Solver, bodyA: Rigid, bodyB: Rigid);
    get numContacts(): number;
    initialize(): boolean;
    /**
     * Evaluate contact `c`: Jacobians into the scratch matrices, constraint into C and the
     * cone-clamped force into F, and the friction magnitude and bound into frictionScale/bounds.
     */
    private evaluate;
    private computeDisplacements;
    updatePrimal(body: Rigid, alpha: number, sys: BodySystem): void;
    updateDual(alpha: number): void;
}
//# sourceMappingURL=manifold.d.ts.map