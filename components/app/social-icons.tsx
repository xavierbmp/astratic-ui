import { cn } from "cn"

const paths = {
  instagram:
    "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z",
  tiktok:
    "M13.5 2h3.1c.2 1.9 1.4 3.6 3.2 4.2.4.1.8.2 1.2.2v3.1c-1.6 0-3.1-.5-4.4-1.4v6.7c0 3.4-2.8 6.2-6.2 6.2S4.2 18.2 4.2 14.8s2.8-6.2 6.2-6.2c.3 0 .6 0 .9.1v3.2c-.3-.1-.6-.2-.9-.2-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V2z",
  youtube:
    "M22.5 7.2c-.3-1-1-1.7-2-2C18.8 4.8 12 4.8 12 4.8s-6.8 0-8.5.4c-1 .3-1.7 1-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8c.3 1 1 1.7 2 2 1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4c1-.3 1.7-1 2-2 .5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8zM9.8 15.1V8.9L15.5 12l-5.7 3.1z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v5.4h-4v-4.8c0-1.2 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.5v4.9h-4v-11z",
}

export type SocialNetwork = keyof typeof paths

export const socialLabel: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
}

export function SocialIcon({
  network,
  className,
  ...props
}: React.ComponentProps<"svg"> & { network: SocialNetwork }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label={socialLabel[network]}
      className={cn("size-3.5 shrink-0", className)}
      {...props}
    >
      <path d={paths[network]} />
    </svg>
  )
}
