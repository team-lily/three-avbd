/** One body's pushes for a step: linear impulse, the off-centre part, and the moment. */
export interface Pushes {
    lin: [number, number, number];
    offLin: [number, number, number];
    moment: [number, number, number];
}
export declare const noPush: () => Pushes;
/** Add impulse `j` at world point `at` (none: at the centre of mass) to `p`. */
export declare function addImpulse(p: Pushes, j: ArrayLike<number>, at?: ArrayLike<number>): void;
export declare class Pusher {
    private readonly device;
    private readonly bodies;
    private readonly pipeline;
    private readonly count;
    private buffer;
    private group;
    private capacity;
    constructor(device: GPUDevice, bodies: GPUBuffer);
    /** Apply these pushes (body index → pushes) to the bodies, now (before the next step). */
    apply(pushes: Map<number, Pushes>): void;
    destroy(): void;
}
//# sourceMappingURL=push.d.ts.map