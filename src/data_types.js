export class WordCounts {
  constructor(wordCounts = {}) {
    this.wordCounts = wordCounts;
  }
}

export class TranscriptAnalysis {
  constructor(
    quickSummary = '',
    bulletPointHighlights = [],
    sentimentAnalysis = '',
    keywords = []
  ) {
    this.quickSummary = quickSummary;
    this.bulletPointHighlights = bulletPointHighlights;
    this.sentimentAnalysis = sentimentAnalysis;
    this.keywords = keywords;
  }
}
