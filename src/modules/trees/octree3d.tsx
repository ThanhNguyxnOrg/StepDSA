import React, { useState } from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Point3D {
  id: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  z: number; // 0 to 100
  label: string;
  highlighted?: boolean;
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
  active?: boolean;
  name: string;
}

export interface OctreeState {
  points: Point3D[];
  boxes: OctantBox[];
  activeOctantIndex?: number;
  querySphere?: { x: number; y: number; z: number; radius: number };
  foundPoints?: string[];
  subdividing?: boolean;
}

export const octree3dModule: AlgorithmModule<Point3D[], OctreeState> = {
  id: 'octree-3d',
  title: 'Octree (3D Spatial Partitioning)',
  category: 'trees-bst',
  difficulty: 'Advanced',
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
      'Every 3D point resides entirely within the spatial bounding volume of its assigned leaf octant.',
    pitfalls: [
      'Unbalanced partitions when points cluster tightly in one corner of 3D space.',
      'Handling points that fall exactly on subdividing midplanes.',
    ],
  },
  codeSnippets: {
    cpp: `// C++17 Spatial Octree Node
#include <vector>
#include <memory>
#include <array>

struct Vec3 { float x, y, z; };
struct AABB { Vec3 min, max; };

class OctreeNode {
public:
    static constexpr int CAPACITY = 1;
    AABB bounds;
    std::vector<Vec3> points;
    std::array<std::unique_ptr<OctreeNode>, 8> children;
    bool isLeaf = true;

    OctreeNode(AABB b) : bounds(b) {}

    void subdivide() {
        Vec3 mid = { (bounds.min.x + bounds.max.x) * 0.5f,
                     (bounds.min.y + bounds.max.y) * 0.5f,
                     (bounds.min.z + bounds.max.z) * 0.5f };
        for (int i = 0; i < 8; ++i) {
            Vec3 cMin = { (i & 1) ? mid.x : bounds.min.x,
                          (i & 2) ? mid.y : bounds.min.y,
                          (i & 4) ? mid.z : bounds.min.z };
            Vec3 cMax = { (i & 1) ? bounds.max.x : mid.x,
                          (i & 2) ? bounds.max.y : mid.y,
                          (i & 4) ? bounds.max.z : mid.z };
            children[i] = std::make_unique<OctreeNode>(AABB{cMin, cMax});
        }
        isLeaf = false;
    }

    bool insert(const Vec3& pt) {
        if (!contains(bounds, pt)) return false;
        if (isLeaf && points.size() < CAPACITY) {
            points.push_back(pt);
            return true;
        }
        if (isLeaf) {
            subdivide();
            for (const auto& p : points) {
                for (auto& child : children) if (child->insert(p)) break;
            }
            points.clear();
        }
        for (auto& child : children) {
            if (child->insert(pt)) return true;
        }
        return false;
    }
};`,
    python: `class OctreeNode:
    def __init__(self, x_bounds, y_bounds, z_bounds, capacity=1):
        self.xb, self.yb, self.zb = x_bounds, y_bounds, z_bounds
        self.capacity = capacity
        self.points = []
        self.children = None

    def subdivide(self):
        xm = (self.xb[0] + self.xb[1]) / 2
        ym = (self.yb[0] + self.yb[1]) / 2
        zm = (self.zb[0] + self.zb[1]) / 2
        self.children = []
        for xi in [(self.xb[0], xm), (xm, self.xb[1])]:
            for yi in [(self.yb[0], ym), (ym, self.yb[1])]:
                for zi in [(self.zb[0], zm), (zm, self.zb[1])]:
                    self.children.append(OctreeNode(xi, yi, zi, self.capacity))

    def insert(self, pt):
        if not (self.xb[0] <= pt[0] <= self.xb[1] and
                self.yb[0] <= pt[1] <= self.yb[1] and
                self.zb[0] <= pt[2] <= self.zb[1]):
            return False
        if self.children is None:
            if len(self.points) < self.capacity:
                self.points.append(pt)
                return True
            self.subdivide()
            old_pts = self.points
            self.points = []
            for p in old_pts:
                for c in self.children:
                    if c.insert(p): break
        for c in self.children:
            if c.insert(pt): return True
        return False`,
    typescript: `interface Vec3 { x: number; y: number; z: number; }
interface AABB { min: Vec3; max: Vec3; }

export class OctreeNode {
  points: Vec3[] = [];
  children: OctreeNode[] | null = null;
  constructor(public bounds: AABB, public capacity = 1) {}

  subdivide() {
    const mid = {
      x: (this.bounds.min.x + this.bounds.max.x) / 2,
      y: (this.bounds.min.y + this.bounds.max.y) / 2,
      z: (this.bounds.min.z + this.bounds.max.z) / 2,
    };
    this.children = [];
    for (let i = 0; i < 8; i++) {
      const min = {
        x: (i & 1) ? mid.x : this.bounds.min.x,
        y: (i & 2) ? mid.y : this.bounds.min.y,
        z: (i & 4) ? mid.z : this.bounds.min.z,
      };
      const max = {
        x: (i & 1) ? this.bounds.max.x : mid.x,
        y: (i & 2) ? this.bounds.max.y : mid.y,
        z: (i & 4) ? this.bounds.max.z : mid.z,
      };
      this.children.push(new OctreeNode({ min, max }, this.capacity));
    }
  }
}`,
    java: `class OctreeNode {
    AABB bounds;
    List<Vec3> points = new ArrayList<>();
    OctreeNode[] children;
    int CAPACITY = 1;

    void subdivide() {
        Vec3 mid = bounds.center();
        children = new OctreeNode[8];
        for (int i = 0; i < 8; i++) {
            children[i] = new OctreeNode(bounds.octant(i, mid));
        }
    }

    boolean insert(Vec3 pt) {
        if (!bounds.contains(pt)) return false;
        if (children == null && points.size() < CAPACITY) {
            points.add(pt); return true;
        }
        if (children == null) { subdivide(); }
        for (OctreeNode c : children)
            if (c.insert(pt)) return true;
        return false;
    }
}`,
    pseudocode: `function insert(node, point):
  if point outside node.bounds: return false
  if node.isLeaf and count(node.points) < CAPACITY:
    add point to node.points
    return true
  if node.isLeaf:
    subdivide(node) into 8 octants
    redistribute existing points to children
  for child in node.children:
    if insert(child, point): return true`,
  },
  presets: [
    {
      id: 'sparse-spatial',
      label: 'Spatial Point Cloud (5 pts)',
      description: 'Points distributed across 3D quadrants',
      data: [
        { id: 'p0', x: 25, y: 75, z: 30, label: 'P0' },
        { id: 'p1', x: 80, y: 30, z: 70, label: 'P1' },
        { id: 'p2', x: 30, y: 85, z: 25, label: 'P2' },
        { id: 'p3', x: 75, y: 80, z: 85, label: 'P3' },
        { id: 'p4', x: 20, y: 20, z: 80, label: 'P4' },
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
  generateTimeline: (pts) => {
    const rootBox: OctantBox = {
      id: 'root',
      xMin: 0,
      xMax: 100,
      yMin: 0,
      yMax: 100,
      zMin: 0,
      zMax: 100,
      depth: 0,
      name: 'Root [0..100]³',
    };

    const octantNames = [
      'Octant 0: [L-X, L-Y, L-Z]',
      'Octant 1: [H-X, L-Y, L-Z]',
      'Octant 2: [L-X, H-Y, L-Z]',
      'Octant 3: [H-X, H-Y, L-Z]',
      'Octant 4: [L-X, L-Y, H-Z]',
      'Octant 5: [H-X, L-Y, H-Z]',
      'Octant 6: [L-X, H-Y, H-Z]',
      'Octant 7: [H-X, H-Y, H-Z]',
    ];

    const makeSubOctants = (parent: OctantBox): OctantBox[] => {
      const xm = (parent.xMin + parent.xMax) / 2;
      const ym = (parent.yMin + parent.yMax) / 2;
      const zm = (parent.zMin + parent.zMax) / 2;
      const sub: OctantBox[] = [];
      for (let i = 0; i < 8; i++) {
        sub.push({
          id: `${parent.id}-oct${i}`,
          xMin: i & 1 ? xm : parent.xMin,
          xMax: i & 1 ? parent.xMax : xm,
          yMin: i & 2 ? ym : parent.yMin,
          yMax: i & 2 ? parent.yMax : ym,
          zMin: i & 4 ? zm : parent.zMin,
          zMax: i & 4 ? parent.zMax : zm,
          depth: parent.depth + 1,
          name: octantNames[i],
        });
      }
      return sub;
    };

    const p0 = pts[0] || { id: 'p0', x: 25, y: 75, z: 30, label: 'P0' };
    const p1 = pts[1] || { id: 'p1', x: 80, y: 30, z: 70, label: 'P1' };
    const p2 = pts[2] || { id: 'p2', x: 30, y: 85, z: 25, label: 'P2' };
    const p3 = pts[3] || { id: 'p3', x: 75, y: 80, z: 85, label: 'P3' };

    const subBoxes = makeSubOctants(rootBox);

    const frames: ExecutionFrame<OctreeState>[] = [
      {
        stepIndex: 0,
        totalSteps: 6,
        codeLine: 1,
        explanation: 'Initial State: Created 3D Bounding Cube [0..100]³ as Root Octree node.',
        state: {
          points: [],
          boxes: [rootBox],
        },
      },
      {
        stepIndex: 1,
        totalSteps: 6,
        codeLine: 25,
        explanation: `Insert P0(${p0.x}, ${p0.y}, ${p0.z}): Root has capacity 1, point stored at root leaf.`,
        state: {
          points: [{ ...p0, highlighted: true }],
          boxes: [rootBox],
        },
      },
      {
        stepIndex: 2,
        totalSteps: 6,
        codeLine: 31,
        explanation: `Insert P1(${p1.x}, ${p1.y}, ${p1.z}): Capacity exceeded! Subdividing root bounding volume into 8 child octants.`,
        state: {
          points: [p0, { ...p1, highlighted: true }],
          boxes: subBoxes,
          subdividing: true,
        },
      },
      {
        stepIndex: 3,
        totalSteps: 6,
        codeLine: 35,
        explanation: `Redistributing points: P0 mapped to Octant 2 [L-X, H-Y, L-Z]; P1 mapped to Octant 5 [H-X, L-Y, H-Z].`,
        state: {
          points: [p0, p1],
          boxes: subBoxes.map((b, idx) => ({ ...b, active: idx === 2 || idx === 5 })),
          activeOctantIndex: 5,
        },
      },
      {
        stepIndex: 4,
        totalSteps: 6,
        codeLine: 40,
        explanation: `Insert P2(${p2.x}, ${p2.y}, ${p2.z}): Routed to Octant 2. Octant 2 now holds 2 points and prepares next recursive subdivision.`,
        state: {
          points: [p0, p1, { ...p2, highlighted: true }],
          boxes: subBoxes.map((b, idx) => ({ ...b, active: idx === 2 })),
          activeOctantIndex: 2,
        },
      },
      {
        stepIndex: 5,
        totalSteps: 6,
        codeLine: 45,
        isMilestone: true,
        milestoneTitle: 'Spatial Range Query',
        explanation: `Spatial Query at (30, 80, 30) Radius=25: Pruned 7 octants! Visited only Octant 2, locating P0 & P2 in O(log N).`,
        state: {
          points: [
            { ...p0, highlighted: true },
            p1,
            { ...p2, highlighted: true },
            p3,
          ],
          boxes: subBoxes.map((b, idx) => ({ ...b, active: idx === 2 })),
          querySphere: { x: 30, y: 80, z: 30, radius: 25 },
          foundPoints: ['p0', 'p2'],
          activeOctantIndex: 2,
        },
      },
    ];

    // Normalize stepIndex and totalSteps to actual frame count
    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame) => <OctreeStage3D state={frame.state} />,
};

interface OctreeStage3DProps {
  state: OctreeState;
}

export const OctreeStage3D: React.FC<OctreeStage3DProps> = ({ state }) => {
  // Simple, elegant 3D isometric projection with mouse orbit capability
  const [rotX, setRotX] = useState<number>(25); // Pitch (elevation)
  const [rotY, setRotY] = useState<number>(45); // Yaw (azimuth)
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

  // 3D to 2D isometric projection math
  const project3D = (x: number, y: number, z: number, cx = 250, cy = 180, scale = 2.4) => {
    // Center coordinates around [0, 0, 0]
    const nx = x - 50;
    const ny = y - 50;
    const nz = z - 50;

    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;

    // Y rotation (yaw)
    const x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
    const z1 = nx * Math.sin(radY) + nz * Math.cos(radY);

    // X rotation (pitch)
    const y2 = ny * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = ny * Math.sin(radX) + z1 * Math.cos(radX);

    return {
      x: cx + x1 * scale,
      y: cy - y2 * scale, // SVG Y is inverted
      depth: z2,
    };
  };

  // Draw wireframe box
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
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
      [4, 5], [5, 6], [6, 7], [7, 4], // top face
      [0, 4], [1, 5], [2, 6], [3, 7], // vertical pillars
    ];

    const isBoxActive = box.active;
    const strokeColor = isBoxActive
      ? 'rgba(99, 102, 241, 0.9)'
      : box.depth === 0
      ? 'rgba(56, 189, 248, 0.7)'
      : 'rgba(148, 163, 184, 0.25)';
    const strokeWidth = isBoxActive ? 2 : box.depth === 0 ? 1.5 : 1;

    return (
      <g key={box.id} className="transition-all duration-300">
        {edges.map(([i, j], eIdx) => (
          <line
            key={eIdx}
            x1={p[i].x}
            y1={p[i].y}
            x2={p[j].x}
            y2={p[j].y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={!isBoxActive && box.depth > 0 ? '3 3' : undefined}
          />
        ))}
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 select-none">
      {/* 3D Orbit Canvas */}
      <div
        className="relative w-full max-w-2xl h-[340px] bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Floating Controls HUD */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Click & Drag to Orbit 3D Space</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">Yaw: {Math.round(rotY)}°</span>
          <span className="text-cyan-300">Pitch: {Math.round(rotX)}°</span>
        </div>

        {/* Spatial Legend HUD */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
            <span>Root Bounding Box [0..100]³</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-0.5 bg-indigo-400 rounded-full" />
            <span>Target Octant</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>3D Point Vector (x, y, z)</span>
          </div>
        </div>

        <svg className="w-full h-full" viewBox="0 0 500 360">
          {/* Coordinate Axes */}
          {(() => {
            const origin = project3D(0, 0, 0);
            const xAxis = project3D(40, 0, 0);
            const yAxis = project3D(0, 40, 0);
            const zAxis = project3D(0, 0, 40);
            return (
              <g opacity={0.6} className="font-mono text-[9px]">
                <line x1={origin.x} y1={origin.y} x2={xAxis.x} y2={xAxis.y} stroke="#EF4444" strokeWidth={1.5} />
                <text x={xAxis.x + 4} y={xAxis.y} fill="#EF4444">+X</text>
                <line x1={origin.x} y1={origin.y} x2={yAxis.x} y2={yAxis.y} stroke="#10B981" strokeWidth={1.5} />
                <text x={yAxis.x} y={yAxis.y - 4} fill="#10B981">+Y</text>
                <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} stroke="#3B82F6" strokeWidth={1.5} />
                <text x={zAxis.x - 6} y={zAxis.y + 10} fill="#3B82F6">+Z</text>
              </g>
            );
          })()}

          {/* Render Wireframe Bounding Boxes */}
          {state.boxes.map(renderWireBox)}

          {/* Render Spatial Query Sphere */}
          {state.querySphere && (() => {
            const center = project3D(state.querySphere.x, state.querySphere.y, state.querySphere.z);
            return (
              <g className="transition-all duration-300">
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={55}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="rgba(16, 185, 129, 0.8)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <text
                  x={center.x}
                  y={center.y + 40}
                  textAnchor="middle"
                  fill="#34D399"
                  className="font-mono text-[9px] font-semibold"
                >
                  Range Query Radius=25
                </text>
              </g>
            );
          })()}

          {/* Render 3D Point Nodes */}
          {state.points.map((pt) => {
            const p2d = project3D(pt.x, pt.y, pt.z);
            const isFound = state.foundPoints?.includes(pt.id);
            const isHighlighted = pt.highlighted || isFound;

            return (
              <g key={pt.id} className="transition-all duration-300">
                {/* Glow ring */}
                {isHighlighted && (
                  <circle
                    cx={p2d.x}
                    cy={p2d.y}
                    r={14}
                    fill="none"
                    stroke={isFound ? '#10B981' : '#6366F1'}
                    strokeWidth={1.5}
                    className="animate-ping origin-center opacity-70"
                  />
                )}
                <circle
                  cx={p2d.x}
                  cy={p2d.y}
                  r={isHighlighted ? 7 : 5}
                  fill={isFound ? '#10B981' : isHighlighted ? '#6366F1' : '#06B6D4'}
                  stroke="#0F172A"
                  strokeWidth={2}
                />
                <rect
                  x={p2d.x + 8}
                  y={p2d.y - 14}
                  width={82}
                  height={18}
                  rx={4}
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke={isHighlighted ? '#818CF8' : '#334155'}
                  strokeWidth={1}
                />
                <text
                  x={p2d.x + 12}
                  y={p2d.y - 2}
                  fill="#F8FAFC"
                  className="font-mono text-[9px] font-semibold"
                >
                  {pt.label} ({pt.x},{pt.y},{pt.z})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Octant Partitioning Hierarchy HUD */}
      <div className="w-full max-w-2xl mt-3 grid grid-cols-4 md:grid-cols-8 gap-1.5 font-mono text-[10px]">
        {Array.from({ length: 8 }).map((_, i) => {
          const isActive = state.activeOctantIndex === i;
          return (
            <div
              key={i}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                isActive
                  ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 font-bold shadow-sm'
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
