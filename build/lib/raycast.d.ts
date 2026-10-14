/** Bodies a cast can skip (the caster's own body, say). */
export declare const MAX_IGNORED = 16;
/** Rays a call (one dispatch row per ray). */
export declare const MAX_RAYS = 65535;
export interface Ray {
    origin: ArrayLike<number>;
    /** Normalised here. */
    direction: ArrayLike<number>;
    /** Default: as far as it goes. */
    maxDistance?: number;
}
/** A ray's nearest hit: the body's slot, how far along, and the surface normal there (world). */
export interface RawHit {
    index: number;
    distance: number;
    point: [number, number, number];
    normal: [number, number, number];
}
export declare class Raycaster {
    private readonly device;
    private readonly pipelines;
    private readonly layout;
    constructor(device: GPUDevice);
    /** The nearest hit of each ray among bodies 0 to `count`, skipping `ignore` (slots). */
    cast(bodies: GPUBuffer, hulls: GPUBuffer, filters: GPUBuffer, count: number, rays: Ray[], ignore?: number[], mask?: number): Promise<(RawHit | null)[]>;
}
//# sourceMappingURL=raycast.d.ts.map