/**
 * Adjacency and colouring kernels over a prelude defining Params, Body and Joint, plus
 * accessors defining TopoItem (the per-step constraint record after the joints: a contact in
 * 2D, a contact pair in 3D; ids.xy = bodies), topoCount(), topoSecondary(u32) (what tells
 * one pair's records apart), dynamicBody(i32) and jointActive(u32).
 */
export declare const makeTopologyWGSL: (prelude: string, accessors: string) => string;
export declare const topologyWGSL: string;
//# sourceMappingURL=wgsl-topology.d.ts.map