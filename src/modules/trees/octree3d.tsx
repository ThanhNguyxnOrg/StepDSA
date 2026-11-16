import React, { useState } from 'react';
import {
  AlgorithmModule,
  ExecutionFrame,
  PredictionCheckpoint,
  SoundCue,
  StepPedagogy,
} from '../../core/types';

export interface Point3D {
  id: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  z: number; // 0 to 100
  label: string;
  /** Currently processed by the algorithm. */
  active?: boolean;
  /** Accepted into a leaf of the octree. */
  stored?: boolean;
  /** Outside the root bounding cube — rejected. */
  rejected?: boolean;
  /** Returned by the range query. */
  found?: boolean;
}

export interface OctantBox {
  id: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  depth: number;
  /** Octant index inside its parent (null for the root). */
  octantIndex: number | null;
  name: string;
  pointCount: number;
  isLeaf: boolean;
}

export interface OctreeNodeData {
  id: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  depth: number;
  octantIndex: number | null;
  pointIds: string[];
  children: OctreeNodeData[];
}

export interface OctreeStats {
  nodes: number;
  leaves: number;
  maxDepth: number;
  stored: number;
}

export interface OctreeState {
  root: OctreeNodeData | null;
  points: Point3D[];
  boxes: OctantBox[];
  activeNodeId: string | null;
  activeOctantIndex: number | null;
  querySphere?: { x: number; y: number; z: number; radius: number };
  foundPoints?: string[];
  subdividing?: boolean;
  phase: 'insert' | 'query' | 'done' | null;
  /** Nodes on the current traversal path (for edge/box highlight). */
  pathIds: string[];
  /** Nodes fully outside the query sphere. */
  prunedIds: string[];
  stats: OctreeStats;
}

const CAPACITY = 1;
const MAX_DEPTH = 6;
const ROOT_MIN = 0;
const ROOT_MAX = 100;

const OCTANT_LABELS = [
  '-X -Y -Z',
  '+X -Y -Z',
  '-X +Y -Z',
  '+X +Y -Z',
  '-X -Y +Z',
  '+X -Y +Z',
  '-X +Y +Z',
  '+X +Y +Z',
];

function cloneOctree(node: OctreeNodeData | null): OctreeNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    xMin: node.xMin,
    xMax: node.xMax,
    yMin: node.yMin,
    yMax: node.yMax,
    zMin: node.zMin,
    zMax: node.zMax,
    depth: node.depth,
    octantIndex: node.octantIndex,
    pointIds: [...node.pointIds],
    children: node.children.map((child) => cloneOctree(child)!),
  };
}

function containsPoint(node: OctreeNodeData, p: Point3D): boolean {
  return (
    p.x >= node.xMin &&
    p.x <= node.xMax &&
    p.y >= node.yMin &&
    p.y <= node.yMax &&
    p.z >= node.zMin &&
    p.z <= node.zMax
  );
}

function octantIndexFor(node: OctreeNodeData, p: Point3D): number {
  const xm = (node.xMin + node.xMax) / 2;
  const ym = (node.yMin + node.yMax) / 2;
  const zm = (node.zMin + node.zMax) / 2;
  return (p.x >= xm ? 1 : 0) | (p.y >= ym ? 2 : 0) | (p.z >= zm ? 4 : 0);
}

function makeChildBounds(node: OctreeNodeData, index: number) {
  const xm = (node.xMin + node.xMax) / 2;
  const ym = (node.yMin + node.yMax) / 2;
  const zm = (node.zMin + node.zMax) / 2;
  return {
    xMin: index & 1 ? xm : node.xMin,
    xMax: index & 1 ? node.xMax : xm,
    yMin: index & 2 ? ym : node.yMin,
    yMax: index & 2 ? node.yMax : ym,
    zMin: index & 4 ? zm : node.zMin,
    zMax: index & 4 ? node.zMax : zm,
  };
}

function computeStats(root: OctreeNodeData | null): OctreeStats {
  const stats: OctreeStats = { nodes: 0, leaves: 0, maxDepth: 0, stored: 0 };
  const walk = (node: OctreeNodeData | null) => {
    if (!node) return;
    stats.nodes++;
    stats.maxDepth = Math.max(stats.maxDepth, node.depth);
    stats.stored += node.pointIds.length;
    if (node.children.length === 0) stats.leaves++;
    node.children.forEach(walk);
  };
  walk(root);
  return stats;
}

function flattenBoxes(root: OctreeNodeData | null): OctantBox[] {
  const boxes: OctantBox[] = [];
  const walk = (node: OctreeNodeData | null) => {
    if (!node) return;
    boxes.push({
      id: node.id,
      xMin: node.xMin,
      xMax: node.xMax,
      yMin: node.yMin,
      yMax: node.yMax,
      zMin: node.zMin,
      zMax: node.zMax,
      depth: node.depth,
      octantIndex: node.octantIndex,
      name:
        node.octantIndex === null
          ? 'Root [0..100]³'
          : `Octant ${node.octantIndex} (d${node.depth})`,
      pointCount: node.pointIds.length,
      isLeaf: node.children.length === 0,
    });
    node.children.forEach(walk);
  };
  walk(root);
  return boxes;
}

/** Squared distance from a sphere centre to the closest point of an AABB. */
function sphereIntersectsBox(
  center: { x: number; y: number; z: number },
  radius: number,
  node: OctreeNodeData
): boolean {
  const cx = Math.max(node.xMin, Math.min(center.x, node.xMax));
  const cy = Math.max(node.yMin, Math.min(center.y, node.yMax));
  const cz = Math.max(node.zMin, Math.min(center.z, node.zMax));
  const dx = center.x - cx;
  const dy = center.y - cy;
  const dz = center.z - cz;
  return dx * dx + dy * dy + dz * dz <= radius * radius;
}

