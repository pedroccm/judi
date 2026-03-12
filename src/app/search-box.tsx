"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ juiz: string; total: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    }
    setLoading(false);
  }

  function handleSelect(juiz: string) {
    setOpen(false);
    setQuery("");
    router.push(`/juiz/${encodeURIComponent(juiz)}`);
  }

  return (
    <div ref={containerRef} className="relative mx-auto max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Digite o nome do juiz..."
          className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-11 text-base shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {results.map((r) => (
            <button
              key={r.juiz}
              onClick={() => handleSelect(r.juiz)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted/60"
            >
              <span className="font-medium">{r.juiz}</span>
              <span className="ml-4 shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {r.total.toLocaleString("pt-BR")} processos
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
