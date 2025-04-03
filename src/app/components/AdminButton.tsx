"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const AdminButton: React.FC = () => {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Check if we're on localhost
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      setIsLocalhost(true);
    }
  }, []);

  if (!isLocalhost) return null;

  return (
    <div className="mt-4">
      <Link
        href="/admin/statistics"
        className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Admin View
      </Link>
    </div>
  );
};

export default AdminButton;
