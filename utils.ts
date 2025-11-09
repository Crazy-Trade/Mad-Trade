// utils.ts

export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        ...options,
    }).format(amount);
};

export const formatNumber = (amount: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', {
        ...options,
    }).format(amount);
}

export const formatPercent = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Dynamically determines the number of fraction digits needed to display a small number accurately.
export const getFractionDigits = (price: number): number => {
    if (price === 0) return 2;
    if (price >= 1) return 2;
    if (price < 0.000001) return 8;
    
    let count = 2;
    let p = price;
    while (p < 1 && count < 8) {
        p *= 10;
        count++;
    }
    return Math.min(count + 2, 8); // Add some extra precision but cap at 8
}
