import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAP Emergency Veterinary Portal",
  description: "Team JAM prototype for coordinating emergency greyhound veterinary care.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body>{children}</body></html>;
}
