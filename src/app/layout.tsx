// import { AuthProvider } from '@/lib/contexts/AuthContext'
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import AppNav from "../components/AppNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Real Estate Admin Dashboard",
  description: "Manage your real estate projects and organizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppNav />
          <main className="">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
