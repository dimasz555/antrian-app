"use client";

import { useEffect, useRef } from "react";

type SSEEvent = {
  type: string;
  [key: string]: unknown;
};

type Options = {
  poliId?: string | number;
  onMessage: (event: SSEEvent) => void;
};

export function useSSE({ poliId = "all", onMessage }: Options) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    const url = `/api/antrian/stream?poliId=${poliId}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        if (data.type === "connected") return;
        onMessageRef.current(data);
      } catch {
        // ignore parse error
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnect
    };

    return () => es.close();
  }, [poliId]);
}
