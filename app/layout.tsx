import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCEA Nanyuki Town Church Youth Fellowship",
  description:
    "Register, take our survey, and journey with us in serving God through the youth ministry of PCEA Nanyuki Town Church.",
};

export const viewport: Viewport = {
  themeColor: "#0F2A47",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "12px",
              border: "1px solid var(--color-cream-300)",
            },
          }}
        />
      </body>
    </html>
  );
}
