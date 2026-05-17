"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

type Props = {
  title: string;
  namaUser: string;
};

const ClockSkeleton = () => (
  <div className="w-60 bg-accent/50 animate-pulse rounded-md hidden md:block" />
);

const LiveClock = dynamic(() => import("@/components/common/LiveClock"), {
  ssr: false,
  loading: () => <ClockSkeleton />,
});

export default function AppHeader({ title, namaUser }: Props) {
  return (
    <header className="h-16 px-5 flex items-center justify-between bg-background border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors">
          <Menu size={20} className="text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold text-primary">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex shrink-0">
          <LiveClock />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            {namaUser.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {namaUser}
          </span>
        </div>
      </div>
    </header>
  );
}
