"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ onSearch, placeholder = "Search...", className }: SearchInputProps) {
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    onSearch(event.target.value);
  };

  const activateInput = () => {
    setIsActive(true);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    if (!input) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center border rounded-lg transition-all duration-100 overflow-hidden cursor-pointer h-11 bg-muted",
        isActive 
          ? "w-full border-foreground bg-background" 
          : "w-11 border-transparent",
        className
      )}
      onClick={activateInput}
    >
      <MagnifyingGlass
        weight="bold"
        className={cn(
          "w-5 h-4 text-muted-foreground",
          isActive ? "ml-4" : "mx-auto"
        )}
      />
      <div className={cn(
        "overflow-hidden transition-opacity duration-50",
        isActive ? "w-full opacity-100" : "w-0 opacity-0"
      )}>
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/50"
          placeholder={placeholder}
          value={input}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
} 