import { expect } from 'chai';
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

      expect(result).to.include('Word Counts:');
      expect(result).to.include('test: 5');
      expect(result).to.include('example: 3');
      expect(result).to.include('Transcript Analysis:');
      expect(result).to.include('A test summary');
      expect(result).to.include('Point 1');
      expect(result).to.include('Point 2');
      expect(result).to.include('Neutral sentiment');
      expect(result).to.include('Keywords:');
    });
  });

  describe('formatAsYaml', () => {
    it('should format data as valid YAML with correct structure', () => {
      const result = formatAsYaml(transcriptAnalysis, wordCounts);
      const parsedYaml = yaml.load(result);

      expect(parsedYaml).to.have.property('word_counts');
      expect(parsedYaml.word_counts).to.deep.equal({ "test": 5, "example": 3 });
      
      expect(parsedYaml).to.have.property('transcript_analysis');
      expect(parsedYaml.transcript_analysis.quick_summary).to.equal('A test summary');
      expect(parsedYaml.transcript_analysis.bullet_point_highlights).to.deep.equal(['Point 1', 'Point 2']);
      expect(parsedYaml.transcript_analysis.sentiment_analysis).to.equal('Neutral sentiment');
      expect(parsedYaml.transcript_analysis.keywords).to.deep.equal(['test', 'example']);
    });
  });

  describe('formatAsHtml', () => {
    it('should format data as HTML with expected elements and structure', () => {
      const result = formatAsHtml(transcriptAnalysis, wordCounts);

      // Check basic HTML structure
      expect(result).to.include('<!DOCTYPE html>');
      expect(result).to.include('<html>');
      expect(result).to.include('<body>');
      expect(result).to.include('</body>');
      expect(result).to.include('</html>');

      // Check content elements
      expect(result).to.include('<h2>Word Counts</h2>');
      expect(result).to.include('<table border=\'1\'>');
      expect(result).to.include('<td>test</td><td>5</td>');
      expect(result).to.include('<td>example</td><td>3</td>');
      expect(result).to.include('A test summary');
      expect(result).to.include('Point 1');
      expect(result).to.include('Point 2');
      expect(result).to.include('Neutral sentiment');
      expect(result).to.include('test');
      expect(result).to.include('example');
    });
  });

  describe('formatAsHtmlWithSliderFilter', () => {
    it('should format data as HTML with slider and expected elements', () => {
      const result = formatAsHtmlWithSliderFilter(transcriptAnalysis, wordCounts);

      // Check HTML structure and slider elements
      expect(result).to.include('<input type=\'range\'');
      expect(result).to.include('id=\'wordCountSlider\'');
      expect(result).to.include('data-count=\'5\'');
      expect(result).to.include('data-count=\'3\'');
      
      // Check content elements
      expect(result).to.include('<td>test</td>');
      expect(result).to.include('<td>example</td>');
      
      // Check JavaScript functionality
      expect(result).to.include('<script>');
      expect(result).to.include('addEventListener');
      expect(result).to.include('</script>');
    });
  });
});
