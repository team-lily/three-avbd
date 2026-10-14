import * as THREE from 'three/webgpu';
import type { HullShape } from '../avbd3d/shapes.ts';
import type { Body, World } from './world.ts';
/**
 * A hull's faces as triangles, at unit size (divided by the hull's size, as BodyMesh scales it
 * back up), each face flat-shaded.
 */
export declare function hullGeometry(shape: HullShape): THREE.BufferGeometry;
export interface BodyMeshOptions {
    /**
     * Which bodies to draw: a shape (every body of it, as they come and go), a hull shape (every
     * body made from it), a list, or a test. Default: every box.
     */
    bodies?: 'box' | 'sphere' | HullShape | Body[] | ((body: Body) => boolean);
    /**
     * The shape drawn for each body, at unit size: scaled by the body's size (a unit box, or a
     * sphere of diameter 1, fits the body exactly). Default: a box, a sphere for 'sphere', the
     * hull itself (hullGeometry) for a hull shape.
     */
    geometry?: THREE.BufferGeometry;
    /**
     * A node material: its position, normal and colour nodes are set here, so a material already
     * drawing another BodyMesh is copied. Default: MeshStandardNodeMaterial.
     */
    material?: THREE.NodeMaterial;
}
export declare class BodyMesh extends THREE.Mesh<THREE.InstancedBufferGeometry, THREE.NodeMaterial> {
    readonly world: World;
    private readonly ids;
    private readonly colors;
    private readonly which;
    private drawnVersion;
    constructor(world: World, options?: BodyMeshOptions);
    /** Paint one body (null: back to the material's colour). */
    setColor(body: Body, color: THREE.ColorRepresentation | null): void;
    /** Redraw the list of bodies (automatic as they come and go; call after changing a list). */
    refresh(): void;
    onBeforeRender: () => void;
}
//# sourceMappingURL=mesh.d.ts.map