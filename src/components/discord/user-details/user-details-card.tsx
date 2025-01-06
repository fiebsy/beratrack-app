import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { type DiscordUser } from "../user-search/types";

interface UserDetailsCardProps {
  user: DiscordUser;
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  return (
    <div className="border rounded-[28px] bg-background overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-0 ">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.author_avatar_url} alt={user.author_name} />
            <AvatarFallback>{user.author_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold leading-none">
              {user.author_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Active {format(new Date(user.last_active), "PPp")}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-4">
        <div className="space-y-6">
          {/* Roles Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium leading-none">
              Roles ({user.roles.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium leading-none">
              Details
            </h3>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>User ID</span>
                <span className="font-mono">{user.author_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Message</span>
                <span className="font-mono">{user.last_message_id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 