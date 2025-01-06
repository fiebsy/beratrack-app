import { type DiscordUser } from "./types";
import { UserItem, UserItemSkeleton } from "./user-item";
import { useState, useEffect } from "react";

interface SearchResultsProps {
  results: DiscordUser[];
  onUserSelect: (user: DiscordUser) => void;
}

export function SearchResults({ results, onUserSelect }: SearchResultsProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const imagePromises = results
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
  }, [results]);

  if (isLoading) {
    return (
      <div>
        {results.map(user => (
          <UserItemSkeleton key={user.author_id} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {results.map(user => (
        <UserItem 
          key={user.author_id} 
          user={user} 
          icon="search" 
          onSelect={onUserSelect}
        />
      ))}
    </div>
  );
} 