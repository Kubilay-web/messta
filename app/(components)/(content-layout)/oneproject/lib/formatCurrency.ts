export const formatCurrency = (
  amount: number,
  defaultCurrency: string,
  exchangeRate: number
) => {
  // Determine if conversion is needed
  const convertedAmount =
    defaultCurrency === "USD" ? amount : amount * exchangeRate;

  // Function to add currency symbol
  const addSymbol = (value: string) => {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: defaultCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(0)
        .replace(/\d/g, "")
        .trim() + value
    );
  };

  // Function to format large numbers
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return addSymbol((num / 1000000).toFixed(1) + "M");
    } else if (num >= 1000) {
      return addSymbol((num / 1000).toFixed(1) + "k");
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: defaultCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  return formatLargeNumber(convertedAmount);
};
