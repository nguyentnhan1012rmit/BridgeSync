import React, { useMemo } from 'react';
import TranslateTooltip from './TranslateTooltip';

export default function TextHighlighter({ text, glossaryTerms = [] }) {
  const parts = useMemo(() => {
    if (!text || typeof text !== 'string') return [text];
    if (!glossaryTerms || glossaryTerms.length === 0) return [text];

    // Escape special characters for regex
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Sort terms by length descending, so we match longer multi-word terms before short ones
    const sortedTerms = [...glossaryTerms].sort((a, b) => b.baseTerm.length - a.baseTerm.length);
    
    const termsPattern = sortedTerms.map(t => {
      const escaped = escapeRegExp(t.baseTerm);
      // Add word boundaries (\b) only if the term starts/ends with ASCII alphanumeric characters.
      // This prevents matching substrings like "API" inside "CAPITAL".
      // But leaves non-ASCII setups (like Japanese kanji without spaces) unconstrained.
      const prefix = /^[a-zA-Z0-9_]/.test(t.baseTerm) ? '\\b' : '';
      const suffix = /[a-zA-Z0-9_]$/.test(t.baseTerm) ? '\\b' : '';
      return `${prefix}${escaped}${suffix}`;
    }).join('|');
    
    if (!termsPattern) return [text];

    const regex = new RegExp(`(${termsPattern})`, 'gi');
    return text.split(regex);
  }, [text, glossaryTerms]);

  if (!text || typeof text !== 'string') return text;
  if (!glossaryTerms || glossaryTerms.length === 0) return text;

  return (
    <>
      {parts.map((part, i) => {
        // Capturing groups in split() means matches are interleaved with non-matches.
        // We do a case-insensitive find against the glossary terms.
        if (!part) return null; // handle empty string splits cleanly

        const lowerPart = part.toLowerCase();
        const matchedTerm = glossaryTerms.find(
          (t) => t.baseTerm.toLowerCase() === lowerPart
        );

        if (matchedTerm) {
          return (
            <TranslateTooltip 
              key={i} 
              term={matchedTerm.baseTerm} 
              translations={matchedTerm.translations}
            >
              {part}
            </TranslateTooltip>
          );
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
