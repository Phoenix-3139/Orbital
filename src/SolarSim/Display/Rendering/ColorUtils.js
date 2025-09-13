/**
 * Color Utilities
 * Extracted from Display.js - handles color parsing and manipulation functions
 */
export class ColorUtils {
    /**
     * Parse atmospheric color (from original _parseAtmosphericColor)
     */
    static parseAtmosphericColor(body) {
        const defaultColors = {
            'Earth': { r: 135, g: 206, b: 250 },
            'Mars': { r: 255, g: 100, b: 100 },
            'Venus': { r: 255, g: 165, b: 0 },
            'Jupiter': { r: 218, g: 165, b: 32 },
            'Saturn': { r: 250, g: 213, b: 165 },
            'Uranus': { r: 79, g: 208, b: 227 },
            'Neptune': { r: 65, g: 105, b: 225 },
            'Sun': { r: 255, g: 255, b: 200 }
        };
        
        return defaultColors[body.name] || { r: 135, g: 206, b: 250 };
    }

    /**
     * Adjust color brightness (from original _adjustColorBrightness)
     */
    static adjustColorBrightness(color, factor) {
        if (color.startsWith('#') && color.length === 7) {
            const r = Math.min(255, Math.max(0, parseInt(color.slice(1, 3), 16) + factor * 255));
            const g = Math.min(255, Math.max(0, parseInt(color.slice(3, 5), 16) + factor * 255));
            const b = Math.min(255, Math.max(0, parseInt(color.slice(5, 7), 16) + factor * 255));
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        }
        return color;
    }

    /**
     * Convert color to RGBA (from original _colorToRgba)
     */
    static colorToRgba(color, alpha) {
        if (color.startsWith('#') && color.length === 7) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }
}

export default ColorUtils;