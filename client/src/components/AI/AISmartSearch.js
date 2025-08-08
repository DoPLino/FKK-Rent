import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon, SparklesIcon, ClockIcon, 
  LightBulbIcon, XMarkIcon, ArrowUpIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AISmartSearch = ({ onSearch, placeholder = "KI-gestützte Suche...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { isDarkMode } = useDarkMode();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        getSuggestions();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  };

  const saveRecentSearch = (searchTerm) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const getSuggestions = async () => {
    if (query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await aiService.smartSearch(query, {
        context: 'equipment',
        includeRelated: true
      });

      if (response.success) {
        setSuggestions([
          ...response.data.suggestions || [],
          ...response.data.related || []
        ]);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    saveRecentSearch(searchTerm);
    onSearch(searchTerm);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex].text);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
        } rounded-2xl shadow-lg`}
      >
        <div className="flex items-center p-4">
          <div className={`p-2 rounded-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50'
          }`}>
            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={`flex-1 ml-3 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg`}
          />
          
          {isSearching && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full ml-3"
            />
          )}
          
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="ml-3 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch()}
            className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Suchen
          </motion.button>
        </div>
      </motion.div>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-2 ${
              isDarkMode 
                ? 'bg-gray-800/90 backdrop-blur-xl border border-gray-700/50' 
                : 'bg-white/90 backdrop-blur-xl border border-gray-200/50'
            } rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden`}
          >
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-2 mb-3">
                  <LightBulbIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    KI-Empfehlungen
                  </span>
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(suggestion.text)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedIndex === index
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${
                          isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                        }`}>
                          <MagnifyingGlassIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {suggestion.text}
                          </div>
                          {suggestion.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {suggestion.description}
                            </div>
                          )}
                        </div>
                        {suggestion.confidence && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(suggestion.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Letzte Suchen
                  </span>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {search}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch('verfügbare kameras')}
                  className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Verfügbare Kameras
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch('wartung benötigt')}
                  className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Wartung benötigt
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch('überfällige buchungen')}
                  className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Überfällige Buchungen
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch('neue ausrüstung')}
                  className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Neue Ausrüstung
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISmartSearch;
