export function wordCounter(script, minCountThreshold) {
  const words = script.toLowerCase().split(/\s+/);
  const wordCounts = {};
  
  words.forEach(word => {
    if (word) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  // Filter words below threshold
  const filteredCounts = {};
  Object.entries(wordCounts).forEach(([word, count]) => {
    if (count >= minCountThreshold) {
      filteredCounts[word] = count;
    }
  });

  return { wordCounts: filteredCounts };
}
