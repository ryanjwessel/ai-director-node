export function formatAsStr(transcriptAnalysis, wordCounts) {
  const output = [];

  // Add Word Counts
  output.push("Word Counts:");
  Object.entries(wordCounts.wordCounts).forEach(([word, count]) => {
    output.push(`${word}: ${count}`);
  });

  // Add Transcript Analysis
  output.push("\nTranscript Analysis:");
  output.push(`Quick Summary:\n${transcriptAnalysis.quickSummary}`);

  output.push("\nBullet Point Highlights:");
  transcriptAnalysis.bulletPointHighlights.forEach(point => {
    output.push(`- ${point}`);
  });

  output.push(`\nSentiment Analysis:\n${transcriptAnalysis.sentimentAnalysis}`);

  output.push("\nKeywords:");
  transcriptAnalysis.keywords.forEach(keyword => {
    output.push(`- ${keyword}`);
  });

  return output.join("\n");
}

export function formatAsJson(transcriptAnalysis, wordCounts) {
  const data = {
    word_counts: wordCounts.wordCounts,
    transcript_analysis: {
      quick_summary: transcriptAnalysis.quickSummary,
      bullet_point_highlights: transcriptAnalysis.bulletPointHighlights,
      sentiment_analysis: transcriptAnalysis.sentimentAnalysis,
      keywords: transcriptAnalysis.keywords
    }
  };
  return JSON.stringify(data, null, 4);
}

export function formatAsMd(transcriptAnalysis, wordCounts) {
  const output = [];

  // Add Word Counts
  output.push("## Word Counts");
  Object.entries(wordCounts.wordCounts).forEach(([word, count]) => {
    output.push(`- **${word}**: ${count}`);
  });

  // Add Transcript Analysis
  output.push("\n## Transcript Analysis");
  output.push(`### Quick Summary\n${transcriptAnalysis.quickSummary}`);

  output.push("\n### Bullet Point Highlights");
  transcriptAnalysis.bulletPointHighlights.forEach(point => {
    output.push(`- ${point}`);
  });

  output.push(`\n### Sentiment Analysis\n${transcriptAnalysis.sentimentAnalysis}`);

  output.push("\n### Keywords");
  transcriptAnalysis.keywords.forEach(keyword => {
    output.push(`- ${keyword}`);
  });

  return output.join("\n");
}

export function formatAsYaml(transcriptAnalysis, wordCounts) {
  const data = {
    word_counts: wordCounts.wordCounts,
    transcript_analysis: {
      quick_summary: transcriptAnalysis.quickSummary,
      bullet_point_highlights: transcriptAnalysis.bulletPointHighlights,
      sentiment_analysis: transcriptAnalysis.sentimentAnalysis,
      keywords: transcriptAnalysis.keywords
    }
  };
  
  // Basic YAML formatting
  const yamlLines = [];
  yamlLines.push("word_counts:");
  Object.entries(data.word_counts).forEach(([word, count]) => {
    yamlLines.push(`  ${word}: ${count}`);
  });
  
  yamlLines.push("transcript_analysis:");
  yamlLines.push(`  quick_summary: ${data.transcript_analysis.quick_summary}`);
  
  yamlLines.push("  bullet_point_highlights:");
  data.transcript_analysis.bullet_point_highlights.forEach(point => {
    yamlLines.push(`    - ${point}`);
  });
  
  yamlLines.push(`  sentiment_analysis: ${data.transcript_analysis.sentiment_analysis}`);
  
  yamlLines.push("  keywords:");
  data.transcript_analysis.keywords.forEach(keyword => {
    yamlLines.push(`    - ${keyword}`);
  });
  
  return yamlLines.join("\n");
}

export function formatAsHtml(transcriptAnalysis, wordCounts) {
  const output = [
    "<!DOCTYPE html>",
    "<html>",
    "<body>",
    "<h2>Word Counts</h2>",
    "<table border='1'>",
    "<tr><th>Word</th><th>Count</th></tr>"
  ];

  Object.entries(wordCounts.wordCounts).forEach(([word, count]) => {
    output.push(`<tr><td>${word}</td><td>${count}</td></tr>`);
  });

  output.push("</table>");
  output.push("<h2>Transcript Analysis</h2>");
  output.push(`<h3>Quick Summary</h3><p>${transcriptAnalysis.quickSummary}</p>`);

  output.push("<h3>Bullet Point Highlights</h3><ul>");
  transcriptAnalysis.bulletPointHighlights.forEach(point => {
    output.push(`<li>${point}</li>`);
  });
  output.push("</ul>");

  output.push(`<h3>Sentiment Analysis</h3><p>${transcriptAnalysis.sentimentAnalysis}</p>`);

  output.push("<h3>Keywords</h3><ul>");
  transcriptAnalysis.keywords.forEach(keyword => {
    output.push(`<li>${keyword}</li>`);
  });
  output.push("</ul>");

  output.push("</body></html>");
  return output.join("\n");
}

export function formatAsHtmlWithSliderFilter(transcriptAnalysis, wordCounts) {
  const output = [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    "<title>Word Frequency Analysis</title>",
    "<style>",
    "body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; }",
    "table { width: 100%; border-collapse: collapse; }",
    "th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }",
    "</style>",
    "</head>",
    "<body>",
    "<h1>Word Frequency Analysis</h1>",
    "<div>",
    "<label for='wordCountSlider'>Minimum Word Count: <span id='sliderValue'>0</span></label>",
    "<input type='range' id='wordCountSlider' min='0' max='100' value='0' step='1'>",
    "</div>",
    "<table id='wordCountTable'>",
    "<thead><tr><th>Word</th><th>Count</th></tr></thead>",
    "<tbody>"
  ];

  // Add word count rows with data attributes
  Object.entries(wordCounts.wordCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([word, count]) => {
      output.push(`<tr data-count='${count}'><td>${word}</td><td>${count}</td></tr>`);
    });

  output.push(
    "</tbody>",
    "</table>",
    "<script>",
    "const slider = document.getElementById('wordCountSlider');",
    "const sliderValue = document.getElementById('sliderValue');",
    "const rows = document.querySelectorAll('#wordCountTable tbody tr');",
    "",
    "slider.addEventListener('input', function() {",
    "    const threshold = this.value;",
    "    sliderValue.textContent = threshold;",
    "    rows.forEach(row => {",
    "        const count = parseInt(row.getAttribute('data-count'));",
    "        row.style.display = count >= threshold ? '' : 'none';",
    "    });",
    "});",
    "</script>",
    "</body>",
    "</html>"
  );

  return output.join("\n");
}
