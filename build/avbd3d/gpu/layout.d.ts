/**
 * Floats per body, 10 vec4. Everything a contact reads comes first (one 64-byte span):
 * pos (xyz, friction), rot (quaternion), initialPos, initialRot; then size (xyz, mass),
 * moment (xyz, bounding radius), inertialPos, inertialRot, vel (xyz, previous vel.z),
 * angVel (xyz, shape: SHAPE_BOX / SHAPE_SPHERE / SHAPE_SAIL). Rendering reads pos, rot, size
 * and shape.
 */
export declare const BODY_FLOATS = 40;
export declare const B_POS = 0;
export declare const B_ROT = 4;
export declare const B_INITIAL_POS = 8;
export declare const B_INITIAL_ROT = 12;
export declare const B_SIZE = 16;
export declare const B_MOMENT = 20;
export declare const B_INERTIAL_POS = 24;
export declare const B_INERTIAL_ROT = 28;
export declare const B_VEL = 32;
export declare const B_ANGVEL = 36;
/** Floats per joint record (joints and springs): 8 vec4. */
export declare const JOINT_FLOATS = 32;
export declare const J_PEN_LIN = 0;
export declare const J_PEN_ANG = 4;
export declare const J_LAM_LIN = 8;
export declare const J_LAM_ANG = 12;
export declare const J_C0_LIN = 16;
export declare const J_C0_ANG = 20;
export declare const J_RA = 24;
export declare const J_RB = 28;
/**
 * Contacts come in pairs' manifolds: a 32-byte pair record (bodies, first contact, contact
 * count, normal, friction) and 64 bytes per contact point, stored consecutively per pair.
 * Loading both bodies and the basis once per pair instead of once per point is most of the
 * solve's memory traffic.
 */
export declare const MANIFOLD_WORDS = 8;
export declare const M_IDS = 0;
export declare const M_GEO = 4;
/** 32-bit words per contact point: 4 vec4, the w's carrying the key and C0. */
export declare const CONTACT_WORDS = 16;
export declare const K_RA = 0;
export declare const K_RB = 4;
export declare const K_PEN = 8;
export declare const K_LAM = 12;
/** Static friction held last step (features use bits 0-25). */
export declare const STICK_BIT = 2147483648;
export declare const C_MANIFOLDS = 6;
export declare const C_PREV_MANIFOLDS = 7;
/**
 * Shape codes in angVel.w (spheres: see ../shapes.ts; radius = size.x / 2). A sail collides
 * as a box and catches the wind on its local z faces.
 */
export declare const SHAPE_BOX = 0;
export declare const SHAPE_SPHERE = 1;
export declare const SHAPE_SAIL = 2;
/** Hulls (../hull.ts): angVel.w = SHAPE_HULL + the hull's header offset in the hull buffer (vec4s). */
export declare const SHAPE_HULL = 3;
export declare const T_JOINT = 1;
export declare const T_SPRING = 2;
export declare const FLAG_MATCH_NEAREST = 1;
/** Prefer face axes over edge axes the way Box2D does (see wgsl-collision.ts collide). */
export declare const FLAG_FACE_BIAS = 2;
/** Reuse a pair's contact points while neither body has moved (wgsl-collision.ts). */
export declare const FLAG_REUSE_CONTACTS = 4;
/** Slow bodies start each step's iterations from the step-start pose (wgsl-solve.ts). */
export declare const FLAG_START_AT_REST = 8;
/** A contact's normal penalty starts at the lighter body's m/dt² (wgsl-collision.ts contactPenaltyMin). */
export declare const FLAG_MASS_PENALTY = 16;
/** Speed (m/s) of a body's fastest point, |v| + |ω|·radius, below which FLAG_START_AT_REST applies. */
export declare const REST_SPEED = 0.1;
/**
 * A body counts as still while within this distance (m) and rotation (rad) of its reference
 * pose; its pairs then keep their contact points instead of re-running the narrowphase.
 */
