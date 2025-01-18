import "@/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import RootProvider from "@/features/providers/RootProvider";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "BudgetBuddy is a simple and easy-to-use budget tracker.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <SessionProvider>
          <TRPCReactProvider>
            <RootProvider>{children}</RootProvider>
            <Toaster />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
