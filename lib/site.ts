export const NAV_LINKS = [
  { href: "/#what", label: "What is Ciro" },
  { href: "/#how", label: "How it works" },
  { href: "/#cities", label: "Cities" },
  { href: "/stories", label: "Stories" },
  { href: "/#invest", label: "Invest" },
];

export const APP_LINKS = {
  ios: process.env.NEXT_PUBLIC_IOS_URL ?? "#",
  android: process.env.NEXT_PUBLIC_ANDROID_URL ?? "#",
};

export const STATS = [
  { label: "Cities mapped", value: "1", suffix: "live" },
  { label: "Stories ready to launch", value: "47" },
  { label: "Languages narrated", value: "3" },
  { label: "Travelers waitlisted", value: "12k+" },
];
