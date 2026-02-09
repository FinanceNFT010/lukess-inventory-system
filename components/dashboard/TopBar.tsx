import type { Profile } from "@/lib/types";

interface TopBarProps {
  profile: Profile;
}

export default function TopBar({ profile }: TopBarProps) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 lg:px-6">
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
