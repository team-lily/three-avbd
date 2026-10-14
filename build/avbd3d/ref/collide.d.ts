import type { Rigid } from './body.ts';
import { type M3, type V3 } from './math.ts';
export interface RawContact {
    feature: number;
    /** Contact point on each body, in that body's local frame (relative to its centre). */
    rA: V3;
    rB: V3;
}
/**
 * Collide two boxes. Writes the contact basis to `basisOut` (rows: normal pointing from B to
 * A, then two tangents) and returns up to 8 contacts; empty when separated.
 */
export declare function collide(bodyA: Rigid, bodyB: Rigid, basisOut: M3): RawContact[];
//# sourceMappingURL=collide.d.ts.map