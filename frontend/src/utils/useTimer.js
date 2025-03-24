import { useEffect } from "react";

// Custom hook to manage timers
export const useTimer = (duration, callback) => {
    useEffect(() => {
        const timer = setTimeout(callback, duration);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [duration, callback]);
};
