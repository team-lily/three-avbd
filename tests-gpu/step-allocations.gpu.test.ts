// A solver step re-uses its upload buffers and dynamic offsets instead of allocating them, and
// still encodes exactly what it did before: the same writes (bytes and lengths), the same
// pipelines, bind groups, dynamic offsets and dispatches, in the same order. The queue and
// compute-pass methods are wrapped for the duration of a test and record every call.
//
// TRACE_* are the trace digests of the 0.2.2 solvers (commit 5b38b1e), from before the reuse.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PASS_STRIDE } from '../src/avbd2d/gpu/layout.ts';
import { GpuSolver2D } from '../src/avbd2d/gpu/solver.ts';
import { parallelParams, Solver as Solver2D } from '../src/avbd2d/ref/solver.ts';
import { sceneByName as sceneByName2D } from '../src/avbd2d/sim.ts';
import { SoaSolver2D } from '../src/avbd2d/soa/solver.ts';
import { GpuSolver3D } from '../src/avbd3d/gpu/solver.ts';
import { sceneByName } from '../src/avbd3d/ref/scenes.ts';
import { Solver } from '../src/avbd3d/ref/solver.ts';
import { gpuTest } from './device.ts';

const TRACE_3D = 'aa9c77a161637c319ed5a50e23f08ad44c23ecfcb67d242af08028e6764e4417';
const TRACE_2D = 'a97496892d4c264083ad0080b4f101f43302e4e2f43815addb20363452c25a7c';

interface Write {
  label: string;
  offset: number;
  bytes: Uint8Array;
  /** The memory the data argument views, to tell a reused upload buffer from a new one */
  source: ArrayBufferLike;
}

interface StepLog {
  writes: Write[];
  /** setBindGroup(1, ...): the dynamic offsets and the argument that carried them */
  passOffsets: number[];
  offsetArgs: unknown[];
  trace: string[];
}

