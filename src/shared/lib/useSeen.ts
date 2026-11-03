import { useEffect, useState } from "react";

// Becomes true the first time `flag` is true and stays true (used to defer work until something is first shown).
export function useSeen(flag: boolean): boolean {
  const [seen, setSeen] = useState(flag);
  useEffect(() => {
    if (flag) setSeen(true);
  }, [flag]);
  return seen || flag;
}
