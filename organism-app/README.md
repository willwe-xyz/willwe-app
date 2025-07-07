# WillWe Organism Ecosystem

A React Three.js application that visualizes WillWe governance ecosystems as living cellular organisms. Each governance node is represented as a unique species of single-celled organism with deterministic characteristics based on their root token address.

## Features

### 🧬 Species Generation System
- **Deterministic DNA**: Uses keccak256(rootTokenAddress) to generate unique species characteristics
- **Species Traits**: Each species has unique membrane colors, nucleus types, organelle preferences, and metabolic rates
- **Individual Variation**: Nodes from the same root token share species DNA but have individual variations

### 🔬 Cellular Architecture
- **Membrane**: Thickness based on complexity, permeability based on membership requirements
- **Nucleus**: Size proportional to total supply, pulse rate based on inflation rate
- **Organelles**:
  - Mitochondria: Energy production based on inflation rate
  - Ribosomes: Count equals member count, show activity
  - Endoplasmic Reticulum: Network showing child node connections
  - Vacuoles: Size based on budget and reserve balances
  - Vesicles: Represent execution engines and endpoints

### 🌊 Value Flow Visualization
- **Token Flows**: Metabolic processes showing minting, burning, redistribution, and inflation
- **Particle Systems**: Color-coded particles for different flow types:
  - 🟢 Green: Minting flows
  - 🔴 Red: Burning flows
  - 🔵 Blue: Redistribution flows
  - 🟡 Yellow: Inflation energy

### 🎮 Interactive Features
- **Organism Selection**: Click to inspect detailed cellular structure
- **Camera Controls**: Orbit, zoom, and pan around the ecosystem
- **Information Overlay**: Detailed node data display
- **Smooth Transitions**: Animated camera movements to selected organisms

### 🏗️ Colony Layout
- **Hierarchical Structure**: Root organisms at center, children in concentric circles
- **Distance-Based Positioning**: Hierarchy depth determines distance from center
- **Flow Connections**: Visual connections between parent and child organisms

### ⚡ Performance Optimizations
- **Level of Detail (LOD)**: Dynamic detail reduction based on camera distance
- **Frustum Culling**: Only render organisms in camera view
- **Particle Pooling**: Efficient particle system management
- **Instanced Rendering**: Optimized rendering for repeated elements

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
cd organism-app
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## File Structure

```
src/
├── components/
│   ├── Membrane.tsx          # Cell membrane visualization
│   ├── Nucleus.tsx           # Cell nucleus component
│   ├── Organelles.tsx        # Cellular organelles
│   ├── Organism.tsx          # Complete organism assembly
│   ├── ParticleSystem.tsx    # Token flow particles
│   ├── NodeInfoOverlay.tsx   # Information display
│   └── OptimizedEcosystem.tsx # Performance-optimized rendering
├── utils/
│   ├── speciesGenerator.ts   # Deterministic species generation
│   ├── colonyLayout.ts       # Hierarchical positioning
│   └── performance.ts        # Performance optimization utilities
├── types/
│   └── nodeData.ts           # TypeScript interfaces
└── App.tsx                   # Main application component
```

## Data Structure

The application expects node data in the following format:

```typescript
interface NodeData {
  basicInfo: [
    string,  // [0] Node identifier
    number,  // [1] Inflation rate in gwei/sec
    number,  // [2] Reserve balance
    number,  // [3] Budget balance
    number,  // [4] Root valuation budget
    number,  // [5] Root valuation reserve
    number,  // [6] Active membrane ID (complexity)
    number,  // [7] Eligibility per second
    number,  // [8] Last redistribution timestamp
    number,  // [9] User's balance in this node
    string,  // [10] User's endpoint address
    number   // [11] Total token supply
  ]
  membersOfNode: string[]
  childrenNodes: string[]
  rootPath: string[]
  signals: any[]
  rootTokenAddress: string
}
```

## Visual Specifications

### Organism Scaling
- **Root organisms**: 1.5-3.0 units diameter
- **Child organisms**: 0.5-1.5 units diameter, scaled by hierarchy depth
- **Organelles**: 0.05-0.3 units, proportional to their function

### Animation Timing
- **Organism breathing**: 0.5-2.0 cycles per second based on metabolic rate
- **Nucleus pulsing**: Rate proportional to inflation rate
- **Organelle activity**: Varies by type and node activity level
- **Flow particles**: 0.01-0.05 units per frame movement speed

### Color Schemes
- **Species-specific palettes**: Generated deterministically from root token address
- **Transparency and emission**: Used for organelles and particle trails
- **Environmental colors**: Dark space background (#0a0e1a) with colored lighting

## Controls

- **Mouse**: Orbit camera around the ecosystem
- **Scroll**: Zoom in/out
- **Right-click + drag**: Pan camera
- **Click organism**: Select and inspect details
- **ESC**: Deselect organism

## Performance Notes

The application includes several performance optimizations:
- Automatic LOD adjustment based on camera distance
- Frustum culling to avoid rendering off-screen organisms
- Particle pooling for efficient memory usage
- Quantized LOD levels to reduce shader switching

For best performance, the application will automatically reduce detail levels when frame rates drop below 30 FPS.

## Future Enhancements

- Integration with real WillWe blockchain data
- Additional organism types and behaviors
- Sound design for metabolic processes
- VR/AR support for immersive exploration
- Multi-species ecosystem interactions
- Historical data playback and analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the WillWe ecosystem. See the main repository for licensing information.