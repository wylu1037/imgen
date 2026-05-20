"use client";

import { ImgenMarkBadge } from "@/app/_components/imgen-mark";
import { defaultUserAvatarId, getUserAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AssistantAvatar({ className }: { className?: string }) {
  return <ImgenMarkBadge className={className} />;
}

type UserAvatarProps = {
  avatarId?: string | null;
  className?: string;
};

export function UserAvatar({ avatarId, className }: UserAvatarProps) {
  const avatar = getUserAvatar(avatarId ?? defaultUserAvatarId);
  return (
    <span
      aria-label="You"
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-tint-lavender ring-1 ring-hairline-soft",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar.src} alt="" className="h-full w-full object-cover" />
    </span>
  );
}
