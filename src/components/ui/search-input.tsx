"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "open";
}

export function SearchInput({ 
  onSearch, 
  placeholder = "Search...", 
  className,
  variant = "default" 
}: SearchInputProps) {
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(variant === "open");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    onSearch(event.target.value);
  };

  const activateInput = () => {
    if (variant === "default") {
      setIsActive(true);
      inputRef.current?.focus();
    }
  };

  const handleBlur = () => {
    if (!input && variant === "default") {
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
        "flex items-center border rounded-lg h-11 bg-muted",
        "transition-[width] duration-100",
        variant === "default" 
          ? isActive 
            ? "w-full bg-background border-foreground" 
            : "w-11 border-transparent cursor-pointer"
          : "w-full border-transparent",
        className
      )}
      onClick={activateInput}
    >
      <MagnifyingGlass
        weight="bold"
        className={cn(
          "w-5 h-4 text-muted-foreground transition-[margin] duration-100",
          variant === "default" ? (
            isActive ? "ml-4" : "mx-auto"
          ) : "ml-4"
        )}
      />
      <div className={cn(
        "transition-[width,opacity] duration-100",
        variant === "default" ? (
          isActive ? "w-full opacity-100" : "w-0 opacity-0"
        ) : "w-full opacity-100"
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