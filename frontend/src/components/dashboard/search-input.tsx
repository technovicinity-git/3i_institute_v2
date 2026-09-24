"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 max-w-[400px]">
      <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-[#0C1F33] placeholder:text-[#94A3B8] outline-none w-full"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-[#94A3B8] hover:text-[#0C1F33] shrink-0"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
