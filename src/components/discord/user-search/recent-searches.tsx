import { type DiscordUser } from "./types";
import { UserItem, UserItemSkeleton } from "./user-item";
import { useState, useEffect } from "react";

interface RecentSearchesProps {
  recentSearches: DiscordUser[];
  onUserSelect: (user: DiscordUser) => void;
}

export function RecentSearches({ recentSearches, onUserSelect }: RecentSearchesProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (recentSearches.length === 0) {
      setIsLoading(false);
      return;
    }

    const imagePromises = recentSearches
      .filter(user => user.author_avatar_url)
      .map(user => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = user.author_avatar_url;
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      });

    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [recentSearches]);

  if (recentSearches.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground">
        No recent searches
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {recentSearches.map(user => (
          <UserItemSkeleton key={user.author_id} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {recentSearches.map(user => (
        <UserItem 
          key={user.author_id} 
          user={user} 
          icon="clock" 
          onSelect={onUserSelect}
        />
      ))}
    </div>
  );
} 