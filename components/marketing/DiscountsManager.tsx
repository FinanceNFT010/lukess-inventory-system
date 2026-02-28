"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface DiscountCode {
    id: string;
    code: string;
    discount_percentage: number;
    expires_at: string | null;
    is_active: boolean;
    max_uses: number | null;
    usage_count: number;
}

export function DiscountsManager(): React.JSX.Element {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newDiscount, setNewDiscount] = useState("");
    const [newExpires, setNewExpires] = useState("");
    const [newMaxUses, setNewMaxUses] = useState("");

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async (): Promise<void> => {
        setLoading(true);
        const { data, error } = await supabase
            .from("discount_codes")
            .select("*")
            .order("code", { ascending: true });

        if (error) {
            toast.error("Error al cargar códigos");
        } else {
            setCodes(data || []);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!newCode || !newDiscount) {
            toast.error("Código y descuento son obligatorios");
            return;
        }

        const payload = {
            code: newCode.toUpperCase(),
            discount_percentage: Number(newDiscount),
            expires_at: newExpires ? new Date(newExpires).toISOString() : null,
            max_uses: newMaxUses ? Number(newMaxUses) : null,
            is_active: true,
            usage_count: 0
        };

        const { error } = await supabase.from("discount_codes").insert([payload]);

        if (error) {
            toast.error("Error al crear código. Tal vez ya existe.");
        } else {
            toast.success("Código creado exitosamente");
            setShowForm(false);
            setNewCode("");
            setNewDiscount("");
            setNewExpires("");
            setNewMaxUses("");
            fetchCodes();
        }
    };

    const toggleActive = async (id: string, current: boolean): Promise<void> => {
        const { error } = await supabase
            .from("discount_codes")
            .update({ is_active: !current })
            .eq("id", id);
        if (!error) {
            setCodes(codes.map(c => c.id === id ? { ...c, is_active: !current } : c));
            toast.success(current ? "Código desactivado" : "Código activado");
        }
    };

    const handleDelete = async (id: string): Promise<void> => {
        if (!confirm("¿Eliminar este código de descuento?")) return;

        const { error } = await supabase.from("discount_codes").delete().eq("id", id);
        if (!error) {
            setCodes(codes.filter(c => c.id !== id));
            toast.success("Código eliminado");
        }
    };

    const getStatusBadge = (code: DiscountCode) => {
        const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
        const isDepleted = code.max_uses && code.usage_count >= code.max_uses;

        if (!code.is_active) {
            return <span className="px-2 py-1 text-xs font-bold bg-zinc-100 text-zinc-500 rounded-lg border border-zinc-200">Inactivo</span>;
        }
        if (isExpired) {
            return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-lg border border-red-200">Expirado</span>;
        }
        if (isDepleted) {
            return <span className="px-2 py-1 text-xs font-bold bg-zinc-200 text-zinc-700 rounded-lg border border-zinc-300">Agotado</span>;
        }
        return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-lg border border-green-200">Activo</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900">Códigos de Descuento</h2>
                <div className="flex gap-2">
                    <button
                        onClick={fetchCodes}
                        className="p-2 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Código
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-zinc-900">Crear Nuevo Código</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Código</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none uppercase"
                                placeholder="EJ: VERANO20"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Descuento (%)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                                placeholder="20"
                                value={newDiscount}
                                onChange={(e) => setNewDiscount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Expiración (Opcional)</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                                value={newExpires}
                                onChange={(e) => setNewExpires(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Usos Máximos (Opcional)</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                                placeholder="Ilimitado"
                                value={newMaxUses}
                                onChange={(e) => setNewMaxUses(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            Guardar Código
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Descuento</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Usos</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Expiración</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {codes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                                        No hay códigos de descuento registrados.
                                    </td>
                                </tr>
                            ) : (
                                codes.map((code) => (
                                    <tr key={code.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                                                {code.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gold-600">
                                            {code.discount_percentage}%
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-zinc-600">
                                            {code.usage_count} / {code.max_uses ? code.max_uses : "∞"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-zinc-600">
                                            {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "Nunca"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(code)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleActive(code.id, code.is_active)}
                                                    className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                                                >
                                                    {code.is_active ? "Desactivar" : "Activar"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(code.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
