"use client";

import { useState, useEffect } from "react";

type LiveClockProps = {
  variant?: "default" | "kiosk";
};

export default function LiveClock({ variant = "default" }: LiveClockProps) {
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

      const formattedDate = dateFormatter.format(now);
      const formattedTime = timeFormatter.format(now);


        setDateString(formattedDate.toUpperCase());
        setTimeString(formattedTime.replace(/\./g, ":") + " WIB");
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, [variant]);

  if (variant === "kiosk") {
    return (
      <div className="flex flex-col items-end justify-center leading-tight">
        <span className="text-xs font-medium text-white/80 tracking-wider">
          {dateString}
        </span>
        <span className="text-lg font-bold text-white tracking-wide">
          {timeString}
        </span>
      </div>
    );
  }

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
