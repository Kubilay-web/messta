"use client"

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider";

import { ourFileRouter } from "../../../api/oneproject/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Toaster } from "react-hot-toast";
import Providers from "./components/Providers";
const inter = Inter({ subsets: ["latin"] });


import dynamic from "next/dynamic";
import { PHProvider } from "./components/posthog-provider";


const PostHogPageView = dynamic(() => import("./components/PostHogPageView"), {
  ssr: false,
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="tr">
      <div className={inter.className}>
        <PHProvider>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <Toaster position="top-center" reverseOrder={false} />

              <PostHogPageView />
              {children}
            </Providers>
          </ThemeProvider>
        </PHProvider>
      </div>
    </div>
  );
}
