import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ── Type ──────────────────────────────────────
type Poli = {
  id: number;
  kode: string;
  nama: string;
  ruangan: string;
  urutan: number;
  aktif: boolean;
};

// ── Fetch data di server ──────────────────────
async function getPoli(): Promise<Poli[]> {
  try {
    const res = await fetch("http://localhost:3000/api/poli", {
      cache: "no-store",
    });
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ── Komponen ──────────────────────────────────
export default async function AntrianPage() {
  const poliList = await getPoli();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Data Poli</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {poliList.length} poli tersedia
        </p>
      </div>

      <Separator className="mb-6" />

      {/* Empty state */}
      {poliList.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-10">
          Belum ada data poli.
        </p>
      )}

      {/* Grid kartu poli */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {poliList.map((poli) => (
          <Card key={poli.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold mt-1">
                  {poli.nama}
                </CardTitle>
                <Badge variant={poli.aktif ? "success" : "destructive"}>
                  {poli.aktif ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="text-3xl font-extrabold text-primary">
                {poli.kode}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{poli.ruangan}</p>
              <p className="text-muted-foreground text-xs mt-1">
                Urutan: {poli.urutan}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
