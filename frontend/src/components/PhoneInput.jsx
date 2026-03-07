import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+977', iso: 'NP', flag: '🇳🇵', name: 'Nepal' },
  { code: '+81', iso: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+61', iso: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', iso: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', iso: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+82', iso: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+66', iso: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+63', iso: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+60', iso: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65', iso: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+62', iso: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+84', iso: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+880', iso: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', iso: 'LK', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+971', iso: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+49', iso: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', iso: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', iso: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', iso: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+7', iso: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', iso: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', iso: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+64', iso: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+27', iso: 'ZA', flag: '🇿🇦', name: 'South Africa' },
];

export default function PhoneInput({ value, onChange, required = false, className = '' }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Parse initial value to detect country code
  useEffect(() => {
    if (value) {
      const match = COUNTRY_CODES.find(c => value.startsWith(c.code));
      if (match) setSelectedCountry(match);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');
    // Update the phone value with new country code
    const numberPart = value.replace(/^\+\d+\s*/, '');
    onChange(country.code + ' ' + numberPart);
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    onChange(selectedCountry.code + ' ' + input);
  };

  // Get just the number part without country code
  const numberPart = value.replace(new RegExp(`^\\${selectedCountry.code}\\s*`), '');

  return (
    <div className={`relative flex h-12 rounded-xl border border-gray-200 bg-[#faf8f5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c9a962]/20 focus-within:border-[#c9a962] transition-all ${className}`}>
      {/* Country code selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-full px-3 border-r border-gray-200 hover:bg-gray-50 rounded-l-xl transition-colors"
        >
          <span className="text-lg leading-none">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c9a962]"
                />
              </div>
            </div>
            {/* Country list */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((country) => (
                <button
                  key={country.iso}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#faf8f5] transition-colors ${
                    selectedCountry.iso === country.iso ? 'bg-[#1e3a5f]/5 font-medium' : ''
                  }`}
                >
                  <span className="text-lg leading-none">{country.flag}</span>
                  <span className="text-gray-800 flex-1 text-left">{country.name}</span>
                  <span className="text-gray-400 text-xs">{country.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">No countries found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        value={numberPart}
        onChange={handlePhoneChange}
        placeholder="00-0000-0000"
        required={required}
        className="flex-1 px-3 bg-transparent text-sm focus:outline-none"
      />
    </div>
  );
}
