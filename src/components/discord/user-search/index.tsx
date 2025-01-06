"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { ref, get } from "firebase/database";
import { Search, X } from "lucide-react";
import { database } from "@/lib/firebase";
import { LoadingState } from "./loading-state";
import { NoResults } from "./no-results";
import { RecentSearches } from "./recent-searches";
import { SearchResults } from "./search-results";
import { type DiscordUser } from "./types";

const RECENT_SEARCHES_KEY = 'discord_recent_searches';
const MAX_RESULTS = 3;

interface DiscordUserSearchProps {
  onUserSelect: (user: DiscordUser | null) => void;
}

export function DiscordUserSearch({ onUserSelect }: DiscordUserSearchProps) {
  const [searchResults, setSearchResults] = useState<DiscordUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<DiscordUser[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<DiscordUser[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load all users on mount
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const usersRef = ref(database, "discord_roles");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const users = Object.values(snapshot.val()) as DiscordUser[];
          setAllUsers(users);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadAllUsers();
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Create search index
  const searchIndex = useMemo(() => {
    const index = new Map<string, Set<DiscordUser>>();
    
    allUsers.forEach(user => {
      user.searchTokens.forEach((token: string) => {
        if (!index.has(token)) {
          index.set(token, new Set());
        }
        index.get(token)!.add(user);
      });
    });
    
    return index;
  }, [allUsers]);

  // Search function
  const performSearch = useCallback((searchTerm: string) => {
    if (!searchTerm || !allUsers?.length) return [];
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return [];

    const matchingUsers = new Map<string, { user: DiscordUser; score: number }>();
    
    const addUserWithScore = (user: DiscordUser, score: number) => {
      const existing = matchingUsers.get(user.author_id);
      if (!existing || existing.score < score) {
        matchingUsers.set(user.author_id, { user, score });
      }
    };

    // Exact username match
    allUsers.forEach(user => {
      if (user.author_name.toLowerCase() === normalizedSearch) {
        addUserWithScore(user, 100);
      }
    });

    // Token matches
    searchIndex.forEach((users, token) => {
      if (token.includes(normalizedSearch)) {
        users.forEach(user => {
          let score = 0;
          if (token === normalizedSearch) score = 90;
          else if (token.startsWith(normalizedSearch)) score = 80;
          else if (token.endsWith(normalizedSearch)) score = 70;
          else score = 60;
          
          score += (10 - Math.min(token.length - normalizedSearch.length, 10));
          
          addUserWithScore(user, score);
        });
      }
    });

    return Array.from(matchingUsers.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.user.author_name.localeCompare(b.user.author_name);
      })
      .map(item => item.user)
      .slice(0, MAX_RESULTS);
  }, [allUsers, searchIndex]);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setIsLoading(true);
        try {
          const results = performSearch(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching users:", error);
          setError("An error occurred while searching. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }, 100),
    [performSearch]
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setError(null);
    setIsDropdownOpen(true);
    if (value.length > 0) {
      setIsLoading(true);
    }
    debouncedSearch(value);
  }, [debouncedSearch]);

  const updateRecentSearches = useCallback((user: DiscordUser) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(u => u.author_id !== user.author_id);
      const updated = [user, ...filtered].slice(0, MAX_RESULTS);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleUserSelect = useCallback((user: DiscordUser) => {
    onUserSelect(user);
    setIsDropdownOpen(false);
    updateRecentSearches(user);
    setInputValue("");
  }, [onUserSelect, updateRecentSearches]);

  return (
    <div className="relative h-[60px]">
      {/* Container for search with overlay behavior */}
      <div className="absolute inset-x-0 top-0 z-50 overflow-visible">
        {/* Existing search container */}
        <div id="search-container" className="relative">
          <div className={`border rounded-[28px] shadow-sm overflow-hidden ${
            isDropdownOpen ? 'ring-1 ring-border/40' : ''
          }`}>
            <div 
              className="relative flex items-center h-[60px] px-6"
              onClick={() => setIsDropdownOpen(true)}
            >
              <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="w-full h-full pl-9 pr-9 outline-none bg-background text-base placeholder:text-muted-foreground/80"
                placeholder="Search Discord users"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {inputValue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInputChange("");
                  }}
                  className="absolute right-6 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isDropdownOpen && (
              <div>
                <div className="border-t mx-6" />
                
                <div className="bg-background">
                  {error ? (
                    <div className="p-3 text-sm text-destructive">{error}</div>
                  ) : (
                    <>
                      {!inputValue ? (
                        <RecentSearches 
                          recentSearches={recentSearches} 
                          onUserSelect={handleUserSelect} 
                        />
                      ) : isLoading ? (
                        <LoadingState />
                      ) : searchResults.length > 0 ? (
                        <SearchResults 
                          results={searchResults} 
                          onUserSelect={handleUserSelect} 
                        />
                      ) : (
                        <NoResults />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 