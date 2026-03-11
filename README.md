# 🐠 AquaSim - Interactive Aquarium Simulator

AquaSim is a high-fidelity interactive aquarium simulator built with **React**, **TypeScript**, and **Vite**. It features a dynamic ecosystem with realistic fish behavior, environment management, and advanced water chemistry simulation.

![License](https://img.shields.io/github/license/NullCipherr/React-Aquarium-Simulator)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

## 🌟 Features

### 🐟 Advanced Fish Simulation
- **Dynamic AI Behaviors**: Fish exhibit realistic movement, including swimming, target seeking, and idle states.
- **Physical Traits**: Individual fish have properties like hunger, health, age, and happiness.
- **Micro-animations**: Smooth transitions, flipping based on direction, and eating effects.

### 🌊 Ecosystem & Environment
- **Water Chemistry**: Monitor and manage pH, ammonia, nitrite, nitrate, oxygen, and CO2 levels.
- **Cycle Simulation**: Realistic water quality changes over time, requiring maintenance like water changes.
- **Dual Environments**: Support for both **Freshwater** and **Saltwater** setups with appropriate species.
- **Biomes & Decoration**: Add plants and rocks to create a unique habitat.

### ⚙️ Interactive Controls
- **Life Panel**: Add new fish species and feed your population.
- **Decor Panel**: Customize the tank layout and handle environmental resets.
- **Water Chemistry**: Fine-tune the temperature and monitor chemical parameters.
- **System Control**: Save/Load system state and control ecosystem settings like lighting.

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Vanilla CSS, Tailwind CSS (via CDN)
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Storage**: LocalStorage for aquarium persistence
- **Build Tool**: Vite
- **Deployment**: GitHub Actions + GitHub Pages

## 📂 Project Structure
```text
src/
├── assets/             # Images, videos, and static resources
├── components/         # Reusable UI components and icons
├── constants/          # Configuration and static data (fish species, etc.)
├── features/           # Modular functionality (Aquarium, Fish, Controls)
├── hooks/              # Custom React hooks (Game Loop, etc.)
├── services/           # External logic (Storage, API)
├── types/              # TypeScript definitions and interfaces
└── App.tsx             # Main application entry
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/NullCipherr/React-Aquarium-Simulator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd React-Aquarium-Simulator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
Open [http://localhost:3000/React-Aquarium-Simulator/](http://localhost:3000/React-Aquarium-Simulator/) in your browser.

## 📦 Deployment
The project is configured with **GitHub Actions**. Every push to the `main` branch automatically builds and deploys the latest version to **GitHub Pages**.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.