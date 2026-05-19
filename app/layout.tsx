import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "ExploreHub - Hotels, Restaurants & Attractions",
  description: "Find the best hotels, restaurants, and tourist attractions near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}