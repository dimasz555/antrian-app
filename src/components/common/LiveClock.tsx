"use client";

import { useState, useEffect } from "react";

export default function LiveClock() {
  const [dateString, setDateString] = useState("");
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const dateFormatter = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });

      const timeFormatter = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      });

      setDateString(dateFormatter.format(now));
      setTimeString(`${timeFormatter.format(now).replace(/:/g, ".")} WIB`);
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex flex-col items-end justify-center leading-tight">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {dateString}
      </span>
      <span className="text-xs font-bold text-foreground tracking-wide">
        {timeString}
      </span>
    </div>
  );
}
