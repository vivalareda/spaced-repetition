import { useEffect, useState } from "react";

const MS_PER_MINUTE = 60_000;

/** The current time rounded down to the minute, so it can be used as a stable query argument. */
export function currentMinute() {
  return Math.floor(Date.now() / MS_PER_MINUTE) * MS_PER_MINUTE;
}

/** `currentMinute()`, re-rendering the caller whenever the minute changes. */
export function useMinuteClock() {
  const [now, setNow] = useState(currentMinute);

  useEffect(() => {
    const interval = setInterval(() => setNow(currentMinute()), MS_PER_MINUTE);
    return () => clearInterval(interval);
  }, []);

  return now;
}
