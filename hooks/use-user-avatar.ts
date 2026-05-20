"use client"

import * as React from "react"

import { defaultUserAvatarId, getUserAvatar, userAvatars } from "@/lib/avatars"

const STORAGE_KEY = "imgen-user-avatar"

function readStoredAvatarId(): string {
  if (typeof window === "undefined") return defaultUserAvatarId
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultUserAvatarId
  return userAvatars.some((avatar) => avatar.id === stored)
    ? stored
    : defaultUserAvatarId
}

export function useUserAvatar() {
  const [avatarId, setAvatarIdState] = React.useState<string>(() =>
    readStoredAvatarId(),
  )

  const setAvatarId = React.useCallback((nextId: string) => {
    setAvatarIdState(nextId)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextId)
    }
  }, [])

  const avatar = React.useMemo(() => getUserAvatar(avatarId), [avatarId])

  return { avatarId, avatar, setAvatarId }
}
