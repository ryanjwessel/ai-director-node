import yaml from 'js-yaml';
import {
  formatAsStr,
  formatAsYaml,
  formatAsHtml,
  formatAsHtmlWithSliderFilter
} from './outputFormat.js';
import { WordCounts, TranscriptAnalysis } from './data_types.js';

describe('Output Format Tests', () => {
  // Common test data
  const wordCounts = new WordCounts({ "test": 5, "example": 3 });
  const transcriptAnalysis = new TranscriptAnalysis(
    "A test summary",
    ["Point 1", "Point 2"],
    "Neutral sentiment",
    ["test", "example"]
  );

  describe('formatAsStr', () => {
    it('should format data as a string with expected elements', () => {
      const result = formatAsStr(transcriptAnalysis, wordCounts);

      expect(result).toContain('Word Counts:');
      expect(result).toContain('test: 5');
      expect(result).toContain('example: 3');
      expect(result).toContain('Transcript Analysis:');
      expect(result).toContain('A test summary');
      expect(result).toContain('Point 1');
      expect(result).toContain('Point 2');
      expect(result).toContain('Neutral sentiment');
      expect(result).toContain('Keywords:');
    });
  });

  describe('formatAsYaml', () => {
    it('should format data as valid YAML with correct structure', () => {
      const result = formatAsYaml(transcriptAnalysis, wordCounts);
      const parsedYaml = yaml.load(result);

      expect(parsedYaml).toHaveProperty('word_counts');
      expect(parsedYaml.word_counts).toEqual({ "test": 5, "example": 3 });
      
      expect(parsedYaml).toHaveProperty('transcript_analysis');
      expect(parsedYaml.transcript_analysis.quick_summary).toBe('A test summary');
      expect(parsedYaml.transcript_analysis.bullet_point_highlights).toEqual(['Point 1', 'Point 2']);
      expect(parsedYaml.transcript_analysis.sentiment_analysis).toBe('Neutral sentiment');
      expect(parsedYaml.transcript_analysis.keywords).toEqual(['test', 'example']);
    });
  });

  describe('formatAsHtml', () => {
    it('should format data as HTML with expected elements and structure', () => {
      const result = formatAsHtml(transcriptAnalysis, wordCounts);

      // Check basic HTML structure
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<body>');
      expect(result).toContain('</body>');
      expect(result).toContain('</html>');

      // Check content elements
      expect(result).toContain('<h2>Word Counts</h2>');
      expect(result).toContain('<table border=\'1\'>');
      expect(result).toContain('<td>test</td><td>5</td>');
      expect(result).toContain('<td>example</td><td>3</td>');
      expect(result).toContain('A test summary');
      expect(result).toContain('Point 1');
      expect(result).toContain('Point 2');
      expect(result).toContain('Neutral sentiment');
      expect(result).toContain('test');
      expect(result).toContain('example');
    });
  });

  describe('formatAsHtmlWithSliderFilter', () => {
    it('should format data as HTML with slider and expected elements', () => {
      const result = formatAsHtmlWithSliderFilter(transcriptAnalysis, wordCounts);

      // Check HTML structure and slider elements
      expect(result).toContain('<input type=\'range\'');
      expect(result).toContain('id=\'wordCountSlider\'');
      expect(result).toContain('data-count=\'5\'');
      expect(result).toContain('data-count=\'3\'');
      
      // Check content elements
      expect(result).toContain('<td>test</td>');
      expect(result).toContain('<td>example</td>');
      
      // Check JavaScript functionality
      expect(result).toContain('<script>');
      expect(result).toContain('addEventListener');
      expect(result).toContain('</script>');
    });
  });
});
