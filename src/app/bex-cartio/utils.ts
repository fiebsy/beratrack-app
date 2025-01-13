export const TOKEN_EMOJIS: { [key: string]: string } = {
    WBERA: '🐻',
    BERA: '🐻',
    HONEY: '🍯',
    WETH: '💎',
    WBTC: '₿',
    USDC: '💵',
    BEE: '🐝'
};

export function getPoolEmoji(name: string): string {
    const tokens = name.split('-');
    return tokens.map(token => TOKEN_EMOJIS[token] || '').join(' ');
}

export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: string, decimals: number = 18): string {
    try {
        // Convert to BigInt for precise handling
        const bigIntValue = BigInt(value);
        
        // Convert to a decimal string with proper decimal places
        const wholePart = value.slice(0, -decimals) || '0';
        const fractionalPart = value.slice(-decimals).padStart(decimals, '0');
        
        // Remove trailing zeros after decimal
        const trimmedFractional = fractionalPart.replace(/0+$/, '');
        
        // Format with commas for thousands
        const formattedWhole = Number(wholePart).toLocaleString();
        
        // If the number is very small (no whole part)
        if (wholePart === '0' && trimmedFractional) {
            // Find first non-zero digit
            const firstNonZero = fractionalPart.search(/[1-9]/);
            if (firstNonZero !== -1) {
                // Show up to 4 significant digits for small numbers
                const significantDecimals = fractionalPart.slice(firstNonZero, firstNonZero + 4);
                return `0.${'0'.repeat(firstNonZero)}${significantDecimals}`;
            }
        }
        
        // For regular numbers, show up to 4 decimal places
        return trimmedFractional 
            ? `${formattedWhole}.${trimmedFractional.slice(0, 4)}`
            : formattedWhole;
    } catch (error) {
        console.error('Error formatting number:', error);
        return value;
    }
} 