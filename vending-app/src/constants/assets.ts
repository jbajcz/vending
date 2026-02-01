export const ITEM_IMAGES: Record<string, any> = {
    'Cheez-its': require('../../assets/cheez-its.png'),
    'Coca-Cola': require('../../assets/coca-cola.png'),
    'Doritos': require('../../assets/doritos.png'),
    'Snickers': require('../../assets/snickers.png'),
    'Dasani Water': require('../../assets/dasani-water.png'),
    'Pepsi': require('../../assets/pepsi.png'),
    'Granola Bar': require('../../assets/granola-bar.png'),
};

export const UI_ICONS = {
    mapPin: require('../../assets/map-pin.png'),
    mapPinBlack: require('../../assets/map-pin-black.png'),
    vendingMachine: require('../../assets/vending-machine.png'), // Placeholder or user provided
    categories: {
        Snack: require('../../assets/cat-snack.png'),
        Drink: require('../../assets/cat-drink.png'),
        Candy: require('../../assets/cat-candy.png'),
        Health: require('../../assets/cat-health.png'),
    }
};

// Fallback for missing images (can use a placeholder or one of the existing defined icons)
// For now, these require calls will error if files allow don't exist, so user must add them.
// To make it safe, we can use a try/catch or just 'any' if we want to be strict.
