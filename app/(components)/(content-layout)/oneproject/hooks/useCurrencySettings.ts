import { useState, useEffect } from "react";

const useCurrencySettings = () => {
  const [localCurrency, setLocalCurrency] = useState<string>("UGX");
  const [defaultCurrency, setDefaultCurrency] = useState<string>("UGX");
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  useEffect(() => {
    const storedLocalCurrency = localStorage.getItem("localCurrency");
    const storedDefaultCurrency = localStorage.getItem("defaultCurrency");
    const storedExchangeRate = localStorage.getItem("exchangeRate");

    if (storedLocalCurrency) setLocalCurrency(storedLocalCurrency);
    if (storedDefaultCurrency) setDefaultCurrency(storedDefaultCurrency);
    if (storedExchangeRate) setExchangeRate(Number(storedExchangeRate));
  }, []);

  return { localCurrency, defaultCurrency, exchangeRate };
};

export default useCurrencySettings;
