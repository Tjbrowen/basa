export const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        currencyDisplay: 'symbol'
    }).format(amount);
};