/** Record the queue writes and compute-pass calls made by each `step()`. */
function record(steps: number, step: (k: number) => void): StepLog[] {
  const Q = GPUQueue.prototype;
  const P = GPUComputePassEncoder.prototype;
  const E = GPUCommandEncoder.prototype;
  const saved = { writeBuffer: Q.writeBuffer, setPipeline: P.setPipeline, setBindGroup: P.setBindGroup, dispatchWorkgroups: P.dispatchWorkgroups, dispatchWorkgroupsIndirect: P.dispatchWorkgroupsIndirect, end: P.end, beginComputePass: E.beginComputePass };
  const ids = new Map<object, number>();
  const id = (o: object) => ids.get(o) ?? (ids.set(o, ids.size), ids.size - 1);
  let log!: StepLog;
  Q.writeBuffer = function (this: GPUQueue, buffer: GPUBuffer, offset: number, data: BufferSource, dataOffset?: number, size?: number) {
    const unit = ArrayBuffer.isView(data) && !(data instanceof DataView) ? (data as Uint8Array).BYTES_PER_ELEMENT : 1;
    const base = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
    const start = (dataOffset ?? 0) * unit;
    const bytes = base.slice(start, size === undefined ? undefined : start + size * unit);
    log.writes.push({ label: buffer.label, offset, bytes, source: ArrayBuffer.isView(data) ? data.buffer : data });
    log.trace.push(`write ${buffer.label} @${offset} ${createHash('sha256').update(bytes).digest('hex')}`);
    return saved.writeBuffer.apply(this, [buffer, offset, data, dataOffset, size] as Parameters<GPUQueue['writeBuffer']>);
  } as GPUQueue['writeBuffer'];
  E.beginComputePass = function (this: GPUCommandEncoder, descriptor?: GPUComputePassDescriptor) {
    log.trace.push(`begin ${descriptor?.label} ${descriptor?.timestampWrites ? 'timed' : ''}`);
    return saved.beginComputePass.call(this, descriptor);
  };
  P.setPipeline = function (this: GPUComputePassEncoder, pipeline: GPUComputePipeline) {
    log.trace.push(`pipeline ${pipeline.label}`);
    return saved.setPipeline.call(this, pipeline);
  };
  P.setBindGroup = function (this: GPUComputePassEncoder, index: number, group: GPUBindGroup | null, offsets?: Iterable<number> | Uint32Array, start?: number, length?: number) {
    const list = offsets === undefined ? [] : offsets instanceof Uint32Array ? [...offsets.subarray(start ?? 0, (start ?? 0) + (length ?? offsets.length - (start ?? 0)))] : [...offsets];
    if (index === 1) {
      log.passOffsets.push(...list);
      log.offsetArgs.push(offsets);
    }
    log.trace.push(`group ${index} #${group ? id(group) : -1} [${list}]`);
    return (saved.setBindGroup as (...a: unknown[]) => void).apply(this, [...arguments]);
  } as GPUComputePassEncoder['setBindGroup'];
  P.dispatchWorkgroups = function (this: GPUComputePassEncoder, x: number, y?: number, z?: number) {
    log.trace.push(`dispatch ${x} ${y ?? 1} ${z ?? 1}`);
    return saved.dispatchWorkgroups.call(this, x, y, z);
  };
  P.dispatchWorkgroupsIndirect = function (this: GPUComputePassEncoder, buffer: GPUBuffer, offset: number) {
    log.trace.push(`indirect ${buffer.label} @${offset}`);
    return saved.dispatchWorkgroupsIndirect.call(this, buffer, offset);
  };
  P.end = function (this: GPUComputePassEncoder) {
    log.trace.push('end');
    return saved.end.call(this);
  };
  const logs: StepLog[] = [];
  try {
    for (let k = 0; k < steps; k++) {
      log = { writes: [], passOffsets: [], offsetArgs: [], trace: [] };
      step(k);
      logs.push(log);
    }
  } finally {
    Object.assign(Q, { writeBuffer: saved.writeBuffer });
    Object.assign(P, { setPipeline: saved.setPipeline, setBindGroup: saved.setBindGroup, dispatchWorkgroups: saved.dispatchWorkgroups, dispatchWorkgroupsIndirect: saved.dispatchWorkgroupsIndirect, end: saved.end });
    Object.assign(E, { beginComputePass: saved.beginComputePass });
  }
  return logs;
}

const digest = (logs: StepLog[]) => createHash('sha256').update(logs.map((l) => l.trace.join('\n')).join('\n--\n')).digest('hex');

/** The pass constants as the 0.2.2 solvers wrote them: (colour, alpha) at each entry's start, zero elsewhere. */
function expectedPassBytes(entries: number, filled: number, perIteration: number, alphaFor: (it: number) => number): Uint8Array {
  const data = new ArrayBuffer(entries * PASS_STRIDE);
  const u32 = new Uint32Array(data);
  const f32 = new Float32Array(data);
  for (let e = 0; e < filled; e++) {
    u32[(e * PASS_STRIDE) / 4] = e % perIteration;
    f32[(e * PASS_STRIDE) / 4 + 1] = alphaFor(Math.floor(e / perIteration));
  }
  return new Uint8Array(data);
}

/** Checks each step's one pass-constant upload, and that every params upload re-uses one buffer. */
function checkUploads(logs: StepLog[], expected: (k: number) => Uint8Array, paramsLabel: string): void {
  const paramSources = new Set<ArrayBufferLike>();
  logs.forEach((log, k) => {
    const pass = log.writes.filter((w) => w.label === 'pass constants');
    assert.equal(pass.length, 1, `step ${k}: one pass-constant upload`);
    assert.equal(pass[0].offset, 0);
    assert.deepEqual(pass[0].bytes, expected(k), `step ${k}: pass-constant bytes`);
    const params = log.writes.filter((w) => w.label === paramsLabel);
    assert.equal(params.length, 1, `step ${k}: one params upload`);
    paramSources.add(params[0].source);
  });
  assert.equal(paramSources.size, 1, 'every step uploads its params from the same memory');
}

