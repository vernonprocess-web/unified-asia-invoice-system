export const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val || 0);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
