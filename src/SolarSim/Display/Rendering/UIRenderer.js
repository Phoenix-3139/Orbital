/**
 * UI Renderer
 * Extracted from Display.js - handles the complete UI overlay system
 */
export class UIRenderer {
    constructor(canvasManager, coordSystem, gridRenderer) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
        this.gridRenderer = gridRenderer;
    }

    /**
     * Draw complete UI overlay (from original _drawUI)
     */
    drawUI(cameraMode, useRealScale, showAtmospheres, atmosphereOpacity, planetScaleBoost,
           timeMultiplier, simulationTime, targetPlanet, overridePlanetScaling, bodies) {
        
        const ctx = this.canvasManager.ctx;
        const canvas = this.canvasManager.canvas;
        
        // Set up text rendering
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        let y = 20;
        const lineHeight = 15;
        const x = 10;

        // Camera Mode Information (updated for mode 4)
        const modeNames = {
            1: 'Solar System',
            2: 'Inner Planets', 
            3: 'Planet (Enhanced)',
            4: 'Atmosphere (Surface)'
        };
        const modeText = modeNames[cameraMode] || 'Unknown';
        
        ctx.fillText(`Camera Mode: ${cameraMode} (${modeText})`, x, y);
        y += lineHeight;

        // Scale Information
        ctx.fillText(`Scale: ${this.coordSystem.getScaleDescription()}`, x, y);
        y += lineHeight;

        // Planet scaling multipliers
        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        ctx.fillText(`Planet Scaling: Sun ${multipliers.sunMultiplier}x, Planets ${multipliers.planetMultiplier}x`, x, y);
        y += lineHeight;

        // Mode 3 OR 4 specific information (updated)
        if (cameraMode === 3 || cameraMode === 4) {
            y += 5; // Small spacing
            ctx.fillText(`Planet Scale Boost: ${planetScaleBoost}x`, x, y);
            y += lineHeight;

            ctx.fillText(`Atmosphere Rendering: ${showAtmospheres ? 'ON' : 'OFF'}`, x, y);
            y += lineHeight;

            if (showAtmospheres) {
                ctx.fillText(`Atmosphere Opacity: ${(atmosphereOpacity * 100).toFixed(0)}%`, x, y);
                y += lineHeight;
            }

            if (targetPlanet) {
                ctx.fillText(`Following: ${targetPlanet}`, x, y);
                y += lineHeight;
            }

            // Mode 4 specific info
            if (cameraMode === 4) {
                ctx.fillText(`Surface/Atmospheric Detail Mode`, x, y);
                y += lineHeight;
            }
        }

        // Scaling status
        y += 5; // Small spacing
        if (overridePlanetScaling) {
            ctx.fillText('Manual Scaling: ON', x, y);
            y += lineHeight;
        }

        if (useRealScale) {
            ctx.fillText('True Physical Scale Base', x, y);
            y += lineHeight;
        }

        // Time information
        y += 5; // Small spacing
        ctx.fillText(`Time Acceleration: ${timeMultiplier.toFixed(0)}x`, x, y);
        y += lineHeight;

        // Simulation time in appropriate units
        const simDays = simulationTime / 86400;
        let timeText;
        if (simDays > 365) {
            timeText = `${(simDays / 365.25).toFixed(2)} years`;
        } else {
            timeText = `${simDays.toFixed(1)} days`;
        }
        ctx.fillText(`Elapsed: ${timeText}`, x, y);
        y += lineHeight;

        // Camera position
        if (this.coordSystem.cameraCenter) {
            const center = this.coordSystem.cameraCenter;
            ctx.fillText(`Camera: (${(center.x/1e9).toFixed(2)}, ${(center.y/1e9).toFixed(2)}) Gm`, x, y);
            y += lineHeight;
        }

        // Mode-specific information sections (updated)
        if ((cameraMode === 3 || cameraMode === 4) && targetPlanet) {
            this._drawPlanetModeInfo(ctx, canvas, targetPlanet, planetScaleBoost, showAtmospheres, bodies, cameraMode);
        } else if (cameraMode === 2) {
            this._drawInnerPlanetModeInfo(ctx, canvas);
        }

        // Control hints at bottom
        this._drawControlHints(ctx, canvas);
    }

    /**
     * Draw planet mode specific information (updated for mode 4)
     */
    _drawPlanetModeInfo(ctx, canvas, targetPlanet, planetScaleBoost, showAtmospheres, bodies, cameraMode) {
        const rightX = canvas.width - 320;
        let y = canvas.height - 200;

        ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
        ctx.font = '13px Arial';
        
        if (cameraMode === 4) {
            ctx.fillText(`=== ${targetPlanet.toUpperCase()} ATMOSPHERE ===`, rightX, y);
        } else {
            ctx.fillText(`=== ${targetPlanet.toUpperCase()} MODE ===`, rightX, y);
        }
        y += 18;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px Arial';

        // Find target planet for detailed info
        const targetBody = bodies?.find(b => b.name === targetPlanet);
        if (targetBody) {
            // Planet physical information
            if (targetBody.radius) {
                ctx.fillText(`Radius: ${targetBody.radius.toFixed(0)} km`, rightX, y);
                y += 15;
            }

            // Atmospheric information
            const atmosphericSummary = targetBody.getAtmosphericSummary?.();
            if (atmosphericSummary) {
                ctx.fillText('Atmosphere:', rightX, y);
                y += 15;

                if (atmosphericSummary.estimatedSurfacePressure > 0) {
                    const pressure = this._formatPressure(atmosphericSummary.estimatedSurfacePressure);
                    ctx.fillText(`  Pressure: ${pressure}`, rightX, y);
                    y += 15;
                }

                if (atmosphericSummary.surfaceDensity > 0) {
                    const density = this._formatDensity(atmosphericSummary.surfaceDensity);
                    ctx.fillText(`  Density: ${density}`, rightX, y);
                    y += 15;
                }
            }

            // Enhanced rendering status
            y += 5;
            ctx.fillText('Enhanced Rendering:', rightX, y);
            y += 15;
            ctx.fillText(`  Scale Boost: ${planetScaleBoost}x`, rightX, y);
            y += 15;
            ctx.fillText(`  Atmospheres: ${showAtmospheres ? 'ON' : 'OFF'}`, rightX, y);
        }
    }

    /**
     * Draw inner planet mode information
     */
    _drawInnerPlanetModeInfo(ctx, canvas) {
        const rightX = canvas.width - 320;
        let y = canvas.height - 100;

        ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
        ctx.font = '13px Arial';
        ctx.fillText('=== INNER SYSTEM ===', rightX, y);
        y += 18;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px Arial';

        ctx.fillText('Showing: Sun, Mercury, Venus,', rightX, y);
        y += 15;
        ctx.fillText('Earth, Mars', rightX, y);
        y += 15;

        const scale = this.coordSystem.getScaleDescription();
        ctx.fillText(`Focus Scale: ${scale}`, rightX, y);
    }

    /**
     * Draw control hints (updated)
     */
    _drawControlHints(ctx, canvas) {
        const x = 10;
        let y = canvas.height - 80;

        ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('Editor Properties:', x, y);
        y += 15;

        ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
        ctx.font = '10px Arial';

        const hints = [
            '• planetScaleBoost: Planet size multiplier for Mode 3/4',
            '• showAtmospheres: Enable atmospheric rendering',
            '• atmosphereOpacity: Atmosphere transparency (0-1)',
            '• cameraMode: 1=Solar, 2=Inner, 3=Planet, 4=Atmosphere'
        ];

        hints.forEach(hint => {
            ctx.fillText(hint, x, y);
            y += 13;
        });
    }

    /**
     * Format pressure for display
     */
    _formatPressure(pressure) {
        if (pressure > 100000) {
            return `${(pressure / 100000).toFixed(1)} bar`;
        } else if (pressure > 1000) {
            return `${(pressure / 1000).toFixed(1)} kPa`;
        } else {
            return `${pressure.toFixed(0)} Pa`;
        }
    }

    /**
     * Format density for display
     */
    _formatDensity(density) {
        if (density > 1) {
            return `${density.toFixed(1)} kg/m³`;
        } else {
            return `${(density * 1000).toFixed(0)} g/m³`;
        }
    }

    /**
     * Draw camera mode indicator
     */
    _drawCameraModeIndicator(ctx, cameraMode, yOffset) {
        const modeNames = {
            1: 'Solar System View',
            2: 'Inner Planets',
            3: 'Planet Focus'
        };
        
        const modeText = modeNames[cameraMode] || 'Unknown Mode';
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Mode: ${modeText}`, 10, 20 + yOffset);
        
        return 15;
    }
}

export default UIRenderer;