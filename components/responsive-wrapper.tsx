"use client";

import { useEffect, useState } from "react";

interface ResponsiveWrapperProps {
  mobileContent: React.ReactNode;
  desktopContent: React.ReactNode;
}

export const ResponsiveWrapper = ({
  mobileContent,
  desktopContent,
}: ResponsiveWrapperProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // check on mount and on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? mobileContent : desktopContent;
};