function distance3D(a: { x: number; y: number; z: number }, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export const octree3dModule: AlgorithmModule<Point3D[], OctreeState> = {
  id: 'octree-3d',
  title: 'Octree (3D Spatial Partitioning)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  relatedModules: [
    { id: 'kd-tree', label: 'KD-Tree (2D/3D)' },
    { id: 'closest-pair-points', label: 'Closest Pair of Points' },
    { id: 'interval-tree', label: 'Interval Tree' },
  ],
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Pathological point clustering where depth reaches recursion limit',
  },
  theory: {
    overview:
      'An Octree is a hierarchical 3D spatial partitioning tree data structure in which each internal node recursively subdivides a bounding volume into 8 octants.',
    whyItWorks:
      'By recursively cutting space along the X, Y, and Z midplanes, range queries, frustum culling, and 3D collision detection can prune entire octants in O(log N) rather than scanning all N objects.',
    invariant:
      'Every stored point lies inside the bounding box of every node on its root-to-leaf path. A node splits only when it is a leaf at capacity, and its 8 children partition the parent volume exactly.',
    pitfalls: [
      'Unbalanced partitions when points cluster tightly in one corner of 3D space.',
      'Points exactly on a subdividing midplane: StepDSA routes them to the high side (>= mid), which must be consistent in insert and query.',
      'Coincident points never separate — a depth cap is required or the split recursion never terminates.',
      'Showing a sphere query hit without re-checking the exact distance: box intersection only proves the octant may contain candidates.',
    ],
  },
  presets: [
    {
      id: 'sparse-spatial',
      label: 'Spatial Point Cloud (5 pts)',
      description: 'Points distributed across 3D quadrants; query is centred on the first point',
      data: [
        { id: 'p0', x: 25, y: 75, z: 30, label: 'P0' },
        { id: 'p1', x: 80, y: 30, z: 70, label: 'P1' },
        { id: 'p2', x: 30, y: 85, z: 25, label: 'P2' },
        { id: 'p3', x: 75, y: 80, z: 85, label: 'P3' },
        { id: 'p4', x: 20, y: 20, z: 80, label: 'P4' },
      ],
    },
    {
      id: 'corner-cluster',
      label: 'Clustered Corner (4 pts)',
      description: 'Three points share the +X +Y -Z octant, forcing a second subdivision level',
      data: [
        { id: 'c0', x: 60, y: 60, z: 20, label: 'C0' },
        { id: 'c1', x: 70, y: 70, z: 30, label: 'C1' },
        { id: 'c2', x: 90, y: 90, z: 40, label: 'C2' },
        { id: 'c3', x: 10, y: 10, z: 90, label: 'C3' },
      ],
    },
    {
      id: 'coincident-points',
      label: 'Coincident Points (depth cap)',
      description: 'Identical coordinates cannot be separated by any split — watch MAX_DEPTH stop the recursion',
      data: [
        { id: 'd0', x: 50, y: 50, z: 50, label: 'D0' },
        { id: 'd1', x: 50, y: 50, z: 50, label: 'D1' },
        { id: 'd2', x: 50, y: 50, z: 50, label: 'D2' },
      ],
    },
    {
      id: 'outside-point',
      label: 'Outside Point (rejected)',
      description: 'A point at x = 140 is outside the root cube and must be rejected, not silently clamped',
      data: [
        { id: 'o0', x: 20, y: 20, z: 20, label: 'O0' },
        { id: 'o1', x: 140, y: 40, z: 40, label: 'O1' },
        { id: 'o2', x: 70, y: 70, z: 70, label: 'O2' },
      ],
    },
  ],
  defaultInput: [
    { id: 'p0', x: 25, y: 75, z: 30, label: 'P0' },
    { id: 'p1', x: 80, y: 30, z: 70, label: 'P1' },
    { id: 'p2', x: 30, y: 85, z: 25, label: 'P2' },
    { id: 'p3', x: 75, y: 80, z: 85, label: 'P3' },
    { id: 'p4', x: 20, y: 20, z: 80, label: 'P4' },
  ],
  codeSnippets: {
    cpp: `// C++17 octree node (capacity = 1 for the visualiser)
#include <vector>
#include <array>
#include <memory>

struct Vec3 { float x, y, z; };
struct AABB { Vec3 min, max; };

class OctreeNode {
public:
    static constexpr int CAPACITY = 1;
    static constexpr int MAX_DEPTH = 6;
    AABB bounds;
    int depth = 0;
    std::vector<Vec3> points;
    std::array<std::unique_ptr<OctreeNode>, 8> children;
    bool isLeaf = true;

    bool insert(const Vec3& pt) {
        if (!contains(bounds, pt)) return false;
        if (isLeaf && points.size() < CAPACITY) {
            points.push_back(pt);
            return true;
        }
        if (isLeaf && depth >= MAX_DEPTH) {
            points.push_back(pt); // coincident points at depth cap
            return true;
        }
        if (isLeaf) {
            subdivide(); // create 8 child octants
            for (const auto& p : points) route(*this, p); // redistribute
            points.clear();
        }
        int i = octantIndex(bounds, pt);
        return children[i]->insert(pt);
    }

    void subdivide() {
        Vec3 mid = { (bounds.min.x + bounds.max.x) * 0.5f,
                     (bounds.min.y + bounds.max.y) * 0.5f,
                     (bounds.min.z + bounds.max.z) * 0.5f };
        for (int i = 0; i < 8; ++i) {
            children[i] = std::make_unique<OctreeNode>(octantBounds(bounds, mid, i));
            children[i]->depth = depth + 1;
        }
        isLeaf = false;
    }
};`,
    python: `CAPACITY = 1
MAX_DEPTH = 6

def insert(node, point):
    if not contains(node.bounds, point):
        return False
    if node.is_leaf() and len(node.points) < CAPACITY:
        node.points.append(point)
        return True
    if node.is_leaf() and node.depth >= MAX_DEPTH:
        node.points.append(point)  # coincident points at depth cap
        return True
    if node.is_leaf():
        node.subdivide()  # create 8 child octants
        for p in list(node.points):
            route(node, p)  # redistribute
        node.points = []
    i = octant_index(node.bounds, point)
    return insert(node.children[i], point)

def query(node, sphere):
    if not intersects(sphere, node.bounds):
        return  # prune subtree
    if node.is_leaf():
        for p in node.points:
            if distance(p, sphere.center) <= sphere.radius:
                report(p)
        return
    for child in node.children:
        query(child, sphere)`,
    typescript: `interface OctreeNode {
  bounds: AABB;
  depth: number;
  points: Vec3[];
  children: OctreeNode[];
}

function insert(node: OctreeNode, point: Vec3): boolean {
  if (!contains(node.bounds, point)) return false;
  if (isLeaf(node) && node.points.length < CAPACITY) {
    node.points.push(point);
    return true;
  }
  if (isLeaf(node) && node.depth >= MAX_DEPTH) {
    node.points.push(point); // coincident points at depth cap
    return true;
  }
  if (isLeaf(node)) {
    subdivide(node); // create 8 child octants
    for (const p of [...node.points]) route(node, p); // redistribute
    node.points = [];
  }
  const i = octantIndex(node.bounds, point);
  return insert(node.children[i], point);
}

function query(node: OctreeNode, sphere: Sphere): void {
  if (!intersects(sphere, node.bounds)) return; // prune subtree
  if (isLeaf(node)) {
    for (const p of node.points) {
      if (distance(p, sphere.center) <= sphere.radius) report(p);
    }
    return;
  }
  for (const child of node.children) query(child, sphere);
}`,
    java: `class OctreeNode {
    static final int CAPACITY = 1;
    static final int MAX_DEPTH = 6;
    AABB bounds;
    int depth;
    List<Vec3> points = new ArrayList<>();
    OctreeNode[] children;
    boolean isLeaf = true;

    boolean insert(Vec3 pt) {
        if (!bounds.contains(pt)) return false;
        if (isLeaf && points.size() < CAPACITY) {
            points.add(pt);
            return true;
        }
        if (isLeaf && depth >= MAX_DEPTH) {
            points.add(pt); // coincident points at depth cap
            return true;
        }
        if (isLeaf) {
            subdivide(); // create 8 child octants
            for (Vec3 p : points) route(this, p); // redistribute
            points.clear();
        }
        int i = octantIndex(bounds, pt);
        return children[i].insert(pt);
    }

    void subdivide() {
        children = new OctreeNode[8];
        for (int i = 0; i < 8; i++) {
            children[i] = new OctreeNode();
            children[i].bounds = octantBounds(bounds, i);
            children[i].depth = depth + 1;
        }
        isLeaf = false;
    }
}`,
    pseudocode: `function insert(node, point):
    if point outside node.bounds: return false
    if node is leaf and count(node.points) < CAPACITY:
        add point to node.points
        return true
    end if
    if node is leaf and node.depth >= MAX_DEPTH:
        add point to node.points        # coincident points at depth cap
        return true
    end if
    if node is leaf:
        subdivide(node) into 8 octants
        for p in old node.points: route(node, p)
        node.points = []
    end if
    i = octantIndex(node, point)
    return insert(node.children[i], point)
end function

function query(node, sphere):
    if not intersects(sphere, node.bounds): return   # prune subtree
    if node is leaf:
        for p in node.points:
            if distance(p, sphere.center) <= sphere.radius:
                report p
        end for
        return
    end if
    for child in node.children:
        query(child, sphere)
end function`,
  },
  generateTimeline: (rawInput: Point3D[]): ExecutionFrame<OctreeState>[] => {
    const fallback: Point3D[] = [
      { id: 'p0', x: 25, y: 75, z: 30, label: 'P0' },
      { id: 'p1', x: 80, y: 30, z: 70, label: 'P1' },
      { id: 'p2', x: 30, y: 85, z: 25, label: 'P2' },
      { id: 'p3', x: 75, y: 80, z: 85, label: 'P3' },
      { id: 'p4', x: 20, y: 20, z: 80, label: 'P4' },
    ];
    const inputPoints = Array.isArray(rawInput) && rawInput.length > 0 ? rawInput : fallback;
    const allPoints: Point3D[] = inputPoints.map((raw, index) => ({
      id: raw?.id || `p${index}`,
      x: Number.isFinite(raw?.x) ? raw.x : 50,
      y: Number.isFinite(raw?.y) ? raw.y : 50,
      z: Number.isFinite(raw?.z) ? raw.z : 50,
      label: raw?.label || `P${index}`,
    }));
    const pointMap = new Map(allPoints.map((p) => [p.id, p]));

    let nodeCounter = 0;
    let nodeVisits = 0;
    let pointChecks = 0;

    const makeNode = (
      bounds: { xMin: number; xMax: number; yMin: number; yMax: number; zMin: number; zMax: number },
      depth: number,
      octantIndex: number | null
    ): OctreeNodeData => ({
      id: `oct-${++nodeCounter}`,
      ...bounds,
      depth,
      octantIndex,
      pointIds: [],
      children: [],
    });

    let root: OctreeNodeData = makeNode(
      { xMin: ROOT_MIN, xMax: ROOT_MAX, yMin: ROOT_MIN, yMax: ROOT_MAX, zMin: ROOT_MIN, zMax: ROOT_MAX },
      0,
      null
    );

    const frames: ExecutionFrame<OctreeState>[] = [];
    const storedIds = new Set<string>();
    const rejectedIds = new Set<string>();
    let checkpointAdded = false;
    let firstSplitMilestoneAdded = false;

    const pointView = (activePointId: string | null, foundIds: string[] = []): Point3D[] =>
      allPoints.map((p) => ({
        ...p,
        active: p.id === activePointId,
        stored: storedIds.has(p.id),
        rejected: rejectedIds.has(p.id),
        found: foundIds.includes(p.id),
      }));

    interface SnapshotOverrides {
      activeNodeId?: string | null;
      activePointId?: string | null;
      activeOctantIndex?: number | null;
      foundIds?: string[];
      prunedIds?: string[];
      querySphere?: { x: number; y: number; z: number; radius: number };
      subdividing?: boolean;
      phase?: OctreeState['phase'];
      pathIds?: string[];
    }

    const snapshot = (overrides: SnapshotOverrides = {}): OctreeState => ({
      root: cloneOctree(root),
      points: pointView(overrides.activePointId ?? null, overrides.foundIds ?? []),
      boxes: flattenBoxes(root),
      activeNodeId: overrides.activeNodeId ?? null,
      activeOctantIndex: overrides.activeOctantIndex ?? null,
      querySphere: overrides.querySphere,
      foundPoints: overrides.foundIds,
      subdividing: overrides.subdividing,
      phase: overrides.phase ?? null,
      pathIds: overrides.pathIds ?? [],
      prunedIds: overrides.prunedIds ?? [],
      stats: computeStats(root),
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      state: SnapshotOverrides;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<OctreeState>['conditionEval'];
      callStack?: ExecutionFrame<OctreeState>['callStack'];
      milestone?: string;
      soundCue?: SoundCue;
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(opts.state),
        callStack: opts.callStack ?? [
          { name: opts.action.toLowerCase(), params: {}, line: opts.codeLine, isCurrent: true },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: nodeVisits, accesses: pointChecks },
        invariantStatus: {
          label: 'Every stored point stays inside its node bounds; 8 children partition the parent',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: snapshot({ activeNodeId: root.id, phase: 'insert' }),
      callStack: [
        { name: 'OctreeNode(bounds)', params: { min: [0, 0, 0], max: [100, 100, 100] }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { capacity: CAPACITY, maxDepth: MAX_DEPTH, totalPoints: allPoints.length },
      pedagogy: {
        what: 'The root owns the whole [0..100]³ cube and is currently an empty leaf.',
        why: 'An octree starts as one leaf; it only creates children when a leaf overflows.',
        whatNext: `Insert ${allPoints.length} point(s) one at a time and watch when the root splits.`,
      },
      explanation: `Initial state: root bounding cube [0..100]³, capacity = ${CAPACITY}, max depth = ${MAX_DEPTH}.`,
    });

    const splitNode = (node: OctreeNodeData) => {
      node.children = Array.from({ length: 8 }, (_, i) =>
        makeNode(makeChildBounds(node, i), node.depth + 1, i)
      );
    };

    function insertAt(
      node: OctreeNodeData,
      point: Point3D,
      path: string[],
      mode: 'insert' | 'redistribute'
    ): boolean {
      path.push(node.id);
      nodeVisits++;

      if (!containsPoint(node, point)) {
        rejectedIds.add(point.id);
        pushFrame({
          codeLine: 2,
          action: 'REJECT_OUTSIDE',
          explanation: `Point ${point.label}(${point.x}, ${point.y}, ${point.z}) is outside this node's bounds — rejected.`,
          state: {
            activeNodeId: node.id,
            activePointId: point.id,
            phase: 'insert',
            pathIds: [...path],
          },
          variables: {
            point: point.label,
            x: point.x,
            y: point.y,
            z: point.z,
            nodeBounds: [node.xMin, node.xMax, node.yMin, node.yMax, node.zMin, node.zMax],
          },
          conditionEval: { expr: 'contains(node.bounds, point)', result: false },
          soundCue: 'fail',
          pedagogy: {
            what: `${point.label} falls outside the cube owned by this node.`,
            why: 'Every node only owns its own AABB; a point outside it can never be stored below it.',
            whatNext: 'Skip this point — the other points continue normally.',
          },
        });
        path.pop();
        return false;
      }

      if (node.children.length === 0) {
        if (node.pointIds.length < CAPACITY) {
          node.pointIds.push(point.id);
          storedIds.add(point.id);
          pushFrame({
            codeLine: 4,
            action: mode === 'redistribute' ? 'REDISTRIBUTE_STORE' : 'STORE_POINT',
            explanation:
              mode === 'redistribute'
                ? `Redistributed ${point.label} into leaf ${node.octantIndex === null ? 'root' : `octant ${node.octantIndex}`} (depth ${node.depth}).`
                : `Stored ${point.label} in this leaf (depth ${node.depth}, ${node.pointIds.length}/${CAPACITY} slots used).`,
            state: {
              activeNodeId: node.id,
              activePointId: point.id,
              activeOctantIndex: node.octantIndex,
              phase: 'insert',
              pathIds: [...path],
            },
            variables: {
              point: point.label,
              depth: node.depth,
              occupancy: node.pointIds.length,
              capacity: CAPACITY,
              mode,
            },
            conditionEval: { expr: 'count(node.points) < CAPACITY', result: true },
            soundCue: 'insert',
            pedagogy: {
              what: `${point.label} fits in this leaf without splitting.`,
              why: 'A leaf may hold up to CAPACITY points; only the next point triggers a split.',
              whatNext: 'Continue with the next point.',
            },
          });
          path.pop();
          return true;
        }

        if (node.depth >= MAX_DEPTH) {
          node.pointIds.push(point.id);
          storedIds.add(point.id);
          pushFrame({
            codeLine: 8,
            action: 'DEPTH_CAP',
            explanation: `Depth cap reached at d${node.depth} — ${point.label} shares coordinates with existing points, so it is stored in the same leaf.`,
            state: {
              activeNodeId: node.id,
              activePointId: point.id,
              activeOctantIndex: node.octantIndex,
              phase: 'insert',
              pathIds: [...path],
            },
            variables: {
              point: point.label,
              depth: node.depth,
              maxDepth: MAX_DEPTH,
              occupancy: node.pointIds.length,
              reason: 'coincident-points',
            },
            conditionEval: { expr: 'node.depth >= MAX_DEPTH', result: true },
            soundCue: 'complete',
            pedagogy: {
              what: `The split recursion hit MAX_DEPTH = ${MAX_DEPTH}.`,
              why: 'Identical coordinates always land in the same child, so splitting forever would never separate them.',
              whatNext: 'Keep both points in this leaf; the depth cap is a deliberate termination rule.',
            },
          });
          path.pop();
          return true;
        }

        pushFrame({
          codeLine: 11,
          action: 'OVERFLOW',
          explanation: `Leaf at depth ${node.depth} already holds ${node.pointIds.length} point(s) (capacity ${CAPACITY}); inserting ${point.label} requires a split.`,
          state: {
            activeNodeId: node.id,
            activePointId: point.id,
            activeOctantIndex: node.octantIndex,
            phase: 'insert',
            pathIds: [...path],
          },
          variables: {
            point: point.label,
            depth: node.depth,
            occupancy: node.pointIds.length,
            capacity: CAPACITY,
            overflow: true,
          },
          conditionEval: { expr: 'count(node.points) >= CAPACITY', result: true },
          soundCue: 'compare',
          checkpoint:
            !checkpointAdded && node === root
              ? {
                  id: 'octree-first-overflow',
                  question: `The root leaf already holds ${node.pointIds.length} point and CAPACITY = ${CAPACITY}. What happens when ${point.label} arrives?`,
                  options: [
                    'Overwrite the existing point',
                    'Subdivide into 8 octants, redistribute, then insert',
                    'Reject the new point',
                  ],
                  correctIndex: 1,
                  explanation:
                    'A full leaf splits into 8 octants; existing points are redistributed before the new point is routed.',
                  hint: 'Octrees never overwrite or reject a point that is inside their bounds.',
                }
              : undefined,
          pedagogy: {
            what: `${point.label} arrived at a full leaf.`,
            why: 'Capacity is exceeded, so the leaf must become an internal node with 8 children.',
            whatNext: 'Split along the three midplanes, then move the old point down.',
          },
        });
        checkpointAdded = true;

        splitNode(node);
        pushFrame({
          codeLine: 12,
          action: 'SUBDIVIDE',
          explanation: `Split at (xm, ym, zm) = (${(node.xMin + node.xMax) / 2}, ${(node.yMin + node.yMax) / 2}, ${(node.zMin + node.zMax) / 2}) — 8 child octants created.`,
          state: {
            activeNodeId: node.id,
            activePointId: point.id,
            activeOctantIndex: node.octantIndex,
            phase: 'insert',
            pathIds: [...path],
            subdividing: true,
          },
          variables: {
            parent: node.octantIndex === null ? 'root' : `octant ${node.octantIndex}`,
            depth: node.depth,
            childCount: node.children.length,
            midPoint: [
              (node.xMin + node.xMax) / 2,
              (node.yMin + node.yMax) / 2,
              (node.zMin + node.zMax) / 2,
            ],
          },
          milestone: !firstSplitMilestoneAdded ? 'First 8-Way Split' : undefined,
          soundCue: 'swap',
          pedagogy: {
            what: 'The leaf became an internal node with exactly 8 children.',
            why: 'Three independent midplane cuts (X, Y, Z) produce 2³ = 8 disjoint boxes that tile the parent.',
            whatNext: 'Redistribute the old points, then route the new point.',
          },
        });
        firstSplitMilestoneAdded = true;

        const existingIds = [...node.pointIds];
        node.pointIds = [];
        for (const id of existingIds) {
          const existing = pointMap.get(id);
          if (!existing) continue;
          const idx = octantIndexFor(node, existing);
          pushFrame({
            codeLine: 13,
            action: 'REDISTRIBUTE_ROUTE',
            explanation: `Redistribute ${existing.label}(${existing.x}, ${existing.y}, ${existing.z}) to octant ${idx} [${OCTANT_LABELS[idx]}].`,
            state: {
              activeNodeId: node.id,
              activePointId: existing.id,
              activeOctantIndex: idx,
              phase: 'insert',
              pathIds: [...path],
            },
            variables: {
              point: existing.label,
              octant: idx,
              octantLabel: OCTANT_LABELS[idx],
              bits: `${existing.x >= (node.xMin + node.xMax) / 2 ? '+X' : '-X'} ${
                existing.y >= (node.yMin + node.yMax) / 2 ? '+Y' : '-Y'
              } ${existing.z >= (node.zMin + node.zMax) / 2 ? '+Z' : '-Z'}`,
            },
            soundCue: 'step',
            pedagogy: {
              what: `${existing.label} is re-routed from the old leaf into child ${idx}.`,
              why: 'The 8 children partition the parent volume, so each old point has exactly one destination.',
              whatNext: 'Place it in the child (which may itself split if several points share an octant).',
            },
          });
          insertAt(node.children[idx], existing, path, 'redistribute');
        }

        const newIdx = octantIndexFor(node, point);
        pushFrame({
          codeLine: 17,
          action: 'ROUTE',
          explanation: `Route ${point.label}(${point.x}, ${point.y}, ${point.z}) to octant ${newIdx} [${OCTANT_LABELS[newIdx]}].`,
          state: {
            activeNodeId: node.id,
            activePointId: point.id,
            activeOctantIndex: newIdx,
            phase: 'insert',
            pathIds: [...path],
          },
          variables: {
            point: point.label,
            octant: newIdx,
            octantLabel: OCTANT_LABELS[newIdx],
          },
          soundCue: 'step',
          pedagogy: {
            what: `${point.label} chose child ${newIdx} by comparing each coordinate with the midplanes.`,
            why: 'x >= xm sets bit 0, y >= ym sets bit 1, z >= zm sets bit 2.',
            whatNext: 'Recurse into that child and repeat the capacity check.',
          },
        });
        const ok = insertAt(node.children[newIdx], point, path, mode);
        path.pop();
        return ok;
      }

      const idx = octantIndexFor(node, point);
      pushFrame({
        codeLine: 17,
        action: 'ROUTE',
        explanation: `Route ${point.label}(${point.x}, ${point.y}, ${point.z}) to octant ${idx} [${OCTANT_LABELS[idx]}] at depth ${node.depth + 1}.`,
        state: {
          activeNodeId: node.id,
          activePointId: point.id,
          activeOctantIndex: idx,
          phase: 'insert',
          pathIds: [...path],
        },
        variables: {
          point: point.label,
          octant: idx,
          octantLabel: OCTANT_LABELS[idx],
          depth: node.depth,
        },
        soundCue: 'step',
        pedagogy: {
          what: `${point.label} follows child ${idx} because this node is already internal.`,
          why: 'Internal nodes store no points; the point keeps descending until it reaches a leaf.',
          whatNext: 'Check the child leaf for capacity.',
        },
      });
      const ok = insertAt(node.children[idx], point, path, mode);
      path.pop();
      return ok;
    }

    allPoints.forEach((point, pointIndex) => {
      const path: string[] = [];
      const accepted = insertAt(root, point, path, 'insert');

      const stats = computeStats(root);
      pushFrame({
        codeLine: 5,
        action: accepted ? 'INSERT_DONE' : 'INSERT_REJECTED',
        explanation: accepted
          ? `Finished ${point.label} (${pointIndex + 1}/${allPoints.length}) — ${stats.stored} point(s) stored across ${stats.nodes} node(s), max depth ${stats.maxDepth}.`
          : `Finished ${point.label} (${pointIndex + 1}/${allPoints.length}) — rejected, so ${stats.stored} point(s) are stored.`,
        state: {
          activeNodeId: null,
          activePointId: point.id,
          phase: 'insert',
          pathIds: path,
        },
        variables: {
          point: point.label,
          pointIndex,
          stored: stats.stored,
          nodes: stats.nodes,
          leaves: stats.leaves,
          maxDepth: stats.maxDepth,
        },
        milestone:
          pointIndex === allPoints.length - 1 && stats.stored > 0
            ? 'Point Cloud Inserted'
            : undefined,
        soundCue: 'complete',
        pedagogy: {
          what: accepted
            ? `${point.label} is stored and the tree shape now reflects the point distribution.`
            : `${point.label} was not stored because it lies outside the root cube.`,
          why: accepted
            ? 'Clustered points share octants, so their paths grow deeper while sparse regions stay shallow.'
            : 'An octree can only index points inside the volume it owns; silently clamping would corrupt the structure.',
          whatNext:
            pointIndex === allPoints.length - 1
              ? 'Run a sphere range query and prune octants that cannot intersect it.'
              : `Insert the next point ${allPoints[pointIndex + 1].label}.`,
        },
      });
    });

    // ── Range query centred on the first point ────────────────────────────
    const centerPoint = allPoints[0];
    const sphere = {
      x: centerPoint.x,
      y: centerPoint.y,
      z: centerPoint.z,
      radius: 25,
    };
    const foundIds: string[] = [];
    const prunedIds: string[] = [];
    let leafMilestoneAdded = false;

    const pushQueryFrame = (
      codeLine: number,
      action: string,
      explanation: string,
      overrides: SnapshotOverrides,
      pedagogy: StepPedagogy,
      extra: {
        variables?: Record<string, any>;
        conditionEval?: ExecutionFrame<OctreeState>['conditionEval'];
        soundCue?: SoundCue;
        milestone?: string;
        checkpoint?: PredictionCheckpoint;
      } = {}
    ) => {
      pushFrame({
        codeLine,
        action,
        explanation,
        state: {
          activeNodeId: null,
          activePointId: null,
          phase: 'query',
          querySphere: sphere,
          foundIds: [...foundIds],
          prunedIds: [...prunedIds],
          ...overrides,
        },
        pedagogy,
        variables: extra.variables,
        conditionEval: extra.conditionEval,
        soundCue: extra.soundCue,
        milestone: extra.milestone,
        checkpoint: extra.checkpoint,
      });
    };

    pushQueryFrame(
      20,
      'QUERY_START',
      `Sphere range query: centre ${centerPoint.label}(${sphere.x}, ${sphere.y}, ${sphere.z}), radius ${sphere.radius}.`,
      {},
      {
        what: `The query sphere is centred on ${centerPoint.label} with radius ${sphere.radius}.`,
        why: 'A range query returns every stored point within the radius; the octree lets us skip whole boxes first.',
        whatNext: 'Start at the root and test the sphere against each node AABB.',
      },
      {
        variables: { center: [sphere.x, sphere.y, sphere.z], radius: sphere.radius },
        soundCue: 'start',
      }
    );

    function queryNode(node: OctreeNodeData, path: string[]): void {
      path.push(node.id);
      nodeVisits++;

      if (!sphereIntersectsBox(sphere, sphere.radius, node)) {
        prunedIds.push(node.id);
        pushQueryFrame(
          21,
          'PRUNE',
          `Octant ${node.octantIndex ?? 'root'} at depth ${node.depth} is fully outside the sphere — prune its entire subtree.`,
          {
            activeNodeId: node.id,
            activeOctantIndex: node.octantIndex,
            pathIds: [...path],
          },
          {
            what: 'The closest point of this AABB is farther than the radius.',
            why: 'If the box does not intersect the sphere, no point inside it can be within range.',
            whatNext: 'Skip every descendant and continue with the next sibling.',
          },
          {
            variables: {
              node: node.octantIndex ?? 'root',
              depth: node.depth,
              radius: sphere.radius,
              prunedSubtrees: 1,
            },
            conditionEval: { expr: 'intersects(sphere, node.bounds)', result: false },
            soundCue: 'discard',
          }
        );
        path.pop();
        return;
      }

      if (node.children.length === 0) {
        // An intersecting leaf with no stored points has nothing to verify:
        // skip the frame instead of repeating "check 0 points" dozens of times.
        if (node.pointIds.length === 0) {
          path.pop();
          return;
        }
        pushQueryFrame(
          22,
          'QUERY_LEAF',
          `Leaf at depth ${node.depth} intersects the sphere — check its ${node.pointIds.length} stored point(s) exactly.`,
          {
            activeNodeId: node.id,
            activeOctantIndex: node.octantIndex,
            pathIds: [...path],
          },
          {
            what: 'Box intersection is only a filter; the leaf points still need an exact distance check.',
            why: 'A box can overlap the sphere while its points sit outside it.',
            whatNext: 'Compare each point distance with the radius.',
          },
          {
            variables: { depth: node.depth, leafPoints: node.pointIds.length },
            conditionEval: { expr: 'intersects(sphere, node.bounds)', result: true },
            milestone: !leafMilestoneAdded ? 'First Leaf Verified' : undefined,
          }
        );
        leafMilestoneAdded = true;

        for (const id of node.pointIds) {
          const point = pointMap.get(id);
          if (!point) continue;
          pointChecks++;
          const dist = distance3D(sphere, point);
          const inside = dist <= sphere.radius;
          if (inside && !foundIds.includes(point.id)) foundIds.push(point.id);

          pushQueryFrame(
            inside ? 25 : 24,
            inside ? 'FOUND_POINT' : 'CHECK_POINT',
            inside
              ? `${point.label} distance ${dist.toFixed(2)} <= ${sphere.radius} — reported.`
              : `${point.label} distance ${dist.toFixed(2)} > ${sphere.radius} — outside the sphere.`,
            {
              activeNodeId: node.id,
              activePointId: point.id,
              activeOctantIndex: node.octantIndex,
              pathIds: [...path],
            },
            {
              what: inside
                ? `${point.label} is inside the query sphere.`
                : `${point.label} lies in an intersecting leaf but outside the sphere.`,
              why: 'The exact distance test is the final authority; box overlap alone is not a hit.',
              whatNext: inside ? 'Add it to the result set.' : 'Continue with the next point.',
            },
            {
              variables: {
                point: point.label,
                distance: Number(dist.toFixed(2)),
                radius: sphere.radius,
                inside,
              },
              conditionEval: {
                expr: `distance(${point.label}) <= ${sphere.radius}`,
                result: inside,
              },
              soundCue: inside ? 'success' : 'compare',
            }
          );
        }
        path.pop();
        return;
      }

      pushQueryFrame(
        29,
        'DESCEND',
        `Node at depth ${node.depth} intersects the sphere — descend into its 8 children.`,
        {
          activeNodeId: node.id,
          activeOctantIndex: node.octantIndex,
          pathIds: [...path],
        },
        {
          what: 'The AABB overlaps the sphere, so some descendant may contain a hit.',
          why: 'An octree prunes at the highest node that cannot intersect, not at every level.',
          whatNext: 'Visit the 8 children in index order.',
        },
        {
          variables: { depth: node.depth, children: node.children.length },
          conditionEval: { expr: 'intersects(sphere, node.bounds)', result: true },
        }
      );

      node.children.forEach((child) => queryNode(child, path));
      path.pop();
    }

    queryNode(root, []);

    const stats = computeStats(root);
    pushFrame({
      codeLine: 31,
      action: 'QUERY_COMPLETE',
      explanation:
        foundIds.length > 0
          ? `Query complete: ${foundIds.map((id) => pointMap.get(id)?.label ?? id).join(', ')} inside radius ${sphere.radius}.`
          : `Query complete: no stored point lies within radius ${sphere.radius} of ${centerPoint.label}.`,
      state: {
        activeNodeId: null,
        phase: 'done',
        querySphere: sphere,
        foundIds: [...foundIds],
        prunedIds: [...prunedIds],
        pathIds: [],
      },
      callStack: [
        { name: 'queryRange(sphere)', params: { center: [sphere.x, sphere.y, sphere.z], radius: sphere.radius }, line: 30, isCurrent: true },
        { name: 'main()', params: { matched: foundIds.length }, line: 1 },
      ],
      variables: {
        queryResults: foundIds.map((id) => pointMap.get(id)?.label ?? id).join(', ') || 'none',
        matchedCount: foundIds.length,
        nodes: stats.nodes,
        leaves: stats.leaves,
        maxDepth: stats.maxDepth,
        stored: stats.stored,
        prunedNodes: prunedIds.length,
      },
      milestone: 'Range Query Complete',
      soundCue: foundIds.length > 0 ? 'finish' : 'fail',
      pedagogy: {
        what: `The DFS visited ${nodeVisits} node(s), pruned ${prunedIds.length}, and checked ${pointChecks} stored point(s).`,
        why: 'Pruning whole AABBs is what turns a linear scan into a logarithmic range query.',
        whatNext: 'Drag to orbit the cube and compare the surviving octant with the pruned ones.',
      },
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<OctreeState>) => <OctreeStage3D state={frame.state} />,
};

interface OctreeStage3DProps {
  state: OctreeState;
}

export const OctreeStage3D: React.FC<OctreeStage3DProps> = ({ state }) => {
  const [rotX, setRotX] = useState<number>(25);
  const [rotY, setRotY] = useState<number>(45);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    setRotY((y) => y + dx * 0.5);
    setRotX((x) => Math.max(-60, Math.min(60, x - dy * 0.5)));
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const scale = 2.4;
  const project3D = (x: number, y: number, z: number, cx = 250, cy = 190) => {
    const nx = x - 50;
    const ny = y - 50;
    const nz = z - 50;
    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;
    const x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
    const z1 = nx * Math.sin(radY) + nz * Math.cos(radY);
    const y2 = ny * Math.cos(radX) - z1 * Math.sin(radX);
    return { x: cx + x1 * scale, y: cy - y2 * scale };
  };

  const pathSet = new Set(state.pathIds);
  const prunedSet = new Set(state.prunedIds);

  const renderWireBox = (box: OctantBox) => {
    const p = [
      project3D(box.xMin, box.yMin, box.zMin),
      project3D(box.xMax, box.yMin, box.zMin),
      project3D(box.xMax, box.yMax, box.zMin),
      project3D(box.xMin, box.yMax, box.zMin),
      project3D(box.xMin, box.yMin, box.zMax),
      project3D(box.xMax, box.yMin, box.zMax),
      project3D(box.xMax, box.yMax, box.zMax),
      project3D(box.xMin, box.yMax, box.zMax),
    ];
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const isActive = box.id === state.activeNodeId;
    const onPath = pathSet.has(box.id);
    const isPruned = prunedSet.has(box.id);
    const hasPoints = box.pointCount > 0;

    // Keep the root and its 8 children always visible, but skip empty leaves
    // below depth 1 unless the traversal is touching them. Internal boxes are
    // never skipped, so nesting stays readable.
    if (box.isLeaf && !hasPoints && !onPath && !isActive && !isPruned && box.depth >= 2) {
      return null;
    }

    let stroke = 'rgba(148, 163, 184, 0.22)';
    let strokeWidth = 1;
    if (box.depth === 0) {
      stroke = 'rgba(56, 189, 248, 0.65)';
      strokeWidth = 1.5;
    }
    if (hasPoints) {
      stroke = 'rgba(16, 185, 129, 0.45)';
      strokeWidth = 1.25;
    }
    if (onPath) {
      stroke = 'rgba(245, 158, 11, 0.9)';
      strokeWidth = 2;
    }
    if (isPruned) {
      stroke = 'rgba(244, 63, 94, 0.85)';
      strokeWidth = 1.5;
    }
    if (isActive) {
      stroke = '#818cf8';
      strokeWidth = 2.5;
    }

    return (
      <g key={box.id}>
        {edges.map(([i, j], eIdx) => (
          <line
            key={eIdx}
            x1={p[i].x}
            y1={p[i].y}
            x2={p[j].x}
            y2={p[j].y}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={isPruned ? '3 3' : undefined}
          />
        ))}
      </g>
    );
  };

  const renderQuerySphere = () => {
    if (!state.querySphere) return null;
    const center = project3D(state.querySphere.x, state.querySphere.y, state.querySphere.z);
    const r = state.querySphere.radius * scale;
    return (
      <g>
        <defs>
          <radialGradient id="octree-sphere" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
          </radialGradient>
        </defs>
        <circle
          cx={center.x}
          cy={center.y}
          r={r}
          fill="url(#octree-sphere)"
          stroke="rgba(52, 211, 153, 0.95)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <ellipse
          cx={center.x}
          cy={center.y}
          rx={r}
          ry={r * 0.42}
          fill="none"
          stroke="rgba(52, 211, 153, 0.35)"
          strokeWidth={1}
        />
        <ellipse
          cx={center.x}
          cy={center.y}
          rx={r * 0.42}
          ry={r}
          fill="none"
          stroke="rgba(52, 211, 153, 0.25)"
          strokeWidth={1}
        />
        <text
          x={center.x}
          y={center.y - r - 6}
          textAnchor="middle"
          fill="#34D399"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="600"
        >
          radius {state.querySphere.radius}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 select-none gap-3">
      <div
        className="relative w-full max-w-3xl h-[380px] bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Drag to orbit</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">Yaw {Math.round(rotY)}°</span>
          <span className="text-cyan-300">Pitch {Math.round(rotX)}°</span>
          {state.phase && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 uppercase text-[10px]">
              {state.phase}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end text-[10px] font-mono bg-slate-900/70 backdrop-blur rounded-lg px-2 py-1.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
            <span>Root cube</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-0.5 bg-amber-400 rounded-full" />
            <span>Traversal path</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-300">
            <span className="w-2.5 h-0.5 bg-indigo-300 rounded-full" />
            <span>Active node</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 rounded-full" />
            <span>Pruned by query</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Stored / found point</span>
          </div>
        </div>

        <svg className="w-full h-full" viewBox="0 0 500 400">
          {(() => {
            const origin = project3D(0, 0, 0);
            const xAxis = project3D(40, 0, 0);
            const yAxis = project3D(0, 40, 0);
            const zAxis = project3D(0, 0, 40);
            return (
              <g opacity={0.6} fontFamily="monospace" fontSize="9">
                <line x1={origin.x} y1={origin.y} x2={xAxis.x} y2={xAxis.y} stroke="#EF4444" strokeWidth={1.5} />
                <text x={xAxis.x + 4} y={xAxis.y} fill="#EF4444">+X</text>
                <line x1={origin.x} y1={origin.y} x2={yAxis.x} y2={yAxis.y} stroke="#10B981" strokeWidth={1.5} />
                <text x={yAxis.x} y={yAxis.y - 4} fill="#10B981">+Y</text>
                <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} stroke="#3B82F6" strokeWidth={1.5} />
                <text x={zAxis.x - 6} y={zAxis.y + 10} fill="#3B82F6">+Z</text>
              </g>
            );
          })()}

          {[...state.boxes]
            .sort((a, b) => a.depth - b.depth)
            .map(renderWireBox)}

          {renderQuerySphere()}

          {state.points.map((pt) => {
            const p2d = project3D(pt.x, pt.y, pt.z);
            const isFound = pt.found || state.foundPoints?.includes(pt.id);
            const isActive = pt.active;
            const isStored = pt.stored;
            const isRejected = pt.rejected;
            const isPending = !isStored && !isActive && !isFound && !isRejected;

            let fill = '#0f172a';
            let stroke = '#475569';
            if (isStored) {
              fill = '#06B6D4';
              stroke = '#0F172A';
            }
            if (isFound) {
              fill = '#10B981';
              stroke = '#052e16';
            }
            if (isRejected) {
              fill = '#7f1d1d';
              stroke = '#f87171';
            }
            if (isActive) {
              fill = '#6366F1';
              stroke = '#c7d2fe';
            }

            if (isPending) {
              return (
                <g key={pt.id} opacity={0.45}>
                  <circle cx={p2d.x} cy={p2d.y} r={3.5} fill="#475569" stroke="#64748b" strokeWidth={1} />
                  <text
                    x={p2d.x + 6}
                    y={p2d.y + 3}
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            }

            const showCoords = isActive || isFound || isRejected;
            const labelText = showCoords
              ? `${pt.label} (${pt.x},${pt.y},${pt.z})`
              : pt.label;
            const labelWidth = labelText.length * 5.3 + 10;

            return (
              <g key={pt.id}>
                {isActive && (
                  <>
                    <circle
                      cx={p2d.x}
                      cy={p2d.y}
                      r={13}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      opacity={0.55}
                    />
                    <circle
                      cx={p2d.x}
                      cy={p2d.y}
                      r={9}
                      fill="none"
                      stroke="#a5b4fc"
                      strokeWidth={1}
                      opacity={0.35}
                    />
                  </>
                )}
                <circle
                  cx={p2d.x}
                  cy={p2d.y}
                  r={isActive || isFound ? 7 : 5}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2}
                  strokeDasharray={!isStored && !isRejected ? '2 2' : undefined}
                />
                <rect
                  x={p2d.x + 8}
                  y={p2d.y - 14}
                  width={labelWidth}
                  height={18}
                  rx={4}
                  fill="rgba(15, 23, 42, 0.88)"
                  stroke={isFound ? '#10B981' : isActive ? '#818CF8' : isRejected ? '#f87171' : '#334155'}
                  strokeWidth={1}
                />
                <text
                  x={p2d.x + 12}
                  y={p2d.y - 2}
                  fill={isRejected ? '#fca5a5' : '#F8FAFC'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {labelText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span>nodes <span className="text-slate-200">{state.stats.nodes}</span></span>
          <span>leaves <span className="text-slate-200">{state.stats.leaves}</span></span>
          <span>depth <span className="text-slate-200">{state.stats.maxDepth}</span></span>
          <span>stored <span className="text-emerald-300">{state.stats.stored}</span></span>
          <span>capacity <span className="text-slate-200">{CAPACITY}</span></span>
          <span>max depth <span className="text-slate-200">{MAX_DEPTH}</span></span>
        </div>
        {state.querySphere && (
          <span className="text-emerald-300">
            found {state.foundPoints?.length ?? 0} · pruned {state.prunedIds.length}
          </span>
        )}
      </div>

      <div className="w-full max-w-3xl grid grid-cols-4 md:grid-cols-8 gap-1.5 font-mono text-[10px]">
        {Array.from({ length: 8 }).map((_, i) => {
          const isActive = state.activeOctantIndex === i;
          return (
            <div
              key={i}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                isActive
                  ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold shadow-sm'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div>Oct {i}</div>
              <div className="text-[8px] opacity-75">
                {(i & 1 ? '+X ' : '-X ') + (i & 2 ? '+Y ' : '-Y ') + (i & 4 ? '+Z' : '-Z')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
