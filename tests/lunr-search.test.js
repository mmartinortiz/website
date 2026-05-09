/**
 * Tests for lunr-search.js functionality
 * Tests the truncateToEndOfSentence function and search behavior
 */

import { describe, it, expect } from "vitest";

/**
 * This function is extracted from lunr-search.js for testing
 * It matches Hugo's own summary logic
 */
function truncateToEndOfSentence(text, minWords) {
  let match;
  let result = "";
  let wordCount = 0;
  const regexp = /(\S+)(\s*)/g;
  while ((match = regexp.exec(text))) {
    wordCount++;
    if (wordCount <= minWords) {
      result += match[0];
    } else {
      const char1 = match[1][match[1].length - 1];
      const char2 = match[2][0];
      if (/[.?!"]/.test(char1) || char2 === "\n") {
        result += match[1];
        break;
      } else {
        result += match[0];
      }
    }
  }
  return result;
}

describe("truncateToEndOfSentence", () => {
  describe("basic truncation", () => {
    it("should return full text if word count is less than minWords", () => {
      const text = "Hello world";
      const result = truncateToEndOfSentence(text, 10);
      expect(result).toBe("Hello world");
    });

    it("should truncate at sentence end after minWords", () => {
      const text = "This is a test. This is another sentence.";
      const result = truncateToEndOfSentence(text, 3);
      expect(result).toBe("This is a test.");
    });

    it("should handle question marks as sentence endings", () => {
      const text = "What is this? This is a test.";
      const result = truncateToEndOfSentence(text, 2);
      expect(result).toBe("What is this?");
    });

    it("should handle exclamation marks as sentence endings", () => {
      const text = "Hello there! How are you?";
      const result = truncateToEndOfSentence(text, 1);
      expect(result).toBe("Hello there!");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = truncateToEndOfSentence("", 10);
      expect(result).toBe("");
    });

    it("should handle single word", () => {
      const result = truncateToEndOfSentence("Hello", 1);
      expect(result).toBe("Hello");
    });

    it("should handle text with no sentence endings", () => {
      const text = "one two three four five six seven eight nine ten";
      const result = truncateToEndOfSentence(text, 3);
      // Should include all words since no sentence boundary found
      expect(result).toBe("one two three four five six seven eight nine ten");
    });

    it("should handle newlines as sentence boundaries", () => {
      const text = "First line\nSecond line";
      const result = truncateToEndOfSentence(text, 1);
      expect(result).toBe("First line");
    });

    it("should handle quotes as sentence endings", () => {
      const text = 'He said "hello" and then left.';
      const result = truncateToEndOfSentence(text, 2);
      expect(result).toBe('He said "hello"');
    });
  });

  describe("minWords parameter", () => {
    it("should respect minWords=0", () => {
      const text = "Hello. World.";
      const result = truncateToEndOfSentence(text, 0);
      expect(result).toBe("Hello.");
    });

    it("should work with large minWords value", () => {
      const text = "Short text.";
      const result = truncateToEndOfSentence(text, 100);
      expect(result).toBe("Short text.");
    });
  });

  describe("whitespace handling", () => {
    it("should preserve spaces between words", () => {
      const text = "Hello world test.";
      const result = truncateToEndOfSentence(text, 2);
      expect(result).toBe("Hello world test.");
    });

    it("should handle multiple spaces", () => {
      const text = "Hello  world.  Test.";
      const result = truncateToEndOfSentence(text, 1);
      expect(result).toBe("Hello  world.");
    });

    it("should handle tabs", () => {
      const text = "Hello\tworld. Test.";
      const result = truncateToEndOfSentence(text, 1);
      expect(result).toBe("Hello\tworld.");
    });
  });
});

describe("Search Results Pluralization", () => {
  // Test the pluralization logic used in search results

  function getResultsMessage(count, term) {
    if (count === 0) {
      return `No results found for "${term}"`;
    } else if (count === 1) {
      return `1 result found for "${term}"`;
    } else {
      return `${count} results found for "${term}"`;
    }
  }

  it('should return "no results" message for zero results', () => {
    const result = getResultsMessage(0, "test");
    expect(result).toBe('No results found for "test"');
  });

  it("should return singular message for one result", () => {
    const result = getResultsMessage(1, "test");
    expect(result).toBe('1 result found for "test"');
  });

  it("should return plural message for multiple results", () => {
    const result = getResultsMessage(5, "test");
    expect(result).toBe('5 results found for "test"');
  });
});
