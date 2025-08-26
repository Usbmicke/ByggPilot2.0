import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-gray-300">
      {children}
    </div>
  );
}
