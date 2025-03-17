import { TEXTS } from "../constants";
import { useState } from "react";

export const useText = (page) => {
  const [language, setLanguage] = useState("ua");

  return {
    t: (key) => TEXTS[page]?.[language]?.[key] || key,
    setLanguage,
  };
};