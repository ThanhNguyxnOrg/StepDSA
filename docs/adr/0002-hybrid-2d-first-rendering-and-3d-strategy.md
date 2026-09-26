# Hybrid 2D-First Rendering with Opt-in 2.5D/3D Specialized Modes

We chose a 2D-first hybrid rendering engine (SVG + HTML DOM + CSS/Motion transitions, with HTML5 Canvas for large graphs) as the primary learning interface, while rejecting full mandatory 3D across general DSA.

For 90% of algorithms (sorting, binary search, trees, DP tables), full 3D causes occlusion, perspective distortion, and cognitive navigation fatigue that detracts from algorithmic comprehension. 3D/2.5D capabilities (via Three.js/WebGL or isometric projection) are reserved as dedicated opt-in visualization modes specifically for multi-dimensional spatial algorithms (3D pathfinding, Octrees, 3D call-stack layering, or cinematic demonstrations).
