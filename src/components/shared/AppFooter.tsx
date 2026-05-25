// src/components/shared/AppFooter.tsx
export default function AppFooter() {
  return (
    <footer className="w-full py-4 px-5 flex flex-col md:flex-row items-center gap-3 bg-card border-t border-border mt-auto">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sistem Informasi Manajemen Antrean.
      </p>
    </footer>
  );
}
