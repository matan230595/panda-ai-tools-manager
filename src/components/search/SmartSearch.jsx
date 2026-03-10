import React, { useState, useEffect } from 'react';
import { Search, Mic, X, Sparkles, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SmartSearch({ onSearch, tools }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, tools]);

  const generateSuggestions = () => {
    const lowerSearch = searchTerm.toLowerCase().trim();

    const scoreTool = (tool) => {
      const name = tool.name?.toLowerCase() || '';
      const description = tool.description?.toLowerCase() || '';
      const tags = (tool.tags || []).join(' ').toLowerCase();
      const features = (tool.features || []).join(' ').toLowerCase();
      const haystack = `${name} ${description} ${tags} ${features}`;

      let score = 0;
      if (name.includes(lowerSearch)) score += 8;
      if (description.includes(lowerSearch)) score += 4;
      if (tags.includes(lowerSearch)) score += 5;
      if (features.includes(lowerSearch)) score += 3;

      const terms = lowerSearch.split(/\s+/).filter(Boolean);
      terms.forEach((term) => {
        if (haystack.includes(term)) score += 2;
      });

      const similarityBase = new Set([...tags.split(/\s+/), ...features.split(/\s+/)]);
      if (terms.some((term) => similarityBase.has(term))) score += 3;

      return score;
    };

    const ranked = tools
      .map((tool) => ({ data: tool, score: scoreTool(tool) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item, index) => ({
        type: index < 3 ? 'tool' : 'semantic',
        data: item.data,
        score: item.score,
      }));

    setSuggestions(ranked);
    setShowSuggestions(true);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('הדפדפן לא תומך בחיפוש קולי');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('מאזין... 🎤');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      onSearch(transcript);
      addToRecentSearches(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('שגיאה בזיהוי קולי');
    };

    recognition.start();
  };

  const addToRecentSearches = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (term) => {
    onSearch(term);
    addToRecentSearches(term);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="חיפוש חכם - נסה 'כלי לעיצוב', 'כתיבת תוכן'..."
          className="pr-10 pl-24"
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleVoiceSearch}
            className={`h-7 w-7 p-0 ${isListening ? 'text-red-500 animate-pulse' : ''}`}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* הצעות */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <Sparkles className="w-4 h-4" />
                תוצאות מומלצות
              </div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchTerm(suggestion.data.name);
                    handleSearch(suggestion.data.name);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 text-right">
                    <div className="font-medium">{suggestion.data.name}</div>
                    <div className="text-xs text-gray-500">{suggestion.data.description?.slice(0, 50)}...</div>
                    {suggestion.type === 'semantic' && <div className="text-[11px] text-indigo-500 mt-1">כלי דומה שכבר קיים אצלך</div>}
                  </div>
                  {suggestion.type === 'semantic' && (
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 ml-1" />
                      AI
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <TrendingUp className="w-4 h-4" />
                חיפושים אחרונים
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchTerm(search);
                    handleSearch(search);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}