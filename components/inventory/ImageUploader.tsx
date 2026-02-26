"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, X, UploadCloud, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";

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

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        const validFiles = files.filter(f => {
            if (!validTypes.includes(f.type)) {
                toast.error(`Tipo no permitido: ${f.name} (solo JPG, PNG, WEBP)`);
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
                const fileExt = file.name.split(".").pop()?.toLowerCase();
                // sanitize filename
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

    const removeImage = async (indexToRemove: number) => {
        const urlToRemove = existingImages[indexToRemove];

        // Optimistic update
        const updatedImages = [...existingImages];
        updatedImages.splice(indexToRemove, 1);
        onImagesChange(updatedImages);

        // Extract path from public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        try {
            const publicUrlString = supabase.storage.from(bucketName).getPublicUrl("").data.publicUrl;
            if (urlToRemove.startsWith(publicUrlString)) {
                const filePath = urlToRemove.substring(publicUrlString.length);
                // Ensure path doesn't start with slash
                const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

                await supabase.storage.from(bucketName).remove([cleanPath]);
            }
        } catch (e) {
            console.error("Error removing file from storage:", e);
            // Even if deletion fails, we keep the UI optimistic remove
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
            {/* Upload Zone */}
            {existingImages.length < maxImages && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png, image/webp"
                        multiple
                        className="hidden"
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <p className="text-sm font-medium text-indigo-600">Subiendo...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center px-4">
                            <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? "text-indigo-500" : "text-gray-400"}`} />
                            <p className="text-sm font-medium text-gray-700">
                                Haz clic o arrastra imágenes aquí
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG, WEBP — Máx. 5MB cada una ({existingImages.length}/{maxImages})
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Gallery */}
            {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-4">
                    {existingImages.map((url, i) => (
                        <div
                            key={`${url}-${i}`}
                            className={`relative group rounded-xl border-2 overflow-hidden flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 ${i === 0 ? "border-amber-400 ring-2 ring-amber-100 shadow-sm" : "border-gray-200"}`}
                        >
                            <img
                                src={url}
                                alt={`Imagen ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JjYmNiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiLz48L3N2Zz4=';
                                }}
                            />

                            {/* Badge Principal */}
                            {i === 0 && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pt-1 pb-3 px-1 flex justify-center">
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-white shadow-sm">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        Principal
                                    </div>
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                {/* Delete button */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="p-1 bg-white/90 hover:bg-red-50 hover:text-red-500 rounded text-gray-700 transition-colors shadow-sm"
                                        title="Eliminar imagen"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Reorder controls */}
                                <div className="flex justify-between w-full pb-1">
                                    <button
                                        type="button"
                                        onClick={() => moveLeft(i)}
                                        disabled={i === 0}
                                        className={`p-1 rounded shadow-sm ${i === 0 ? "opacity-0 cursor-default" : "bg-white/90 hover:bg-gray-100 text-gray-700"}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveRight(i)}
                                        disabled={i === existingImages.length - 1}
                                        className={`p-1 rounded shadow-sm ${i === existingImages.length - 1 ? "opacity-0 cursor-default" : "bg-white/90 hover:bg-gray-100 text-gray-700"}`}
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
