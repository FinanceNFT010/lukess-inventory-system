"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Banner {
    id: string;
    image_url: string;
    title: string | null;
    link: string | null;
    is_active: boolean;
    display_order: number;
}

export function BannersManager(): React.JSX.Element {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async (): Promise<void> => {
        setLoading(true);
        const { data, error } = await supabase
            .from("banners")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            toast.error("Error al cargar banners");
        } else {
            setBanners(data || []);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        toast.loading("Subiendo imagen...", { id: "upload" });

        const { error: uploadError } = await supabase.storage
            .from("banners")
            .upload(filePath, file);

        if (uploadError) {
            toast.error("Error al subir imagen", { id: "upload" });
            return;
        }

        const { data: urlData } = supabase.storage
            .from("banners")
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("banners").insert({
            image_url: urlData.publicUrl,
            title: "Nuevo Banner",
            link: "/",
            is_active: true,
            display_order: banners.length,
        });

        if (dbError) {
            toast.error("Error al guardar banner", { id: "upload" });
        } else {
            toast.success("Banner subido", { id: "upload" });
            fetchBanners();
        }
    };

    const toggleActive = async (id: string, current: boolean): Promise<void> => {
        const { error } = await supabase
            .from("banners")
            .update({ is_active: !current })
            .eq("id", id);
        if (!error) {
            setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
            toast.success(current ? "Banner desactivado" : "Banner activado");
        }
    };

    const handleDelete = async (id: string, url: string): Promise<void> => {
        if (!confirm("¿Eliminar este banner?")) return;

        // Extraer path
        const urlParts = url.split("/");
        const filename = urlParts[urlParts.length - 1];

        await supabase.storage.from("banners").remove([filename]);
        const { error } = await supabase.from("banners").delete().eq("id", id);

        if (!error) {
            setBanners(banners.filter(b => b.id !== id));
            toast.success("Banner eliminado");
        }
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
                <h2 className="text-xl font-bold text-zinc-900">Banners Activos</h2>
                <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    Subir Banner
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </label>
            </div>

            {banners.length === 0 ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">Sin Banners</h3>
                    <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                        Sube la primera imagen para mostrarla en el inicio de la tienda.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="aspect-[21/9] bg-zinc-100 relative">
                                <img
                                    src={banner.image_url}
                                    alt={banner.title || "Banner"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => toggleActive(banner.id, banner.is_active)}
                                        className={`px-2 py-1 text-xs font-bold rounded-full ${banner.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-zinc-200 text-zinc-600"
                                            }`}
                                    >
                                        {banner.is_active ? "Activo" : "Inactivo"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id, banner.image_url)}
                                        className="p-1.5 bg-white text-red-600 rounded-full shadow-sm hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-bold text-zinc-900">{banner.title}</p>
                                <p className="text-sm text-zinc-500 font-medium truncate">{banner.link}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
