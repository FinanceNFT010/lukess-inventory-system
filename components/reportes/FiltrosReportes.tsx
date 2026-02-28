"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Globe, Store, Filter } from "lucide-react";
import { format, startOfWeek, startOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FiltrosReportesProps {
  desdeActual: string;
  hastaActual: string;
  canalActual: string;
}

const PERIODOS = [
  { label: "Esta semana", id: "semana" },
  { label: "Este mes", id: "mes" },
  { label: "Últimos 3 meses", id: "3meses" },
  { label: "Personalizado", id: "custom" },
] as const;

const CANALES = [
  { label: "Todos", value: "todos", icon: Filter },
  { label: "Online", value: "online", icon: Globe },
  { label: "Físico", value: "fisico", icon: Store },
] as const;

function calcPeriodo(id: string): { desde: string; hasta: string } {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  if (id === "semana") {
    return { desde: fmt(startOfWeek(today, { weekStartsOn: 1 })), hasta: fmt(today) };
  }
  if (id === "mes") {
    return { desde: fmt(startOfMonth(today)), hasta: fmt(today) };
  }
  if (id === "3meses") {
    return { desde: fmt(subMonths(today, 3)), hasta: fmt(today) };
  }
  return { desde: fmt(startOfMonth(today)), hasta: fmt(today) };
}

function detectPeriodo(desde: string, hasta: string): string {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  if (
    desde === fmt(startOfWeek(today, { weekStartsOn: 1 })) &&
    hasta === fmt(today)
  )
    return "semana";
  if (desde === fmt(startOfMonth(today)) && hasta === fmt(today)) return "mes";
  if (desde === fmt(subMonths(today, 3)) && hasta === fmt(today)) return "3meses";
  return "custom";
}

export default function FiltrosReportes({
  desdeActual,
  hastaActual,
  canalActual,
}: FiltrosReportesProps) {
  const router = useRouter();

  const periodoDetectado = detectPeriodo(desdeActual, hastaActual);
  const [periodoActivo, setPeriodoActivo] = useState<string>(periodoDetectado);
  const [customDesde, setCustomDesde] = useState(desdeActual);
  const [customHasta, setCustomHasta] = useState(hastaActual);

  function pushParams(desde: string, hasta: string, canal: string) {
    const params = new URLSearchParams({ desde, hasta, canal });
    router.push(`/reportes?${params.toString()}`);
  }

  function handlePeriodo(id: string) {
    setPeriodoActivo(id);
    if (id !== "custom") {
      const range = calcPeriodo(id);
      setCustomDesde(range.desde);
      setCustomHasta(range.hasta);
      pushParams(range.desde, range.hasta, canalActual);
    }
  }

  function handleCanal(canal: string) {
    pushParams(desdeActual, hastaActual, canal);
  }

  function handleCustomApply() {
    if (customDesde && customHasta) {
      pushParams(customDesde, customHasta, canalActual);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Período rápido */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
              Período
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodo(p.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${periodoActivo === p.id
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Separador vertical */}
        <div className="hidden lg:block w-px h-14 bg-zinc-200" />

        {/* Canal */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
              Fuente
            </span>
          </div>
          <div className="flex gap-2">
            {CANALES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.value}
                  onClick={() => handleCanal(c.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${canalActual === c.value
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rango custom */}
      {periodoActivo === "custom" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Desde
            </label>
            <Input
              type="date"
              value={customDesde}
              onChange={(e) => setCustomDesde(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Hasta
            </label>
            <Input
              type="date"
              value={customHasta}
              onChange={(e) => setCustomHasta(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleCustomApply}
              disabled={!customDesde || !customHasta}
              variant="primary"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
