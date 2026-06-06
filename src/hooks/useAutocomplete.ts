import { useState, useEffect, useRef, useMemo } from 'react';

interface AutocompleteItem {
  id: string;
  name: string;
  type?: string;
}

interface UseAutocompleteProps {
  items: AutocompleteItem[];
  onSelect: (item: AutocompleteItem | null) => void;
}

export const useAutocomplete = ({ items, onSelect }: UseAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.trim() === '') {
      return [];
    }

    return items
      .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }, [query, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setActiveIndex(-1);
    onSelect(null);
  };

  const handleSelect = (item: AutocompleteItem) => {
    setQuery(item.name);
    setShowSuggestions(false);
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return {
    query,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    activeIndex,
    containerRef,
    handleInputChange,
    handleSelect,
    handleKeyDown
  };
};

