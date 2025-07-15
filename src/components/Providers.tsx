'use client'

import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  return (
    <HeroUIProvider
      locale="en-US"
      skipFramerMotionAnimations={true}
    >
      {children}
    </HeroUIProvider>
  );
}
