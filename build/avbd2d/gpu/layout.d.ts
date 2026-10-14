export declare const WORKGROUP_SIZE = 64;
/** Bodies per workgroup in the colour bucketing kernels (one histogram per workgroup). */
export declare const COLOR_WG = 256;
export declare const BIG = 3e+38;
/** Floats per body: pose (x, y, angle, friction), initial, inertial, vel, prevVel, shape. */
export declare const BODY_FLOATS = 24;
/** Floats per joint record (joints, springs, motors): 9 vec4. */
export declare const JOINT_FLOATS = 36;
export declare const J_PEN = 0;
export declare const J_LAM = 4;
export declare const J_STIFF = 8;
export declare const J_FMIN = 12;
export declare const J_FMAX = 16;
export declare const J_FRAC = 20;
export declare const J_C0 = 24;
export declare const J_ANCHORS = 28;
export declare const J_PARAM = 32;
/** 32-bit words per contact record: 5 vec4. */
export declare const CONTACT_WORDS = 20;
export declare const K_IDS = 0;
export declare const K_PL = 4;
export declare const K_ANCHORS = 8;
export declare const K_GEO = 12;
export declare const K_MISC = 16;
export declare const FLAG_VBD = 1;
export declare const FLAG_RESCALE = 2;
export declare const FLAG_POST_STABILIZE = 4;
export declare const FLAG_MATCH_NEAREST = 8;
/** matchNearest tolerance, as a fraction of the smaller box's smallest side (as on the CPU). */
export declare const NEAREST_FRACTION = 0.05;
export declare const MAX_COLORS = 64;
export declare const NO_COLOR = 255;
export declare const C_PAIRS = 0;
export declare const C_CONTACTS = 1;
export declare const C_PREV_CONTACTS = 2;
export declare const C_OVERFLOW = 3;
export declare const C_CLASHES = 4;
export declare const C_NUM_COLORS = 5;
export declare const COUNTER_WORDS = 16;
export declare const IA_PAIRS = 0;
export declare const IA_CONTACTS = 3;
export declare const IA_PREV = 6;
export declare const IA_CONSTRAINTS = 9;
export declare const IA_COLOR = 12;
export declare const ARGS_WORDS: number;
/** Words in the Params uniform (see the struct in PRELUDE). */
export declare const PARAM_WORDS = 32;
/** Bytes per per-dispatch uniform entry (dynamic offset alignment). */
export declare const PASS_STRIDE = 256;
/**
 * WGSL shared by the 2D and 3D pipelines: counters, indirect-argument slots, colouring and
 * hashing constants. Each dimension's prelude starts with it and adds its own structs.
 */
