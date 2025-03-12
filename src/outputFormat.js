export function formatAsStr(transcriptAnalysis, wordCounts) {
  // Basic text format
  return `Word Counts:\n${JSON.stringify(wordCounts, null, 2)}\n\nAnalysis:\n${JSON.stringify(transcriptAnalysis, null, 2)}`;
}

export function formatAsJson(transcriptAnalysis, wordCounts) {
  return JSON.stringify({ transcriptAnalysis, wordCounts }, null, 2);
}

export function formatAsMd(transcriptAnalysis, wordCounts) {
  return `# Transcript Analysis\n\n## Word Counts\n${JSON.stringify(wordCounts, null, 2)}\n\n## Analysis\n${JSON.stringify(transcriptAnalysis, null, 2)}`;
}

export function formatAsYaml(transcriptAnalysis, wordCounts) {
  // Basic YAML format
  return `transcriptAnalysis:\n  ${JSON.stringify(transcriptAnalysis, null, 2)}\nwordCounts:\n  ${JSON.stringify(wordCounts, null, 2)}`;
}

export function formatAsHtml(transcriptAnalysis, wordCounts) {
  return `<!DOCTYPE html><html><body><h1>Analysis</h1><pre>${JSON.stringify({ transcriptAnalysis, wordCounts }, null, 2)}</pre></body></html>`;
}

export function formatAsHtmlWithSliderFilter(transcriptAnalysis, wordCounts) {
  return `<!DOCTYPE html><html><body><h1>Analysis with Filter</h1><input type="range" min="0" max="100" value="50"><pre>${JSON.stringify({ transcriptAnalysis, wordCounts }, null, 2)}</pre></body></html>`;
}
