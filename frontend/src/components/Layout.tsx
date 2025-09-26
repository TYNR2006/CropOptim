import { ReactNode } from "react";
import Navbar from "./Navbar";
import AnimatedGradientLine from "./AnimatedGradientLine";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradientLine />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;