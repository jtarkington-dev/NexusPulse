export const getFontForTheme = (theme) => {
    switch (theme) {
        case 'cyberpunk':
            return "'Orbitron', sans-serif";
        case 'fallout':
            return "'Courier New', Courier, monospace";
        case 'mario':
            return "'Press Start 2P', cursive";
        case 'zelda':
            return "'Cinzel Decorative', serif";
        default:
            return "sans-serif";
    }
};