gpuTest('3D step: same uploads, offsets and dispatches, from re-used buffers', async (device) => {
  const ref = new Solver();
  sceneByName('Breakable').build(ref);
  const gpu = new GpuSolver3D(device, ref);
  // Shrink, none, then grow past the first size: the upload buffer grows once
  const iterations = [4, 4, 2, 0, 6, 6, 3];
  const logs = record(iterations.length, (k) => {
    gpu.params.iterations = iterations[k];
    gpu.params.alpha = 0.95 - 0.01 * k;
    gpu.step();
  });
  const per = gpu.colorCap + 1;
  checkUploads(logs, (k) => expectedPassBytes(Math.max(iterations[k] * per, 1), iterations[k] * per, per, () => Math.fround(0.95 - 0.01 * k)), 'params 3d');
  const sources = new Set(logs.map((l) => l.writes.find((w) => w.label === 'pass constants')!.source));
  assert.equal(sources.size, 2, 'the pass-constant upload memory is allocated once, and again only to grow');

  logs.forEach((log, k) => {
    const offsets = [0];
    for (let it = 0; it < iterations[k]; it++) for (let col = 0; col <= gpu.colorCap; col++) offsets.push((it * per + col) * PASS_STRIDE);
    assert.deepEqual(log.passOffsets, offsets, `step ${k}: dynamic offsets`);
  });
  const args = new Set(logs.flatMap((l) => l.offsetArgs));
  assert.equal(args.size, 1, 'every dynamic offset is passed in the same array');
  assert.equal(digest(logs), TRACE_3D, `3D trace ${digest(logs)}`);
});

gpuTest('2D step: same uploads, offsets and dispatches, from re-used buffers', async (device) => {
  const ref = new Solver2D();
  Object.assign(ref, parallelParams());
  sceneByName2D('Rope').build!(ref);
  const soa = new SoaSolver2D();
  soa.loadFromReference(ref);
  const gpu = new GpuSolver2D(device, soa);
  const runs = [
    { iterations: 4, postStabilize: true, vbd: false },
    { iterations: 4, postStabilize: true, vbd: false },
    { iterations: 2, postStabilize: false, vbd: false },
    { iterations: 3, postStabilize: true, vbd: true },
    { iterations: 6, postStabilize: true, vbd: false },
    { iterations: 6, postStabilize: true, vbd: false },
    { iterations: 1, postStabilize: false, vbd: false },
  ];
  const logs = record(runs.length, (k) => {
    Object.assign(gpu.params, runs[k]);
    gpu.params.alpha = 0.95 - 0.01 * k;
    gpu.step();
  });
  const per = gpu.colorCap + 1;
  const total = (k: number) => runs[k].iterations + (runs[k].postStabilize && !runs[k].vbd ? 1 : 0);
  const alphaFor = (k: number) => (it: number) => {
    const { iterations, postStabilize, vbd } = runs[k];
    if (postStabilize && !vbd) return it < iterations ? 1 : 0;
    return vbd ? 0 : Math.fround(0.95 - 0.01 * k);
  };
  checkUploads(logs, (k) => expectedPassBytes(total(k) * per, total(k) * per, per, alphaFor(k)), 'params');
  const sources = new Set(logs.map((l) => l.writes.find((w) => w.label === 'pass constants')!.source));
  assert.equal(sources.size, 2, 'the pass-constant upload memory is allocated once, and again only to grow');

  logs.forEach((log, k) => {
    const offsets = [0];
    for (let it = 0; it < total(k); it++) {
      for (let col = 0; col < gpu.colorCap; col++) offsets.push((it * per + col) * PASS_STRIDE);
      if (it < runs[k].iterations) offsets.push((it * per + gpu.colorCap) * PASS_STRIDE);
    }
    assert.deepEqual(log.passOffsets, offsets, `step ${k}: dynamic offsets`);
  });
  const args = new Set(logs.flatMap((l) => l.offsetArgs));
  assert.equal(args.size, 1, 'every dynamic offset is passed in the same array');
  assert.equal(digest(logs), TRACE_2D, `2D trace ${digest(logs)}`);
});
