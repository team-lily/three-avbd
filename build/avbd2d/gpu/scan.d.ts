export declare class PrefixScan {
    private readonly levels;
    private readonly buffers;
    private readonly scanPipeline;
    private readonly addPipeline;
    /** Scan data[offset .. offset + n) of `data` (n fixed for this instance). */
    constructor(device: GPUDevice, data: GPUBuffer, offset: number, n: number);
    encode(pass: GPUComputePassEncoder): void;
    destroy(): void;
}
//# sourceMappingURL=scan.d.ts.map