"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Location } from "@/lib/types";
import {
  MapPin,
  ChevronDown,
  User,
} from "lucide-react";

interface TopBarProps {
  profile: Profile;
  currentLocation: Location | null;
  locations: Location[];
}

export default function TopBar({
  profile,
  currentLocation,
  locations,
}: TopBarProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    currentLocation
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canSwitchLocation = profile.role === "admin" || profile.role === "manager";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = async (location: Location) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);

    // Update profile's location in Supabase
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ location_id: location.id })
      .eq("id", profile.id);
  };

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Location */}
      <div className="flex items-center gap-3 ml-12 lg:ml-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => canSwitchLocation && setShowLocationPicker(!showLocationPicker)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition
              ${
                canSwitchLocation
                  ? "hover:bg-gray-100 cursor-pointer"
                  : "cursor-default"
              }
            `}
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">
              {selectedLocation?.name || "Sin ubicación"}
            </span>
            {canSwitchLocation && (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showLocationPicker ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Location Dropdown */}
          {showLocationPicker && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cambiar ubicación
                </p>
              </div>
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationChange(loc)}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition flex items-center gap-2
                    ${
                      selectedLocation?.id === loc.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    {loc.address && (
                      <p className="text-xs text-gray-400">{loc.address}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: User avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-700">
            {profile.full_name}
          </p>
          <p className="text-xs text-gray-400">{profile.email}</p>
        </div>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-white">{initials}</span>
          )}
        </div>
      </div>
    </header>
  );
}
