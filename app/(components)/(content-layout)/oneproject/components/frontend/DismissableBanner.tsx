"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link"; // Assuming you're using Next.js

interface DismissableBannerProps {
  message: string;
  variant?: "info" | "warning" | "success" | "error";
  link?: {
    text: string;
    href: string;
  };
}

const DismissableBanner: React.FC<DismissableBannerProps> = ({
  message,
  variant = "info",
  link,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantStyles = {
    info: "bg-blue-100 text-blue-800 border-blue-500",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-500",
    success: "bg-green-100 text-green-800 border-green-500",
    error: "bg-red-100 text-red-800 border-red-500",
  };

  const linkStyles = {
    info: "text-blue-600 hover:text-blue-800",
    warning: "text-yellow-600 hover:text-yellow-800",
    success: "text-green-600 hover:text-green-800",
    error: "text-red-600 hover:text-red-800",
  };

  return (
    <div
      className={`w-1/2 ml-4 mt-4 px-4 py-3 rounded relative border-l-4 ${variantStyles[variant]}`}
      role="alert"
    >
      <span className="block sm:inline">
        {message}
        {link && (
          <>
            {" "}
            <Link
              href={link.href}
              className={`font-medium underline ${linkStyles[variant]}`}
            >
              {link.text}
            </Link>
          </>
        )}
      </span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-900 transition-colors duration-200 focus:outline-none"
        >
          <X size={16} />
          <span className="sr-only">Close</span>
        </button>
      </span>
    </div>
  );
};

export default DismissableBanner;
