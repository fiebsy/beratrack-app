'use client';

import { useState } from "react";
import { DiscordUserSearch } from "@/components/discord/user-search";
import { UserDetails } from "@/components/discord/user-details";
import { type DiscordUser } from "@/components/discord/user-search/types";

export default function RolesPage() {
  const [selectedUser, setSelectedUser] = useState<DiscordUser | null>(null);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Discord Role Search</h1>
          <DiscordUserSearch onUserSelect={setSelectedUser} />
        </div>

        <div id="user-details-container">
          <UserDetails user={selectedUser} />
        </div>
      </div>
    </div>
  );
}
