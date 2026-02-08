"use client"

import React, { useState, useRef, useEffect } from 'react';
import {  ExternalLink } from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
  external?: boolean;
}

const dropdownItems: DropdownItem[] = [
  {
    label: 'Demo Agent',
    href: 'https://euk6nt5mhm.ap-southeast-1.awsapprunner.com/',
    external: true,
  }, 
  {
    label: 'GitHub',
    href: 'https://github.com/pisuthd/kilomarket',
    external: true,
  }
];

export default function MoreDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      > 
        <span>More</span>
        <svg 
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
            <div className="p-1">
              {dropdownItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : '_self'}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span>{item.label}</span>
                  {item.external && (
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}