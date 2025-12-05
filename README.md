# Orbital VR - Interactive Solar System Simulation

An immersive VR educational experience that teaches orbital mechanics through accurate Keplerian physics and multi-scale visualization.

---

## Overview

Orbital VR is a WebXR-based solar system simulation built with Wonderland Engine. It renders real-time planetary orbits using Keplerian mechanics and provides three distinct camera modes for exploration. The simulation uses HTML5 Canvas as a live texture, allowing high-performance 2D rendering in a 3D VR environment.

**Key Features:**
- Accurate Keplerian orbital solver with sub-meter precision
- Three camera modes: Solar System, Inner Planets, Planet Focus
- Real-scale and artistic rendering modes
- Dynamic orbital trails sized to planetary periods
- VR controller-based interaction
- Educational visualizations (Kepler's 2nd Law, distance graphs, interactive text panels)
- Multiple educational scenes teaching gravity, orbital mechanics, and planetary science

---

## Getting Started

### Requirements
- VR headset with WebXR support (Meta Quest 2/3, Pico, etc.)
- VR controllers with tracking
- Wonderland Engine (for development)

### Launch Instructions
1. Open the project in Wonderland Engine
2. Select the device you want to deploy to (Quest/Pico/Browser)
3. Click the green play button
4. In the VR headset (with ADB debugging configured):
   - A web browser will open asking "Enter VR?"
   - Click "Enter VR"
5. Click the "Start Simulation" button in the intro scene
6. Use triggers and joysticks to navigate the environment

---

## Educational Scenes

The experience includes **6 educational scenes**, each teaching different concepts:

### Scene 1: Introduction to Gravity
- **Topic**: What is gravity and how does it work
- **Features**: Distance graph showing planet-Sun distances in real-time
- **Interactivity**: 6-page text panel explaining gravity concepts for kids
- **Key Learning**: Gravity as an invisible force, why we don't float away, orbital mechanics basics

### Scene 2: Main Solar System View
- **Topic**: Full solar system exploration
- **Features**: All 8 planets with interactive controls
- **Camera Modes**: Switch between Solar System, Inner Planets, and Planet Focus views
- **Controls**: Pause, planet cycling, orbit toggling

### Scene 3: Kepler's Second Law
- **Topic**: Equal areas in equal times
- **Features**: Visual demonstration of Kepler's 2nd Law with shaded sectors
- **Interactivity**: 6-page educational panel, toggle Keplerian overlay
- **Key Learning**: Why planets speed up near the Sun and slow down farther away

### Scene 4: (Custom educational content)

### Scene 5: Earth-Moon Barycenter
- **Topic**: Center of mass and orbital wobble
- **Features**: Close-up view of Earth wobbling around the barycenter
- **Interactivity**: 4-page text panel explaining barycentric motion
- **Key Learning**: How Earth and Moon orbit their common center of mass

### Scene 6: Mission Control Tutorial
- **Topic**: How to use the simulation controls
- **Features**: Complete user guide for all VR controls
- **Interactivity**: 6-page tutorial walking through each button
- **Key Learning**: Mastering camera modes, pause, planet cycling, orbit trails

---

## VR Controls

### Main Simulation Buttons

| Button | Function | Available In | Notes |
|--------|----------|--------------|-------|
| **Camera Mode** | Cycle through modes 1→2→3→1 | All scenes | Changes viewing perspective |
| **Pause** | Pause/resume simulation | All scenes | Freezes time progression |
| **Planet Cycle** | Switch target planet | Modes 2 & 3 | Cycles: Mercury→Venus→Earth→Mars→Jupiter→Saturn→Uranus→Neptune |
| **Toggle Orbits** | Show/hide orbital trails | All scenes | Displays historical paths |
| **Kepler Toggle** | Show/hide Kepler's 2nd Law | Scene 3 (Mode 2) | Only for Venus & Earth |
| **Page Flip** | Next page in text panels | Educational scenes | Advances through lesson content |

### Navigation
- **Joystick**: Move through the VR space
- **Trigger**: Interact with buttons and UI elements
- **Grip**: (Reserved for future features)

---

## Camera Modes Explained

### Mode 1: Solar System View
- **Scale**: 10 million km/pixel
- **Visible Bodies**: Sun + all 8 planets
- **Camera Center**: Fixed at Sun (origin)
- **Planet Sizes**: Sun at 10%, planets at 50× real size
- **Best For**: Understanding relative planetary positions and system layout

### Mode 2: Inner Planets View
- **Scale**: 500,000 km/pixel
- **Visible Bodies**: Sun, Mercury, Venus, Earth, Mars
- **Camera Center**: Fixed at Sun (origin)
- **Planet Sizes**: Sun at 20%, planets at 15× real size
- **Special**: Shows Kepler's 2nd Law visualization for Venus and Earth
- **Best For**: Studying inner solar system dynamics

### Mode 3: Planet Focus
- **Scale**: 10,000 km/pixel
- **Visible Bodies**: Selected planet + Sun
- **Camera Center**: Follows selected planet in real-time
- **Planet Sizes**: Sun at 5%, planets at 1× real size (most accurate)
- **Best For**: Close-up observation of individual planetary motion

---

## Understanding the Display

### Planet Rendering
- **Real Scale Mode** (default): Proportional sizing with visibility multipliers
- **Artistic Mode**: Logarithmic scaling for enhanced visibility
- **Minimum Size**: 6 pixels (configurable)
- **Sprites**: High-quality planetary textures from NASA/community sources

### Orbital Trails
- **Color**: Matches planet color
- **Length**: Dynamically sized to ~2 complete orbits based on orbital period
- **Special Case**: Earth trail extended 20× to show barycentric wobble
- **Toggle**: Can be shown/hidden with Toggle Orbits button

### UI Elements
- **Top-left Corner**: 
  - Current camera mode
  - Time multiplier (default: 2,000,000×)
  - Simulation date/time (days or years elapsed)
  - Selected planet information
- **Planet Labels**: Appear when planets are large enough on screen
- **Background Grid**: Dotted coordinate reference grid

### Educational Overlays

#### Distance Graph (Displayed on Plane Mesh)
- **Purpose**: Real-time planet-Sun distance visualization
- **Units**: Astronomical Units (AU)
- **Display**: Scrolling line graph with axes rendered on canvas texture
- **Rendering**: HTML5 Canvas → WebGL texture on 3D plane mesh
- **Update**: Every frame
- **Teaching**: Shows elliptical orbit effects on distance

#### Kepler's 2nd Law Overlay (Rendered on Main Canvas)
- **Display**: Elliptical orbit with two 60° shaded sectors
- **Concept**: "Equal areas in equal times"
- **Planets**: Venus and Earth only
- **Toggle**: Fifth button in Mode 2
- **Teaching**: Visual proof of orbital speed variation

#### Interactive Text Panels (Displayed on Plane Meshes)
- **Format**: Multi-page educational content rendered on canvas textures
- **Rendering**: HTML5 Canvas → WebGL texture on 3D plane meshes
- **Navigation**: Page flip buttons
- **Content**: Age-appropriate explanations
- **Topics**: Gravity (TextS1), orbits (TextS3), Kepler's laws (TextS3), barycentric motion (TextS5), controls (TextS6)

---

## Time Simulation

- **Default Speed**: 2,000,000× real-time
- **Physics Engine**: Keplerian mechanics via Newton-Raphson solver
- **Solver Precision**: 1e-12 (sub-meter positional accuracy)
- **Update Rate**: 60 FPS (frame-dependent)
- **Orbital Calculations**: 
  - Mean anomaly calculation
  - Eccentric anomaly solving (50 iterations max)
  - True anomaly conversion
  - 2D position in orbital plane

---

## Educational Content Guide

### For Educators

**Scene 1 - Gravity Basics** (Ages 6-10)
- Introduces gravity as an invisible pulling force
- Explains why we don't float away
- Shows how gravity keeps planets orbiting the Sun
- Distance graph demonstrates elliptical orbits

**Scene 3 - Kepler's Second Law** (Ages 10-14)
- Explains planetary speed variation
- Visual demonstration with equal-area sectors
- Interactive toggle for hands-on learning
- Connects gravity strength to orbital speed

**Scene 5 - Barycentric Motion** (Ages 12+)
- Advanced concept of center of mass
- Earth-Moon system as example
- Visualizes Earth's orbital wobble
- Real astronomical phenomenon

**Scene 6 - User Tutorial** (All Ages)
- Step-by-step control guide
- Interactive practice with buttons
- Builds confidence in VR navigation

### Learning Objectives

**Primary (Ages 6-10)**
- Understand gravity as a force
- Recognize planets orbit the Sun
- Observe different planetary speeds
- Learn to use VR controls

**Secondary (Ages 10-14)**
- Explain Kepler's laws of planetary motion
- Calculate distances in Astronomical Units
- Understand elliptical vs circular orbits
- Analyze real-time distance data

**Advanced (Ages 14+)**
- Comprehend barycentric systems
- Evaluate orbital mechanics precision and balance

---

## Tips for Best Experience

### Navigation
1. **Start in Scene 6** to learn all controls
2. **Progress to Scene 1** for gravity basics
3. **Explore Scene 2** for full solar system view
4. **Study Scene 3** for Kepler's laws
5. **Examine Scene 5** for advanced concepts

### Interaction
1. **Use Mode 1** to get oriented with planetary positions
2. **Switch to Mode 2** to study inner planet dynamics and Kepler's law
3. **Use Mode 3** to follow individual planets closely
4. **Toggle orbits** to visualize planetary paths over time
5. **Pause simulation** to examine specific configurations
6. **Flip through text pages** to learn at your own pace

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Planets not visible | Cycle camera modes or toggle orbits |
| Simulation frozen | Check if pause button was pressed |
| Wrong planet in focus | Use Planet Cycle button (Modes 2/3 only) |
| Text panel stuck | Use page flip button or restart scene |
| Kepler overlay not showing | Must be in Mode 2 with Venus or Earth selected |
| Distance graph not updating | Check that Scene 1 is active |

---

## Technical Architecture

### Core Components

**Physics Engine:**
- **KeplerianOrbit**: Newton-Raphson solver for eccentric anomaly
  - Tolerance: 1e-12
  - Max iterations: 50
  - Convergence optimization for high eccentricity orbits
- **Body (Data)**: Planetary database from NASA JPL Horizons
  - Orbital elements (a, e, i, Ω, ω, M₀)
  - Physical properties (mass, radius, GM)
  - Visual properties (color, sprite paths)

**Rendering System:**
- **Conductor (Drawer)**: Main orchestrator
  - Initializes all subsystems
  - Drives update loop
  - Manages component properties
- **SimulationController**: Time management
  - Keplerian position updates
  - Dynamic trail length calculation
  - Visible body filtering
- **Renderer**: Canvas-based rendering
  - Planet sprites with caching
  - Orbital trails with transparency
  - UI overlays with scaling
  - Grid background
  - Kepler ellipse visualization
- **CanvasManager**: Texture management
  - Canvas creation (1024×1024 or 2048×2048)
  - WebGL texture updates
  - Material binding

**Camera System:**
- **CoordinateSystem**: World to screen transforms
  - Mode-specific scaling (1e10, 5e8, 1e7 m/px)
  - Planet size multipliers
  - Dynamic camera centering
- **CameraController**: Mode switching
  - Planet tracking
  - Adaptive scaling
  - Focus view configuration

**Interaction Components:**
- **CameraModeNextButton**: Mode cycling (1→2→3→1)
- **PauseToggleButton**: Time control
- **PlanetCycleButton**: Target selection (8 planets)
- **ToggleOrbitsButton**: Trail visibility
- **Kepler2ndEQToggle**: Educational overlay
- **Flip_Pages_S1/S3/S5/S6**: Text navigation

**Educational Scripts:**
- **DistGraph**: Real-time distance visualization
- **TextS1**: Gravity introduction (6 pages)
- **TextS3**: Kepler's 2nd Law (6 pages)
- **TextS5**: Barycentric motion (4 pages)
- **TextS6**: Control tutorial (6 pages)
- **WobbleOnBarycenter**: Earth-Moon system renderer

### File Structure

```
js/OrbitalV2/src/
├── Core/
│   ├── Data/
│   │   └── body.js                    # Planetary database (NASA JPL data)
│   ├── Display/
│   │   ├── Conductor.js               # Main orchestrator
│   │   ├── CoordinateSystem.js        # World↔screen transforms
│   │   └── Rendering/
│   │       ├── CameraController.js    # Camera mode logic
│   │       ├── SimulationController.js # Physics updates
│   │       ├── Renderer.js            # Canvas rendering
│   │       └── CanvasManager.js       # Texture management
│   └── Physics/
│       └── KeplerianOrbit.js          # Newton-Raphson solver
└── Interaction/
    ├── CameraModeNextButton.js        # Mode cycling
    ├── PauseToggleButton.js           # Time control
    ├── PlanetCycleButton.js           # Planet selection
    ├── ToggleOrbitsButton.js          # Trail toggle
    ├── Kepler2ndEQToggle.js           # Kepler overlay
    ├── Flip_Pages_S1.js               # Page navigation (Scene 1)
    ├── Flip_Pages_S3.js               # Page navigation (Scene 3)
    ├── Flip_Pages_S5.js               # Page navigation (Scene 5)
    ├── Flip_Pages_S6.js               # Page navigation (Scene 6)
    └── EduScript/
        ├── DistGraph.js               # Distance graph renderer
        ├── TextS1.js                  # Gravity text (6 pages)
        ├── TextS3.js                  # Kepler text (6 pages)
        ├── TextS5.js                  # Barycenter text (4 pages)
        ├── TextS6.js                  # Tutorial text (6 pages)
        └── WobbleOnBarycenter.js      # Earth-Moon renderer
```

### Technology Stack
- **Engine**: Wonderland Engine
- **Language**: JavaScript (ES6+)
- **Rendering**: HTML5 Canvas 2D → WebGL texture
- **Platform**: WebXR (Meta Quest, Pico, browser)
- **Data Source**: NASA JPL Horizons System
- **3D Models**: Sketchfab, Fab

---

## Development

### Running Locally
1. Clone the repository
2. Open project in Wonderland Engine
3. Configure VR settings for your headset
4. Deploy to headset or run in WebXR-compatible browser

### Modifying Parameters

Key simulation parameters exposed in Wonderland Engine editor:

**Conductor.js (Main Simulation)**
- `timeMultiplier`: Simulation speed (default: 2,000,000×)
- `planetScaleBoost`: Planet size enhancement (default: 6.0)
- `minPlanetPixels`: Minimum rendering size (default: 6.0)
- `showOrbits`: Initial trail visibility (default: false)
- `cameraMode`: Starting camera mode 1/2/3 (default: 1)
- `targetPlanet`: Initial focus planet (default: 'Mercury')
- `drawKeplerEllipse`: Kepler overlay enabled (default: true)

**WobbleOnBarycenter.js (Scene 5)**
- `timeMultiplier`: Faster for barycentric motion (default: 15,000)
- `planetScaleBoost`: Lower for realistic sizing (default: 1.1)
- `minPlanetPixels`: Larger for clarity (default: 36.0)

**DistGraph.js (Scene 1)**
- `canvasWidth/Height`: Graph resolution (default: 512×512)
- `backgroundColor`: Graph background (default: #000000)
- `graphColor`: Line and text color (default: #FFFFFF)

**Text Components (S1/S3/S5/S6)**
- `canvasWidth/Height`: Text panel resolution (default: 512×512)
- `backgroundColor`: Panel background (default: #000000)
- `textColor`: Text color (default: #FFFFFF)

### Adding New Planets
1. Add orbital elements to `body.js` planetary database
2. Include sprite path for visual representation
3. Update `PlanetCycleButton` planet list if needed
4. Adjust camera scales in `CoordinateSystem.js` if necessary

### Creating New Educational Scenes
1. Duplicate existing Text component (TextS1/S3/S5/S6)
2. Modify `pages` array with new content
3. Create corresponding Flip_Pages component
4. Link in Wonderland Engine scene hierarchy

---

## Credits

**Data & Assets:**
- Planetary data: NASA JPL Horizons System
- 3D Models: Sketchfab, Fab
- Engine: Wonderland Engine
- Community: Wonderland Engine Discord

**Special Thanks:**
- NASA for open-access planetary data
- Wonderland Engine team for VR development platform
- Beta testers and educators for feedback

---

## License

MIT - License

---

## Links

- **GitHub Repository**: https://github.com/Phoenix-3139/Orbital
- **Wonderland Engine**: https://wonderlandengine.com/
- **NASA JPL Horizons**: https://ssd.jpl.nasa.gov/

---
