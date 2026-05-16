"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onTambah?: () => void;
  labelTambah?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  toolbar?: React.ReactNode; // tombol tambahan di toolbar
};

export default function DataTable({
  title,
  description,
  searchPlaceholder = "Cari...",
  onSearch,
  onTambah,
  labelTambah = "Tambah",
  children,
  footer,
  toolbar,
}: Props) {
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          {onSearch !== undefined && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-48"
              />
            </div>
          )}

          {/* Tombol tambahan */}
          {toolbar}

          {/* Tombol tambah */}
          {onTambah && (
            <Button size="sm" onClick={onTambah} className="gap-1.5">
              + {labelTambah}
            </Button>
          )}
        </div>
      </div>

      {/* Isi tabel */}
      <div className="overflow-x-auto">{children}</div>

      {/* Footer tabel */}
      {footer && (
        <div className="px-5 py-3 border-t border-border">{footer}</div>
      )}
    </div>
  );
}
