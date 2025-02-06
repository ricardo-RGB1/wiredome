import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ourFileRouter } from "./api/uploadthing/core";
import { ModalProvider } from "@/components/modal-provider";
import { SocketProvider } from "@/components/socket-provider";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiredome",
  description: "Instant messaging for the modern age.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="stylesheet" href="https://use.typekit.net/uly5wyj.css" />
        </head>
        <body
          className={`${geistSans.variable} ${
            geistMono.variable
          } antialiased ${cn("bg-white dark:bg-[#313338]")}`}
        >
          {/* For dark mode support */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="skybox-theme"
          >
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <SocketProvider>
              <ModalProvider />
              <QueryProvider>{children}</QueryProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
