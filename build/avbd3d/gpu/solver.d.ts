import { type GpuCounters, PHASES, type StepProfile } from '../../avbd2d/gpu/layout.ts';
import type { Rigid } from '../ref/body.ts';
import { type Solver, type SolverParams } from '../ref/solver.ts';
import { type HullShape } from '../shapes.ts';
export { PHASES, type StepProfile };
export interface GpuCounters3D extends GpuCounters {
    /** Contact pairs (manifolds) written by the last step. */
    manifolds: number;
}
/** One contact point as read back (`readContactList`). */
export interface GpuContact {
    a: number;
    b: number;
    feature: number;
    stick: boolean;
    rA: number[];
    rB: number[];
    pen: number[];
    lam: number[];
    normal: number[];
}
/** Byte size of a body buffer holding `n` bodies. */
export declare const bodyBufferSize: (n: number) => number;
/** GPU solver parameters: the reference's, plus nearest-anchor warm starts (see 2D findings). */
export interface GpuParams3D extends SolverParams {
    /** Warm-start unmatched contacts from the pair's nearest previous contact (2D findings). */
    matchNearest: boolean;
    /** Box2D-style face-over-edge preference in the narrowphase (see wgsl-collision.ts). */
    faceBias: boolean;
    /** Keep contact points of pairs whose bodies have not moved (skips their narrowphase). */
    reuseContacts: boolean;
    /**
     * Bodies slower than REST_SPEED start each step's iterations from the step-start pose x-
     * instead of the demo's guess x- + v·dt + w·g·dt² (VBD's adaptive warm start). At 4
     * iterations that guess pumps tall brick walls until they buckle (docs/FINDINGS.md, Stage 8m).
     */
    startAtRest: boolean;
    /**
     * A contact's normal penalty starts at the lighter dynamic body's m/dt² rather than the
     * demo's PENALTY_MIN, so a heavy body meets a stiff contact at once instead of sinking
     * through the floor while the penalty ramps (wgsl-collision.ts contactPenaltyMin).
     */
    massPenalty: boolean;
    /** Wind (m/s) blowing towards `windAngle` (rad from +x, about z), felt by sails only
     * (../shapes.ts), with gusts of `windGust` of its speed. */
    windSpeed: number;
    windAngle: number;
    windGust: number;
    /** ½ρC_d of the air (kg/m³): 0.72 is air on a flat plate. */
    windPressure: number;
    /**
     * Which way is up (a unit vector): gravity (`gravity`, negative) pulls the other way. y, as
     * in Three.js; a solver seeded from the reference (../ref, z-up like the paper's demo) takes
     * z, and its scenes are built that way.
     */
    up: [number, number, number];
}
/** The reference solver's up (z, like the paper's demo): scenes built from it are z-up. */
export declare const REF_UP: [number, number, number];
export declare const gpuParams3D: () => GpuParams3D;
export interface GpuSolverOptions {
    /** Pre-allocated body buffer (STORAGE | COPY_SRC | COPY_DST), e.g. one Three.js renders from. */
    bodyBuffer?: GPUBuffer;
    /** Bodies the buffers can hold (default: current count + 1024); a supplied buffer's size wins. */
    bodyCapacity?: number;
    /** Jones-Plassmann rounds per step (even). */
    colorRounds?: number;
    /**
     * Store bodies in Morton (Z-curve) order of their starting positions rather than the scene
     * builder's order, so neighbours sit near each other in memory: 11-14% faster steps on a
     * settled pile (docs/FINDINGS.md). Default true; `gpuIndex` maps reference indices.
     */
    spatialSort?: boolean;
    /**
     * Least contact storage and colours to allocate. A run is deterministic (the same bits every
     * time on a device) only if it never overflows: which records an overflow drops depends on
     * thread timing. A deterministic run sizes these for its worst case and never calls adapt,
     * whose growth follows readbacks that land at different steps from run to run.
     */
    capacity?: {
        contacts?: number;
        pairs?: number;
        manifolds?: number;
        colors?: number;
        joints?: number;
    };
    /** A/B timing of kernel variants: replacement WGSL for a module. */
    shaders?: {
        contacts?: string;
        solve?: string;
    };
    /** Collide hull shapes as hulls (default: when the device can bind nine storage buffers per stage; see GpuSolver3D.hulls). */
    hulls?: boolean;
}
/** Per-body static data the host needs: broadphase radius and whether the body moves. */
interface BodyInfo {
    radius: number;
    dynamic: boolean;
    sphere: boolean;
    size: [number, number, number];
    /** The hull it collides as (../shapes.ts hull), when hulls are on. */
    hull?: HullShape;
}
export declare class GpuSolver3D {
    readonly device: GPUDevice;
    readonly params: GpuParams3D;
    bodyCount: number;
    readonly bodyCapacity: number;
    readonly bodies: BodyInfo[];
    /**
     * Hull shapes collide as hulls (./wgsl-hull.ts). The contacts module then binds a ninth storage
     * buffer, over WebGPU's default of eight per stage: on by default where the device allows it
     * (request maxStorageBuffersPerShaderStage >= 9), else hulls collide as their bounding boxes.
     */
    readonly hulls: boolean;
    private hullBuffer;
    /** The hull buffer (layout in ./wgsl-hull.ts), for passes of your own: it's replaced as it grows. */
    get hullStorage(): GPUBuffer;
    private hullCapacity;
    private hullTop;
    private readonly hullSlots;
    private contactShaders;
    private hullShaders;
    /** Freed hull records (offset, size in vec4s), reused first-fit. */
    private hullFree;
    /** GPU slot of each of the reference's bodies (identity unless spatially sorted). */
    readonly refToGpu: Int32Array;
    jointCount: number;
    private jointCapacity;
    /** Per joint slot: type, bodyA (-1 = world), bodyB, 0. */
    private info;
    /** IgnoreCollision pairs as [hi, lo]. */
    /** Broadphase pairs the pair list holds. */
    pairCapacity: number;
    /** Contact pairs (manifolds): one per broadphase pair that touches. */
    manifoldCapacity: number;
    contactCapacity: number;
    /** Colours the colouring may use and the solver dispatches (grows via `adapt`). */
    colorCap: number;
    /**
     * Validation: when set, bodies take these colours (primal passes run in colour order) and
     * the colouring kernels are skipped. See `sequentialColors`.
     */
    fixedColors: Uint32Array<ArrayBuffer> | null;
    /**
     * Threads per body in each colour's primal, by the colour's size (PRIMAL_LANES_WGSL): one
     * from primalLanes[0] bodies up, two from [1], four from [2], else eight (rounded to powers
     * of two). More lanes shorten a body's serial chain of dependent loads, which is what
     * bounds a small colour; a big colour fills the GPU anyway and pays for the reduction.
     */
    primalLanes: [number, number, number];
    /** Encode each phase as its own compute pass even when not profiling. */
    splitPasses: boolean;
    private shrinkVotes;
    /** Jones-Plassmann rounds per step (even); adapted to the clash count by `adapt`. */
    colorRounds: number;
    private get colorHistOffset();
    readonly bodyBuffer: GPUBuffer;
    private readonly ownsBodyBuffer;
    private jointBuffer;
    private infoBuffer;
    private contactBuffers;
    private manifoldBuffers;
    private pairBuffer;
    private tableBuffer;
    private readonly gridBuffer;
    private staticBuffer;
    /** Per body: collision groups and the groups it collides with (setFilters). */
    private readonly filterBuffer;
    /** The collision filters, for passes of your own (two u32 per body: groups, collides with). */
    get filterStorage(): GPUBuffer;
    private readonly counterBuffer;
    /**
     * The pair records and contact points the last step wrote, and the counters (C_MANIFOLDS: how
     * many pairs), for passes of your own between steps: replaced as they grow, and swapped each step.
     */
    get contactStorage(): {
        manifolds: GPUBuffer;
        contacts: GPUBuffer;
        counters: GPUBuffer;
    };
    private readonly argsBuffer;
    private adjBuffer;
    private readonly colorBuffer;
    private readonly paramsBuffer;
    /** Per-body reference poses for contact reuse (refsWGSL): 2 vec4 each. */
    private readonly refBuffer;
    /** Steps taken (the reuse bookkeeping's clock; starts at 1). */
    private stepCount;
    private passBuffer;
    private passEntries;
    private readonly paramData;
    private readonly paramF32;
    private readonly paramU32;
    private passData;
    private passU32;
    private passF32;
    /** The pass-constant bind group's one dynamic offset */
    private readonly passOffset;
    /** Which contact buffer this step writes (the other holds last step's contacts). */
    private parity;
    private readonly tableSize;
    private hashSize;
    private cellSize;
    private maxSmallRadius;
    private largeCount;
    private noCollideCount;
    /**
     * The static tables are rebuilt lazily: the body-size classes when a radius changed (never
     * when a body is rewritten at its old size, as a voxel destruction demo's are, many times a
     * second), the no-collide list when joints came or went (merged into the kept sorted list, not
     * rebuilt from every joint). Both used to be rebuilt from scratch at every body write: a sort
     * of 80k radii and of every joint ever made, 11 ms, each time such a demo froze its debris.
     */
    private radiiDirty;
    private noCollideDirty;
    private large;
    /** No-collide entries (hi, lo, joint slot or 0xffffffff for IgnoreCollision), sorted by (hi, lo). */
    private entries;
    private pendingEntries;
    private releasedSlots;
    /** Joint slots released (releaseJoints), for appendJoints to fill before growing. */
    private freeSlots;
    private readonly layouts;
    private readonly pipes;
    private groups;
    private passGroup;
    private readonly gridScan;
    private readonly colorHistScan;
    private readonly colorGroups;
    private adjScan;
    private readonly timing;
    private timingCallback;
    private timingBusy;
    private destroyed;
    constructor(device: GPUDevice, ref: Solver, options?: GpuSolverOptions);
    /** GPU index of the reference solver's body `i` (bodies added later keep their index). */
    gpuIndex(i: number): number;
    private createLayouts;
    private createPipelines;
    private allocateJoints;
    /**
     * (Re)allocate pair, manifold and contact storage. When growing, the ping-pong buffers are
     * copied over and the counters are left alone, so warm starts survive the reallocation.
     */
    private allocateContacts;
    /** Adjacency storage and every bind group (they reference reallocated buffers). */
    private rebuildBindings;
    /** Pack reference bodies into GPU records and upload them in one write, starting at `first`. */
    private writeBodies;
    /**
     * Rewrite bodies as fixed boxes of `size` (friction `friction`) at `positions` (xyz each),
     * turned by `rotations` (quaternion xyzw each; none: unturned), at rest: one layout copied
     * and moved, no Rigid each. A voxel destruction demo parks or lays down tens of thousands of
     * voxels at once (a tower's storeys falling); building a Rigid for each took 80 ms.
     */
    rewriteFixed(indices: ArrayLike<number>, positions: ArrayLike<number>, size: ArrayLike<number>, friction: number, rotations?: ArrayLike<number>): void;
    /**
     * A body's floats into `f` at `o`; returns what the CPU keeps of it. `old`: the hull the slot
     * collided as before (released if the body no longer uses it).
     */
    private pack;
    /** Upload a joint or spring (with its warm-start state) into `slot`. */
    private writeJoint;
    /** Bodies a and b (a joint's, slot `slot`) no longer collide, from the next step. */
    private noCollide;
    /** Broadphase configuration (cell size, large bodies) and the sorted no-collide list. */
    private uploadStatics;
    /**
     * Validation hook: make the GPU state equal to the reference solver's mid-simulation, bodies,
     * joints (with warm-start state) and contacts (as the next step's warm-start source), so the
     * next GPU step can be diffed against the next reference step. The reference must be the one
     * this solver was built from, with no bodies or joints added since.
     */
    seedFrom(ref: Solver): void;
    /**
     * Colours reproducing the reference's Gauss-Seidel order (newest dynamic body first, one
     * body per colour). Only for scenes with at most MAX_COLORS dynamic bodies.
     */
    sequentialColors(): Uint32Array<ArrayBuffer>;
    /** A hull's header offset in the hull buffer, uploading it on first use. */
    private acquireHull;
    private releaseHull;
    private growHulls;
    /** Append a body (refused beyond the capacity). Returns its index or -1. */
    addBody(body: Rigid): number;
    /**
     * Append bodies (as many as fit), returning the first one's index (-1 if none fit). One
     * call for a batch: each call rebuilds the adjacency scan.
     */
    addBodies(bodies: Rigid[]): number;
    /** Append a joint between body indices (a = -1: world point rA) with fresh state. */
    appendJoint(a: number, b: number, rA: ArrayLike<number>, rB: ArrayLike<number>, stiffnessLin: number, stiffnessAng: number): number;
    /**
     * Append joints between body pairs in one upload (appendJoint one at a time is a write per
     * joint): each holds `rA` on its first body to `rB` on its second, rigidly (or with `angular`
     * 0, as a ball joint: free to turn), until the angular force it carries passes `fracture`
     * (with `linear`, or the linear force: not in the paper, which breaks joints on torque alone).
     * Returns their slots.
     */
    appendJoints(joints: {
        a: number;
        b: number;
        rA: ArrayLike<number>;
        rB: ArrayLike<number>;
        angular?: number;
    }[], fracture: number, linear?: boolean): number[];
    /**
     * Append springs between body pairs in one upload: each pulls `rA` on its first body towards
     * `rB` on its second with `stiffness` (N/m), about `rest` metres apart. Returns their slots.
     */
    appendSprings(springs: {
        a: number;
        b: number;
        rA: ArrayLike<number>;
        rB: ArrayLike<number>;
        stiffness: number;
        rest: number;
    }[]): number[];
    /**
     * `n` constraints into slots (released ones first, lowest first, the rest appended), each
     * record filled by `fill` (it returns the type and the two bodies), uploaded in a write per
     * run of slots.
     */
    private appendConstraints;
    /**
     * Take joints out of the solver: their slots switched off (as disableConstraint), their
     * bodies colliding again, the slots reused by later appendJoints. Slots already released
     * are ignored.
     */
    releaseJoints(slots: ArrayLike<number>): void;
    /**
     * Replace bodies `indices[k]` with `bodies[k]`, their state starting afresh: a fixed body let
     * loose, or one taken out of play. Runs of consecutive indices go up in one write each.
     */
    rewriteBodies(indices: ArrayLike<number>, bodies: Rigid[]): void;
    /**
     * Collision groups: body `indices[k]` belongs to the groups set in `groups[k]` (a bitmask) and
     * collides with the bodies of `collidesWith[k]`. A pair collides when each is in a group the
     * other collides with. By default every body is in every group and collides with all.
     */
    setFilters(indices: ArrayLike<number>, groups: ArrayLike<number>, collidesWith: ArrayLike<number>): void;
    /** Move the world anchor of a world joint (the mouse drag). */
    setWorldAnchor(slot: number, p: ArrayLike<number>): void;
    /** Stop a joint acting: zero its penalties, stiffness and lambdas (keeps fracture/torque arm). */
    disableConstraint(slot: number): void;
    /** Time the next step's phases on the GPU (timestamp queries), if supported and not busy. */
    profileNextStep(callback: (profile: StepProfile) => void): void;
    private writeParams;
    /** Pass constants: per iteration, one entry per colour (primal), then one for the dual. */
    private writePassConstants;
    /** Bind pass-constant entry `entry` (group 1 at a dynamic offset). */
    private setPass;
    private run;
    private runIndirect;
    step(): void;
    readBodies(): Promise<Float32Array>;
    readJoints(): Promise<Float32Array>;
    readCounters(): Promise<GpuCounters3D>;
    /** Contact points written by the last step, with their pair's bodies and normal. */
    readContactList(): Promise<GpuContact[]>;
    /** Pairs found by the last step's broadphase (bodyA > bodyB), unordered. */
    readPairs(): Promise<Uint32Array>;
    /** Joint slot types and endpoints (type, bodyA, bodyB, 0 per slot). */
    jointInfo(): Int32Array;
    /** Bodies per colour below which two threads per body pay off (measured, docs/FINDINGS.md). */
    /** Adapt the colour cap and pair/contact capacity to a recent counters readback. */
    adapt(counters: GpuCounters3D): void;
    private capacityCanGrow;
    private read;
    /** The step timing's query set and buffers. */
    private releaseTiming;
    destroy(): void;
}
//# sourceMappingURL=solver.d.ts.map