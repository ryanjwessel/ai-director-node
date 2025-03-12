import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { wordCounter } from './wordCounter.js';
import { analyzeTranscript } from './llm.js';
import * as chart from './chart.js';
import * as outputFormat from './outputFormat.js';

const program = new Command();

program
  .name('transcript-analyzer')
  .description('CLI tool to analyze transcripts');

program
  .command('temp')
  .description('Display welcome message')
  .action(() => {
    console.log(chalk.bold('Welcome to Let The Code Write Itself!'));
  });

program
  .command('analyze-transcript')
  .description('Analyze a transcript text file')
  .argument('<path-to-script-text-file>', 'Path to the transcript file')
  .option('-m, --min-count-threshold <number>', 'Minimum word count threshold', '10')
  .option('-c, --chart-type <type>', 'Type of chart to generate (bar, pie, line)')
  .option('-o, --output-file <path>', 'Path to the output file')
  .action(async (pathToScriptTextFile, options) => {
    try {
      // Read file
      const script = await fs.readFile(pathToScriptTextFile, 'utf8');

      // Count words
      const wordCounts = wordCounter(script, parseInt(options.minCountThreshold));

      // Run analysis
      const transcriptAnalysis = await analyzeTranscript(script, wordCounts.wordCounts);

      // Print word counts
      console.log(chalk.bold('Word Counts:'));
      Object.entries(wordCounts.wordCounts).forEach(([word, count]) => {
        console.log(`${word}: ${count}`);
      });

      // Print transcript analysis
      console.log('\n' + chalk.bold('Transcript Analysis:'));
      console.log(`Quick Summary:\n${transcriptAnalysis.quickSummary}`);
      console.log('\nBullet Point Highlights:');
      transcriptAnalysis.bulletPointHighlights.forEach(point => {
        console.log(`- ${point}`);
      });
      console.log(`\nSentiment Analysis:\n${transcriptAnalysis.sentimentAnalysis}`);
      console.log('\nKeywords:');
      transcriptAnalysis.keywords.forEach(keyword => {
        console.log(`- ${keyword}`);
      });

      // Generate chart if requested
      if (options.chartType) {
        const chartType = options.chartType.toLowerCase();
        switch (chartType) {
          case 'bar':
            chart.createBarChart(wordCounts);
            console.log('\nBar chart saved as \'bar_chart.png\'');
            break;
          case 'pie':
            chart.createPieChart(wordCounts);
            console.log('\nPie chart saved as \'pie_chart.png\'');
            break;
          case 'line':
            chart.createLineChart(wordCounts);
            console.log('\nLine chart saved as \'line_chart.png\'');
            break;
          case 'radial':
            chart.createRadialBarChart(wordCounts);
            console.log('\nRadial bar chart saved as \'radial_bar_chart.png\'');
            break;
          case 'bubble':
            chart.createBubbleChart(wordCounts);
            console.log('\nBubble chart saved as \'bubble_chart.png\'');
            break;
          default:
            console.log(`\nUnsupported chart type: ${chartType}`);
        }
      }

      // Write to output file if specified
      if (options.outputFile) {
        const ext = path.extname(options.outputFile).toLowerCase();
        let formattedOutput;
        let outputFilePath = options.outputFile;

        switch (ext) {
          case '.txt':
            formattedOutput = outputFormat.formatAsStr(transcriptAnalysis, wordCounts);
            break;
          case '.json':
            formattedOutput = outputFormat.formatAsJson(transcriptAnalysis, wordCounts);
            break;
          case '.md':
            formattedOutput = outputFormat.formatAsMd(transcriptAnalysis, wordCounts);
            break;
          case '.yaml':
          case '.yml':
            formattedOutput = outputFormat.formatAsYaml(transcriptAnalysis, wordCounts);
            break;
          case '.html':
            formattedOutput = outputFormat.formatAsHtml(transcriptAnalysis, wordCounts);
            break;
          case '.htmlsld':
            formattedOutput = outputFormat.formatAsHtmlWithSliderFilter(transcriptAnalysis, wordCounts);
            outputFilePath = options.outputFile.replace('.htmlsld', '.html');
            break;
          default:
            console.log(`\nUnsupported output file format: ${ext}`);
            return;
        }

        await fs.writeFile(outputFilePath, formattedOutput);
        console.log(`\nOutput written to ${outputFilePath}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
