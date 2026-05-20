export type UserAvatar = {
  id: string;
  label: string;
  src: string;
};

export const userAvatars: UserAvatar[] = [
  { id: "notionists-alex", label: "Alex", src: "/avatars/notionists-alex.svg" },
  {
    id: "notionists-bella",
    label: "Bella",
    src: "/avatars/notionists-bella.svg",
  },
  {
    id: "notionists-casey",
    label: "Casey",
    src: "/avatars/notionists-casey.svg",
  },
  { id: "notionists-dana", label: "Dana", src: "/avatars/notionists-dana.svg" },
  { id: "notionists-eli", label: "Eli", src: "/avatars/notionists-eli.svg" },
  {
    id: "notionists-fenix",
    label: "Fenix",
    src: "/avatars/notionists-fenix.svg",
  },
];

export const defaultUserAvatarId = userAvatars[0].id;

export function getUserAvatar(id: string | null | undefined): UserAvatar {
  return userAvatars.find((avatar) => avatar.id === id) ?? userAvatars[0];
}
