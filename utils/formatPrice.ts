export const formatPrice = (amount: number) => {
  // Convert the number to a string and split it into parts separated by the decimal point
  const parts = amount.toFixed(2).split(".");

  // Format the integer part with comma as thousand separator
  const formattedIntegerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine the formatted integer part with the decimal part and add currency symbol
  const formattedAmount = `R ${formattedIntegerPart}.${parts[1]}`;

  return formattedAmount;
};
