import { useState, useEffect } from "react";

const PREFIX = "my-app-";

export default function useLocalStore(key, initVal) {
  const prefix = PREFIX + key;
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initVal; // Return the initial value on the server
    const val = localStorage.getItem(prefix);
    return val
      ? JSON.parse(val)
      : typeof initVal === "function"
      ? initVal()
      : initVal;
  });

  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(prefix, JSON.stringify(value));
    }
  }, [prefix, value]);

  return [value, setValue];
}
