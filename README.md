Overview

Orbital VR is a Wonderland Engine-based solar system simulation that renders Keplerian orbits in VR using a canvas texture.
Focus: accurate orbital positions (Keplerian mechanics), responsive multi-scale camera views, and VR controller interaction for exploration.
Key features

Keplerian orbital solver for real-time planetary positions.
Three camera modes: Solar System, Inner Planets, Planet Focus (follow a specific planet).
Adaptive planet rendering: real-scale and an artistic/log scale option to keep small bodies visible.
Dynamic orbital trails sized to orbital period (memory efficient).
VR interaction: cycle camera modes, pause simulation, focus planets via controller buttons.
Modular architecture that cleanly separates physics, camera/coordinate handling, rendering, and UI.
High-level architecture

Conductor (Drawer) — integration layer: initializes subsystems and drives the per-frame update loop.
SimulationController — time management and orbit updates.
KeplerianOrbit / Physics — orbit math and E → true anomaly conversion (Newton–Raphson solver).
CoordinateSystem — world ↔ screen transform, camera modes and scaling.
CameraController — mode switching, planet-focus logic, scaling multipliers.
Renderer & CanvasManager — draw grid, trails, planets, labels, UI; expose canvas as a texture for VR.
Data (Body) — planetary database (masses, radii, orbital elements, GM values).
Interaction — VR button components (camera mode, pause, planet cycle, toggle orbits).
Where to look (important files)

Core physics: src/Core/Physics/KeplerianOrbit.js
Coordinate transforms: src/Core/Display/CoordinateSystem.js
Camera logic: src/Core/Display/Rendering/CameraController.js
Simulation loop: src/Core/Display/Rendering/SimulationController.js
Rendering: src/Core/Display/Rendering/Renderer.js and CanvasManager.js
Integration component: src/Core/Display/Conductor.js
Planet data: src/Core/Data/body.js
Interaction components: src/Interaction/*Button.js 