export declare const REUSE_LIN_TOL = 0.002;
export declare const REUSE_ANG_TOL = 0.002;
/** matchNearest tolerance, as a fraction of the smaller box's smallest side. */
export declare const NEAREST_FRACTION = 0.05;
/** Words in the Params uniform (see the struct in PRELUDE_3D). */
export declare const PARAM_WORDS = 44;
export declare const PRELUDE_3D = "\n// Shared by every 3D module (avbd3d/gpu/layout.ts)\n\nconst T_NONE = 0;\n\nconst MAX_COLORS = 64u;\nconst NO_COLOR = 255u;\nconst PENDING = 256u;\n\nconst C_PAIRS = 0u;\nconst C_CONTACTS = 1u;\nconst C_PREV_CONTACTS = 2u;\nconst C_OVERFLOW = 3u;\nconst C_CLASHES = 4u;\nconst C_NUM_COLORS = 5u;\n\nconst IA_PAIRS = 0u;\nconst IA_CONTACTS = 3u;\nconst IA_PREV = 6u;\nconst IA_CONSTRAINTS = 9u;\nconst IA_COLOR = 12u;\n\nconst WG = 64u;\nconst COLOR_WG = 256u;\n\nconst BIG = 3e38;\nconst HARD = 1e30;\n\nfn groupsFor(n: u32) -> u32 {\n  return (n + WG - 1u) / WG;\n}\n\n/** lowbias32 integer hash (same as the CPU colouring priorities). */\nfn hash32(v: u32) -> u32 {\n  var x = v;\n  x ^= x >> 16u;\n  x *= 0x7feb352du;\n  x ^= x >> 15u;\n  x *= 0x846ca68bu;\n  x ^= x >> 16u;\n  return x;\n}\n\nconst T_JOINT = 1;\nconst T_SPRING = 2;\n\nconst PENALTY_MIN = 1.0;\nconst PENALTY_MAX = 1e10;\n// Least LDL\u1D40 pivot of the primal solve, relative to its diagonal (wgsl-solve.ts finishBody)\nconst PIVOT_FLOOR = 1e-5;\nconst COLLISION_MARGIN = 0.01;\nconst STICK_THRESH = 0.00001;\n\nconst SHAPE_SPHERE = 1.0;\nconst SHAPE_SAIL = 2.0;\nconst SHAPE_HULL = 3.0;\nconst STICK_BIT = 2147483648u;\nconst C_MANIFOLDS = 6u;\nconst C_PREV_MANIFOLDS = 7u;\n/** Feature key of every contact involving a sphere (one contact per pair). */\nconst SPHERE_FEATURE = 3u << 24u;\n\nconst FLAG_MATCH_NEAREST = 1u;\nconst FLAG_FACE_BIAS = 2u;\nconst FLAG_REUSE_CONTACTS = 4u;\nconst FLAG_START_AT_REST = 8u;\nconst FLAG_MASS_PENALTY = 16u;\nconst REST_SPEED = 0.1;\nconst NEAREST_FRACTION = 0.05;\n\nstruct Body {\n  pos: vec4f,          // xyz, w: friction\n  rot: vec4f,          // orientation quaternion (x, y, z, w)\n  initialPos: vec4f,   // pose at the start of the step (x-)\n  initialRot: vec4f,\n  size: vec4f,         // full widths, w: mass (0 = static)\n  moment: vec4f,       // principal moments, w: bounding radius\n  inertialPos: vec4f,  // inertial target y, w: step it last moved from its reference pose (u32)\n  inertialRot: vec4f,\n  vel: vec4f,          // xyz, w: previous step's velocity along up (adaptive warm start)\n  angVel: vec4f,       // xyz, w: shape (SHAPE_BOX, SHAPE_SPHERE, SHAPE_SAIL, or SHAPE_HULL + hull offset)\n}\n\nstruct Joint {\n  penLin: vec4f,  // xyz, w: linear stiffness (>= HARD: hard); spring: its stiffness\n  penAng: vec4f,  // xyz, w: angular stiffness\n  lamLin: vec4f,  // xyz, w: fracture threshold on |lamAng|\n  lamAng: vec4f,  // xyz, w: torque arm\n  c0Lin: vec4f,   // C(x-)\n  c0Ang: vec4f,\n  rA: vec4f,      // xyz: anchor on A (world point when A is the world), w: spring rest length\n  rB: vec4f,      // xyz: anchor on B\n}\n\nstruct Manifold {\n  ids: vec4u,     // bodyA, bodyB (A > B), first contact, count | generation step << 4\n  geo: vec4f,     // normal (B to A), friction\n}\n\nfn pairCount(m: Manifold) -> u32 {\n  return m.ids.w & 15u;\n}\n\nstruct Contact {\n  rA: vec3f,      // body-local anchors\n  key: u32,       // feature | STICK_BIT\n  rB: vec3f,\n  c0x: f32,       // C(x-) in the pair's basis, including the collision margin\n  pen: vec3f,     // normal, tangent, tangent\n  c0y: f32,\n  lam: vec3f,\n  c0z: f32,\n}\n\nstruct Params {\n  dt: f32,\n  gravity: f32,         // acceleration along up (m/s\u00B2, negative: down)\n  betaLin: f32,\n  betaAng: f32,\n  gamma: f32,\n  alpha: f32,\n  flags: u32,\n  bodyCount: u32,\n  jointCount: u32,\n  colorCap: u32,\n  cellSize: f32,\n  tableMask: u32,\n  maxSmallRadius: f32,\n  largeCount: u32,\n  noCollideCount: u32,\n  pairCapacity: u32,\n  contactCapacity: u32,\n  hashMask: u32,\n  adjFillOffset: u32,\n  adjListOffset: u32,\n  gridCursorOffset: u32,\n  gridSortedOffset: u32,\n  gridCellOffset: u32,\n  stateBOffset: u32,\n  colorHistOffset: u32,\n  colorStartOffset: u32,\n  colorGroups: u32,\n  colorBodiesOffset: u32,\n  rounds: u32,\n  manifoldCapacity: u32,\n  step: u32,           // steps since the solver was created (from 1)\n  primalLanes: u32,    // bytes 0-2: log2 of the colour sizes from which 1, 2, 4 lanes per body suffice\n  wind: vec4f,         // xyz: wind velocity (m/s), w: air pressure coefficient \u00BD\u03C1C_d\n  gust: vec4f,         // x: gust strength (fraction of the wind)\n  up: vec4f,           // xyz: which way is up (unit)\n}\n\nfn qmul(a: vec4f, b: vec4f) -> vec4f {\n  return vec4f(\n    a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,\n    a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,\n    a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,\n    a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z);\n}\n\nfn qconj(q: vec4f) -> vec4f {\n  return vec4f(-q.xyz, q.w);\n}\n\n/** The demo's quat - quat: 2\u00B7vec(a\u00B7b\u207B\u00B9), a small-angle rotation vector. */\nfn qsub(a: vec4f, b: vec4f) -> vec3f {\n  return qmul(a, qconj(b) / dot(b, b)).xyz * 2.0;\n}\n\n/** The demo's quat + float3: integrate a rotation vector, normalize(a + (v, 0)\u00B7a\u00B7\u00BD). */\nfn qadd(a: vec4f, v: vec3f) -> vec4f {\n  return normalize(a + qmul(vec4f(v, 0.0), a) * 0.5);\n}\n\nfn qrotate(q: vec4f, v: vec3f) -> vec3f {\n  let t = cross(q.xyz, v) * 2.0;\n  return v + t * q.w + cross(q.xyz, t);\n}\n\n/** Contact basis rows (n, t1, t2), as maths.h orthonormal(). */\nfn orthonormal(n: vec3f) -> mat3x3f {\n  var t1 = select(vec3f(0.0, -n.z, n.y), vec3f(-n.y, n.x, 0.0), abs(n.x) > abs(n.z));\n  t1 = normalize(t1);\n  // Columns of the WGSL matrix are the basis rows\n  return mat3x3f(n, t1, cross(n, t1));\n}\n";
/** 3D record accessors for the shared topology kernels (../../avbd2d/gpu/wgsl-topology.ts). */
export declare const TOPOLOGY_ACCESSORS_3D = "\nalias TopoItem = Manifold;\n\n/** A body pair has one manifold, so the other body alone orders a body's contacts. */\nfn topoSecondary(i: u32) -> u32 {\n  return 0u;\n}\n\nfn topoCount() -> u32 {\n  return min(atomicLoad(&counters[C_MANIFOLDS]), params.manifoldCapacity);\n}\n\nfn dynamicBody(i: i32) -> bool {\n  return i >= 0 && bodies[i].size.w > 0.0;\n}\n\n/** A joint or spring takes part unless disabled (fracture, released drag): stiffness zeroed. */\nfn jointActive(j: u32) -> bool {\n  let k = joints[j];\n  return info[j].x != T_NONE && (k.penLin.w != 0.0 || k.penAng.w != 0.0);\n}\n";
/**
 * Threads per body in one colour's primal (primalLanes): big colours fill the GPU with one
 * thread per body, smaller ones split each body's contacts over 2, 4 or 8 threads, since a
 * small colour's time is the longest chain of dependent loads (the body with most contacts).
 */
export declare const PRIMAL_LANES_WGSL = "\nfn lanesFor(bodies: u32) -> u32 {\n  let rule = params.primalLanes;\n  if (bodies >= (1u << (rule & 255u))) { return 1u; }\n  if (bodies >= (1u << ((rule >> 8u) & 255u))) { return 2u; }\n  if (bodies >= (1u << ((rule >> 16u) & 255u))) { return 4u; }\n  return 8u;\n}\n\nfn colorThreads(bodies: u32) -> u32 {\n  return bodies * lanesFor(bodies);\n}\n";
/** Indirect-argument items for the shared args kernels: contact pairs, lanes per body. */
export declare const ARGS_ITEMS_3D: {
    counter: string;
    prevCounter: string;
    capacity: string;
    colorThreads: string;
};
//# sourceMappingURL=layout.d.ts.map