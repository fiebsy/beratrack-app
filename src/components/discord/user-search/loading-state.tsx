import { UserItemSkeleton } from "./user-item";

export function LoadingState() {
  return (
    <div>
      <UserItemSkeleton />
      <UserItemSkeleton />
      <UserItemSkeleton />
    </div>
  );
} 