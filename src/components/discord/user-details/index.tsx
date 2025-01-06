import { type DiscordUser } from "../user-search/types";
import { UserDetailsCard } from "./user-details-card";

interface UserDetailsProps {
  user: DiscordUser | null;
}

export function UserDetails({ user }: UserDetailsProps) {
  if (!user) return null;

  return (
    <div className="mt-20 ">
      <UserDetailsCard user={user} />
    </div>
  );
}

export { type UserDetailsProps }; 