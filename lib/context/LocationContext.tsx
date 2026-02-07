"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type LocationContextType = {
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedLocationId");
    if (saved) {
      setSelectedLocationId(saved);
    }
  }, []);

  // Save to localStorage when changed
  const handleSetLocation = (id: string | null) => {
    setSelectedLocationId(id);
    if (id) {
      localStorage.setItem("selectedLocationId", id);
    } else {
      localStorage.removeItem("selectedLocationId");
    }
  };

  return (
    <LocationContext.Provider
      value={{ selectedLocationId, setSelectedLocationId: handleSetLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