/** Constraint slot types (the joint info's first word): none (released or unused), a joint, a spring. */
export declare const T_NONE = 0;
export declare const CORE_WGSL = "\nconst T_NONE = 0;\n\nconst MAX_COLORS = 64u;\nconst NO_COLOR = 255u;\nconst PENDING = 256u;\n\nconst C_PAIRS = 0u;\nconst C_CONTACTS = 1u;\nconst C_PREV_CONTACTS = 2u;\nconst C_OVERFLOW = 3u;\nconst C_CLASHES = 4u;\nconst C_NUM_COLORS = 5u;\n\nconst IA_PAIRS = 0u;\nconst IA_CONTACTS = 3u;\nconst IA_PREV = 6u;\nconst IA_CONSTRAINTS = 9u;\nconst IA_COLOR = 12u;\n\nconst WG = 64u;\nconst COLOR_WG = 256u;\n\nconst BIG = 3e38;\nconst HARD = 1e30;\n\nfn groupsFor(n: u32) -> u32 {\n  return (n + WG - 1u) / WG;\n}\n\n/** lowbias32 integer hash (same as the CPU colouring priorities). */\nfn hash32(v: u32) -> u32 {\n  var x = v;\n  x ^= x >> 16u;\n  x *= 0x7feb352du;\n  x ^= x >> 15u;\n  x *= 0x846ca68bu;\n  x ^= x >> 16u;\n  return x;\n}\n";
export declare const PRELUDE = "\n// Shared by every 2D module (layout.ts)\n\nconst T_NONE = 0;\n\nconst MAX_COLORS = 64u;\nconst NO_COLOR = 255u;\nconst PENDING = 256u;\n\nconst C_PAIRS = 0u;\nconst C_CONTACTS = 1u;\nconst C_PREV_CONTACTS = 2u;\nconst C_OVERFLOW = 3u;\nconst C_CLASHES = 4u;\nconst C_NUM_COLORS = 5u;\n\nconst IA_PAIRS = 0u;\nconst IA_CONTACTS = 3u;\nconst IA_PREV = 6u;\nconst IA_CONSTRAINTS = 9u;\nconst IA_COLOR = 12u;\n\nconst WG = 64u;\nconst COLOR_WG = 256u;\n\nconst BIG = 3e38;\nconst HARD = 1e30;\n\nfn groupsFor(n: u32) -> u32 {\n  return (n + WG - 1u) / WG;\n}\n\n/** lowbias32 integer hash (same as the CPU colouring priorities). */\nfn hash32(v: u32) -> u32 {\n  var x = v;\n  x ^= x >> 16u;\n  x *= 0x7feb352du;\n  x ^= x >> 15u;\n  x *= 0x846ca68bu;\n  x ^= x >> 16u;\n  return x;\n}\n\nconst T_JOINT = 1;\nconst T_SPRING = 2;\nconst T_MOTOR = 3;\n\nconst PENALTY_MIN = 1.0;\nconst PENALTY_MAX = 1e9;\nconst STICK_THRESH = 0.01;\nconst COLLISION_MARGIN = 0.0005;\n\nconst FLAG_VBD = 1u;\nconst FLAG_RESCALE = 2u;\nconst FLAG_POST_STABILIZE = 4u;\nconst FLAG_MATCH_NEAREST = 8u;\nconst NEAREST_FRACTION = 0.05;\n\nstruct Body {\n  pose: vec4f,      // x, y, angle, friction\n  initial: vec4f,   // pose at the start of the step (x-)\n  inertial: vec4f,  // inertial target y\n  vel: vec4f,\n  prevVel: vec4f,\n  shape: vec4f,     // width, height, mass, moment\n}\n\nstruct Joint {\n  pen: vec4f,       // per-row penalty (stiffness parameter k)\n  lam: vec4f,       // per-row dual variable\n  stiff: vec4f,     // per-row material stiffness (>= HARD: hard constraint)\n  fmin: vec4f,\n  fmax: vec4f,\n  frac: vec4f,      // per-row fracture threshold on |lambda|\n  c0: vec4f,        // C(x-)\n  anchors: vec4f,   // rA.xy (world point for world joints), rB.xy\n  param: vec4f,     // joint: restAngle, torqueArm; spring: rest; motor: speed\n}\n\nstruct Contact {\n  ids: vec4u,       // bodyA, bodyB (A > B), feature key, stick flag\n  pl: vec4f,        // penalty normal/tangent, lambda normal/tangent\n  anchors: vec4f,   // rA.xy, rB.xy in body-local space\n  geo: vec4f,       // C0 normal, C0 tangent, normal.xy (B to A)\n  misc: vec4f,      // friction\n}\n\nstruct Params {\n  dt: f32,\n  gravity: f32,\n  beta: f32,\n  gamma: f32,\n  alpha: f32,\n  vbdStiffness: f32,\n  flags: u32,\n  bodyCount: u32,\n  jointCount: u32,\n  colorCap: u32,\n  cellSize: f32,\n  tableMask: u32,\n  maxSmallRadius: f32,\n  largeCount: u32,\n  noCollideCount: u32,\n  pairCapacity: u32,\n  contactCapacity: u32,\n  hashMask: u32,\n  adjFillOffset: u32,\n  adjListOffset: u32,\n  gridCursorOffset: u32,\n  gridSortedOffset: u32,\n  gridCellOffset: u32,\n  stateBOffset: u32,\n  colorHistOffset: u32,   // per (colour, workgroup) body counts, scanned into slot offsets\n  colorStartOffset: u32,\n  colorGroups: u32,       // workgroups of COLOR_WG bodies covering the body capacity\n  colorBodiesOffset: u32,\n  rounds: u32,\n  pad0: u32,\n  pad1: u32,\n  pad2: u32,\n}\n\n/**\n * (cos x, sin x) to ~1e-7. WGSL promises the built-ins only to 2^-11 absolute and GPUs differ:\n * on an M1 Pro, stiff springs (Spring Ratio) drifted 9 cm from the CPU in 60 steps and a\n * single friction step missed by 1.2e-4, where the M4 Max tracked to 1.6e-4 and 4e-6; rounding\n * the built-ins to 2^-13 on the M4 reproduced it. Cody-Waite reduction by pi/2 (three-part\n * constant) and the Cephes single-precision polynomials on [-pi/4, pi/4].\n */\nfn cosSin(x: f32) -> vec2f {\n  let q = floor(x * 0.63661977236 + 0.5);\n  // fma keeps the three parts apart: written as subtractions, fast math folded them back into\n  // one rounded pi/2 and the error grew with the angle (2.8e-6 at 100 rad)\n  let r = fma(-q, 7.549789954891882e-8, fma(-q, 4.837512969970703e-4, fma(-q, 1.5703125, x)));\n  let z = r * r;\n  let s = r + r * z * (-1.6666654611e-1 + z * (8.3321608736e-3 + z * -1.9515295891e-4));\n  let c = 1.0 - 0.5 * z + z * z * (4.1666645683e-2 + z * (-1.3887316255e-3 + z * 2.4433157468e-5));\n  switch (u32(i32(q)) & 3u) {\n    case 0u: { return vec2f(c, s); }\n    case 1u: { return vec2f(-s, c); }\n    case 2u: { return vec2f(-c, -s); }\n    default: { return vec2f(s, -c); }\n  }\n}\n\nfn rot(angle: f32, v: vec2f) -> vec2f {\n  let cs = cosSin(angle);\n  return vec2f(cs.x * v.x - cs.y * v.y, cs.y * v.x + cs.x * v.y);\n}\n\n";
/**
 * Writes the indirect dispatch arguments from the counters and colour counts. Works with
 * either dimension's prelude (it only reads the shared Params fields). The per-step
 * constraint records after the joints (IA_CONTACTS, and with the joints IA_CONSTRAINTS) and
 * last step's records (IA_PREV) are contacts by default; 3D passes its contact pairs.
 */
export declare const makeArgsWGSL: (prelude: string, items?: {
    counter: string;
    prevCounter: string;
    capacity: string;
    /** WGSL defining fn colorThreads(bodies: u32) -> u32, when a colour's primal runs several threads per body. */
    colorThreads?: string;
}) => string;
export declare const argsWGSL: string;
/** The step's phases, each encoded as its own compute pass (so each can be timestamped). */
export declare const PHASES: readonly ["collision", "adjacency", "coloring", "solve"];
export type Phase = (typeof PHASES)[number];
/** GPU milliseconds per phase, and from the first phase's start to the last one's end. */
export type StepProfile = Record<Phase, number> & {
    total: number;
};
export interface GpuCounters {
    pairs: number;
    contacts: number;
    overflow: number;
    clashes: number;
    colors: number;
}
//# sourceMappingURL=layout.d.ts.map