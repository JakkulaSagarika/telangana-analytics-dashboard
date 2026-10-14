import { createContext, useContext, useState } from "react";

const DistrictContext = createContext();

export function DistrictProvider({ children }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  return (
    <DistrictContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict() {
  return useContext(DistrictContext);
}