import { buttonVariants } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUOPEN 2023 registration",
  description: "Create. Explore. Divide. Conquer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <header className="container py-8 flex justify-between">
            <Image
              src="/hero-logo.svg"
              width={200}
              height={32}
              alt={"nuopen 2023"}
            />
            <Link
              href="https://open.nuacm.kz"
              className={buttonVariants({ variant: "destructive" })}
            >
              <span className="font-bold">Home</span>
            </Link>
          </header>

          <main className="flex justify-center px-4 lg:px-0">{children}</main>

          <footer className="w-full container flex justify-center py-8 text-muted-foreground text-sm">
            nuopen 2023 by ACM SC
          </footer>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
