"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, X, UploadCloud, ChevronLeft, ChevronRight, Star, Link2, FileUp } from "lucide-react";
import { uploadImageFromUrl } from "@/app/(dashboard)/inventario/actions";

interface ImageUploaderProps {
    existingImages: string[];
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
    bucketName?: string;
    organizationId: string;
}

export function ImageUploader({
    existingImages,
    onImagesChange,
    maxImages = 5,
    bucketName = "product-images",
    organizationId,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Handle Drag & Drop
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFiles(Array.from(e.target.files));
            // Reset input so the same file could theoretically be picked again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const processFiles = async (files: File[]) => {
        if (existingImages.length + files.length > maxImages) {
            toast.error(`Solo puedes subir hasta ${maxImages} imágenes en total.`);
            // Only take what fits
            files = files.slice(0, maxImages - existingImages.length);
            if (files.length === 0) return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        const validFiles = files.filter(f => {
            if (!validTypes.includes(f.type)) {
                toast.error(`Tipo no permitido: ${f.name} (solo JPG, PNG, WEBP, AVIF)`);
                return false;
            }
            if (f.size > 5 * 1024 * 1024) {
                toast.error(`El archivo ${f.name} supera los 5MB permitidos.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        const newUrls: string[] = [];

        for (const file of validFiles) {
            try {
                const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const fileName = `${organizationId}/${Date.now()}_${safeName}`;

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, { cacheControl: "3600", upsert: false });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(data.path);

                newUrls.push(urlData.publicUrl);
            } catch (error: any) {
                console.error("Error uploading image:", error);
                toast.error(`Error al subir ${file.name}: ${error.message}`);
            }
        }

        if (newUrls.length > 0) {
            onImagesChange([...existingImages, ...newUrls]);
            if (newUrls.length === 1) {
                toast.success("Imagen subida");
            } else {
                toast.success(`${newUrls.length} imágenes subidas`);
            }
        }

        setUploading(false);
    };

    const handleAddFromUrl = async () => {
        if (!urlInput.trim()) return;

        if (existingImages.length >= maxImages) {
            toast.error(`Solo puedes tener hasta ${maxImages} imágenes.`);
            return;
        }

        try {
            // Basic URL validation
            new URL(urlInput);
        } catch (e) {
            toast.error("Por favor, ingresa un URL válido");
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImageFromUrl(urlInput, organizationId);

            if (result.success && result.publicUrl) {
                onImagesChange([...existingImages, result.publicUrl]);
                toast.success("Imagen añadida desde URL");
                setUrlInput('');
            } else {
                toast.error(result.error || "Error al procesar el URL");
            }
        } catch (error) {
            toast.error("Error al conectar con el servidor");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (indexToRemove: number) => {
        const urlToRemove = existingImages[indexToRemove];

        // Optimistic update
        const updatedImages = [...existingImages];
        updatedImages.splice(indexToRemove, 1);
        onImagesChange(updatedImages);

        // Extract path from public URL
        try {
            const publicUrlString = supabase.storage.from(bucketName).getPublicUrl("").data.publicUrl;
            if (urlToRemove.startsWith(publicUrlString)) {
                const filePath = urlToRemove.substring(publicUrlString.length);
                const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
                await supabase.storage.from(bucketName).remove([cleanPath]);
            }
        } catch (e) {
            console.error("Error removing file from storage:", e);
        }
    };

    const moveLeft = (index: number) => {
        if (index === 0) return;
        const items = [...existingImages];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        onImagesChange(items);
    };

    const moveRight = (index: number) => {
        if (index === existingImages.length - 1) return;
        const items = [...existingImages];
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        onImagesChange(items);
    };

    return (
        <div className="space-y-4">
            {/* Header with tabs */}
            <div className="flex items-center justify-between">
                <div className="flex p-0.5 bg-zinc-100 rounded-lg border border-zinc-200">
                    <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${uploadMode === 'file'
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                            }`}
                    >
                        <FileUp className="w-3.5 h-3.5" />
                        Archivo
                    </button>
                    <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${uploadMode === 'url'
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                            }`}
                    >
                        <Link2 className="w-3.5 h-3.5" />
                        URL
                    </button>
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                    {existingImages.length} / {maxImages}
                </span>
            </div>

            {/* Upload Zone / URL input */}
            {existingImages.length < maxImages && (
                <div className="min-h-[128px]">
                    {uploadMode === 'file' ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging
                                    ? "border-amber-400 bg-amber-50/30 scale-[1.01]"
                                    : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300"
                                } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/webp, image/avif"
                                multiple
                                className="hidden"
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                                    <p className="text-sm font-medium text-zinc-600">Subiendo...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center px-4">
                                    <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? "text-amber-500" : "text-zinc-400"}`} />
                                    <p className="text-sm font-medium text-zinc-700">
                                        Arrastra imágenes aquí o haz clic
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">
                                        JPG, PNG, WEBP, AVIF • MÁX. 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 p-4 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="url"
                                        placeholder="Pega el URL de la imagen aquí..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFromUrl())}
                                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddFromUrl}
                                    disabled={uploading || !urlInput.trim()}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Añadir"}
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-tight">
                                Importante: El sistema copiará la imagen a nuestros servidores.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Gallery */}
            {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {existingImages.map((url, i) => (
                        <div
                            key={`${url}-${i}`}
                            className={`relative group rounded-xl border-2 overflow-hidden flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 ${i === 0 ? "border-amber-400 ring-4 ring-amber-100/50 shadow-sm" : "border-zinc-200"}`}
                        >
                            <img
                                src={url}
                                alt={`Imagen ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JjYmNiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUxIiBjeT0iOC41MSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                }}
                            />

                            {/* Badge Principal */}
                            {i === 0 && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pt-1.5 pb-4 px-1.5 flex justify-center">
                                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-white shadow-sm drop-shadow-md">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        Principal
                                    </div>
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="p-1.5 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg text-zinc-900 transition-all shadow-sm group/del"
                                        title="Eliminar imagen"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex justify-between w-full">
                                    <button
                                        type="button"
                                        onClick={() => moveLeft(i)}
                                        disabled={i === 0}
                                        className={`p-1.5 rounded-lg shadow-sm transition-all ${i === 0 ? "opacity-0 cursor-default" : "bg-white hover:bg-zinc-100 text-zinc-900"}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveRight(i)}
                                        disabled={i === existingImages.length - 1}
                                        className={`p-1.5 rounded-lg shadow-sm transition-all ${i === existingImages.length - 1 ? "opacity-0 cursor-default" : "bg-white hover:bg-zinc-100 text-zinc-900"}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
