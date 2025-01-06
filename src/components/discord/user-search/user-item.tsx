import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Search } from "lucide-react";
import { type DiscordUser } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface UserItemProps {
  user: DiscordUser;
  icon?: "clock" | "search" | "none";
  onSelect: (user: DiscordUser) => void;
}

export function UserItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 h-[72px]">
      <div className="w-5 shrink-0">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export function UserItem({ user, icon = "none", onSelect }: UserItemProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (!user.author_avatar_url) {
      setIsImageLoading(false);
      return;
    }

    const img = new Image();
    img.src = user.author_avatar_url;
    img.onload = () => setIsImageLoading(false);
    img.onerror = () => setIsImageLoading(false);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [user.author_avatar_url]);

  return (
    <div
      onClick={() => onSelect(user)}
      className="flex items-center gap-4 px-6 py-3.5 h-[72px] hover:bg-accent/50 cursor-pointer"
    >
      <div className="w-5 shrink-0">
        {icon === "clock" ? (
          <Clock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Search className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="relative h-10 w-10 shrink-0">
        {isImageLoading ? (
          <Skeleton className="h-10 w-10 rounded-full absolute" />
        ) : null}
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={user.author_avatar_url} 
            alt={user.author_name}
            className={isImageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}
          />
          <AvatarFallback>{user.author_name[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-2">
        <span className={`font-medium h-5 leading-5 ${
          icon === "clock" ? "text-history" : ""
        }`}>
          {user.author_name}
        </span>
        <span className="text-sm text-muted-foreground h-4 leading-4">
          {user.roles.length} roles
        </span>
      </div>
    </div>
  );
} 