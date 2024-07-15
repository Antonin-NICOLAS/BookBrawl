import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext({});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const setIsLoading = (key, value) => {
    setLoadingStates((prevStates) => ({
      ...prevStates,
      [key]: value,
    }));
  };

  const isLoading = Object.values(loadingStates).some((state) => state);

  return (
    <LoadingContext.Provider value={{ loadingStates, setIsLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};