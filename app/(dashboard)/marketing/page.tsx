"use client";

import { useState } from "react";
import { BannersManager } from "@/components/marketing/BannersManager";
import { DiscountsManager } from "@/components/marketing/DiscountsManager";

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState<"banners" | "discounts">("banners");

    return (
        <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 tracking-tight">
                        Marketing
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">
                        Gestiona banners y códigos de descuento.
                    </p>
                </div>
            </div>

            <div className="flex space-x-1 border-b border-zinc-200">
                <button
                    onClick={() => setActiveTab("banners")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "banners"
                            ? "border-gold-500 text-gold-600"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                        }`}
                >
                    Banners de Inicio
                </button>
                <button
                    onClick={() => setActiveTab("discounts")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "discounts"
                            ? "border-gold-500 text-gold-600"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                        }`}
                >
                    Códigos de Descuento
                </button>
            </div>

            <div className="pt-4">
                {activeTab === "banners" ? <BannersManager /> : <DiscountsManager />}
            </div>
        </div>
    );
}
