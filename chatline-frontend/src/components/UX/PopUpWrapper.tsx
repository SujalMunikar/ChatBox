import React, { useEffect, useRef, ReactNode } from "react";

// Generic click-outside aware wrapper used for dropdowns/popovers.

interface PopupWrapperProps {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: any;
  className?: string;
  controllerRef: any;
}

const PopupWrapper: React.FC<PopupWrapperProps> = ({
  children,
  isOpen,
  setIsOpen,
  className,
  controllerRef,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    console.log(
      isOpen,
      controllerRef.current,
      controllerRef.current.contains(event.target as Node)
    );
    if (
      controllerRef.current &&
      controllerRef.current.contains(event.target as Node)
    )
      return;
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
};

export default PopupWrapper;
