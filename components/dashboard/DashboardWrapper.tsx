"use client";

import { LocationProvider } from "@/lib/context/LocationContext";
import { ReactNode } from "react";

export function DashboardWrapper({ children }: { children: ReactNode }) {
  return <LocationProvider>{children}</LocationProvider>;
}
