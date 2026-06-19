"use client";

import React from "react";

interface ConfidenceTagProps {
  tag: string;
  color: string;
  size?: "sm" | "md";
}

export default function ConfidenceTag({ tag, color, size = "sm" }: ConfidenceTagProps) {
  const tagClass = color === "green" ? "tag-green" : color === "blue" ? "tag-blue" : "tag-yellow";
  const sizeClass = size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]";

  return (
    <span className={`${tagClass} ${sizeClass} rounded-md font-medium inline-block`}>
      {tag}
    </span>
  );
}
