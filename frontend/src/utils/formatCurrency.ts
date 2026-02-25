export const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val || 0);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
