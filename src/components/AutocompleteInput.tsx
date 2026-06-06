import React from 'react';
import './AutocompleteInput.css';
import { useAutocomplete } from '../hooks/useAutocomplete';

interface AutocompleteInputProps {
  items: { id: string; name: string; type?: string }[];
  placeholder: string;
  onSelect: (item: { id: string; name: string; type?: string } | null) => void;
  label: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ items, placeholder, onSelect, label }) => {
  const {
    query,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    activeIndex,
    containerRef,
    handleInputChange,
    handleSelect,
    handleKeyDown
  } = useAutocomplete({ items, onSelect });

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <label className="autocomplete-label">{label}</label>
      <input
        type="text"
        className="autocomplete-input"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelect(item)}
            >
              <span className="suggestion-name">{item.name}</span>
              {item.type && <span className="suggestion-type">{item.type}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;

