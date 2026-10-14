export declare const BEGIN = 1;
export declare const END = 2;
/** One event as read back: begin or end, the bodies' slots, and for a begin where and how hard. */
export interface RawContactEvent {
    kind: typeof BEGIN | typeof END;
    a: number;
    b: number;
    step: number;
    point: [number, number, number];
    normal: [number, number, number];
    impulse: number;
}
export declare class ContactWatch {
    private readonly device;
    private readonly pipelines;
    private readonly layout;
    /** Per body: reports its contacts (1) or not. */
    private readonly watch;
    private readonly table;
    private readonly events;
    private readonly params;
    /** Slots per set (a power of two). */
    private readonly setSlots;
    readonly capacity: number;
    private group;
    private bound;
    /** Which set is this step's. */
    private flip;
    private readonly bodies;
    constructor(device: GPUDevice, bodies: GPUBuffer, maxBodies: number, pairs: number, capacity: number);
    /** Which bodies report their contacts. */
    setWatched(indices: number[], on: boolean[]): void;
    /** After a step: its pairs against the last step's. */
    run(storage: {
        manifolds: GPUBuffer;
        contacts: GPUBuffer;
        counters: GPUBuffer;
    }, pairs: number, step: number, dt: number): void;
    /** The events since the last read (and how many didn't fit), clearing them. */
    read(): Promise<{
        events: RawContactEvent[];
        dropped: number;
        full: boolean;
    }>;
    destroy(): void;
}
//# sourceMappingURL=contacts.d.ts.map