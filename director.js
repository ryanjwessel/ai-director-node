const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { OpenAI } = require('openai');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class EvaluationResult {
  constructor(success, feedback = null) {
    this.success = success;
    this.feedback = feedback;
  }
}

class Director {
  constructor(configPath) {
    this.config = this.validateConfig(configPath);
    this.llmClient = new OpenAI();
  }

  validateConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const configDict = yaml.load(fs.readFileSync(configPath, 'utf8'));

    // If prompt ends with .md, read content from that file
    if (configDict.prompt.endsWith('.md')) {
      const promptPath = configDict.prompt;
      if (!fs.existsSync(promptPath)) {
        throw new Error(`Prompt file not found: ${promptPath}`);
      }
      configDict.prompt = fs.readFileSync(promptPath, 'utf8');
    }

    // Validate evaluator_model
    const allowedEvaluatorModels = ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'o1-preview'];
    if (!allowedEvaluatorModels.includes(configDict.evaluator_model)) {
      throw new Error(`evaluator_model must be one of ${allowedEvaluatorModels}, got ${configDict.evaluator_model}`);
    }

    // Validate we have at least 1 editable file
    if (!configDict.context_editable?.length) {
      throw new Error('At least one editable context file must be specified');
    }

    // Validate all paths exist
    for (const filePath of configDict.context_editable) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Editable context file not found: ${filePath}`);
      }
    }

    for (const filePath of configDict.context_read_only || []) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Read-only context file not found: ${filePath}`);
      }
    }

    return configDict;
  }

  parseLlmJsonResponse(str) {
    if (!str.includes('```')) {
      str = str.trim();
      this.fileLog(`raw pre-json-parse: ${str}`, false);
      return str;
    }

    // Remove opening backticks and language identifier
    str = str.split('```')[1].split('\n').slice(1).join('\n');

    // Remove closing backticks
    str = str.split('```')[0];

    str = str.trim();

    this.fileLog(`post-json-parse: ${str}`, false);
    return str;
  }

  fileLog(message, printMessage = true) {
    if (printMessage) {
      console.log(message);
    }
    fs.appendFileSync('director_log.txt', message + '\n');
  }

  createNewAiCodingPrompt(iteration, baseInputPrompt, executionOutput, evaluation) {
    if (iteration === 0) {
      return baseInputPrompt;
    }

    return `
# Generate the next iteration of code to achieve the user's desired result based on their original instructions and the feedback from the previous attempt.
> Generate a new prompt in the same style as the original instructions for the next iteration of code.

## This is your ${iteration}th attempt to generate the code.
> You have ${this.config.max_iterations - iteration} attempts remaining.

## Here's the user's original instructions for generating the code:
${baseInputPrompt}

## Here's the output of your previous attempt:
${executionOutput}

## Here's feedback on your previous attempt:
${evaluation.feedback}`;
  }

  async aiCode(prompt) {
    // Implementation would depend on your AI coding system
    // This is a placeholder that would need to be connected to your actual AI coding system
    console.log('AI Code generation would happen here with prompt:', prompt);
  }

  async execute() {
    try {
      const { stdout, stderr } = await execAsync(this.config.execution_command);
      const output = stdout + stderr;
      this.fileLog(`Execution output: \n${output}`, false);
      return output;
    } catch (error) {
      return error.message;
    }
  }

  async evaluate(executionOutput) {
    if (this.config.evaluator !== 'default') {
      throw new Error(`Custom evaluator ${this.config.evaluator} not implemented`);
    }

    const mapEditableFnamesToFiles = {};
    for (const fname of this.config.context_editable) {
      mapEditableFnamesToFiles[path.basename(fname)] = fs.readFileSync(fname, 'utf8');
    }

    const mapReadOnlyFnamesToFiles = {};
    for (const fname of this.config.context_read_only || []) {
      mapReadOnlyFnamesToFiles[path.basename(fname)] = fs.readFileSync(fname, 'utf8');
    }

    const evaluationPrompt = `Evaluate this execution output and determine if it was successful based on the execution command, the user's desired result, the editable files, checklist, and the read-only files.

## Checklist:
- Is the execution output reporting success or failure?
- Did we miss any tasks? Review the User's Desired Result to see if we have satisfied all tasks.
- Did we satisfy the user's desired result?
- Ignore warnings

## User's Desired Result:
${this.config.prompt}

## Editable Files:
${JSON.stringify(mapEditableFnamesToFiles, null, 2)}

## Read-Only Files:
${JSON.stringify(mapReadOnlyFnamesToFiles, null, 2)}

## Execution Command:
${this.config.execution_command}
                                        
## Execution Output:
${executionOutput}

## Response Format:
> Be 100% sure to output JSON.parse compatible JSON.
> That means no new lines.

Return a structured JSON response with the following structure: {
    success: bool - true if the execution output generated by the execution command matches the Users Desired Result
    feedback: str | null - if unsuccessful, provide detailed feedback explaining what failed and how to fix it, or null if successful
}`;

    this.fileLog(`Evaluation prompt: (${this.config.evaluator_model}):\n${evaluationPrompt}`, false);

    try {
      const completion = await this.llmClient.chat.completions.create({
        model: this.config.evaluator_model,
        messages: [
          {
            role: 'user',
            content: evaluationPrompt,
          },
        ],
      });

      const response = completion.choices[0].message.content;
      this.fileLog(`Evaluation response: (${this.config.evaluator_model}):\n${response}`, false);

      const parsedResponse = JSON.parse(this.parseLlmJsonResponse(response));
      return new EvaluationResult(parsedResponse.success, parsedResponse.feedback);
    } catch (error) {
      this.fileLog(`Error evaluating execution output: ${error.message}`);
      throw error;
    }
  }

  async direct() {
    let evaluation = new EvaluationResult(false);
    let executionOutput = '';
    let success = false;

    for (let i = 0; i < this.config.max_iterations; i++) {
      this.fileLog(`\nIteration ${i + 1}/${this.config.max_iterations}`);

      this.fileLog('🧠 Creating new prompt...');
      const newPrompt = this.createNewAiCodingPrompt(
        i,
        this.config.prompt,
        executionOutput,
        evaluation
      );

      this.fileLog('🤖 Generating AI code...');
      await this.aiCode(newPrompt);

      this.fileLog(`💻 Executing code... '${this.config.execution_command}'`);
      executionOutput = await this.execute();

      this.fileLog(`🔍 Evaluating results... '${this.config.evaluator_model}' + '${this.config.evaluator}'`);
      evaluation = await this.evaluate(executionOutput);

      this.fileLog(`🔍 Evaluation result: ${evaluation.success ? '✅ Success' : '❌ Failed'}`);
      if (evaluation.feedback) {
        this.fileLog(`💬 Feedback: \n${evaluation.feedback}`);
      }

      if (evaluation.success) {
        success = true;
        this.fileLog(`\n🎉 Success achieved after ${i + 1} iterations! Breaking out of iteration loop.`);
        break;
      } else {
        this.fileLog(`\n🔄 Continuing with next iteration... Have ${this.config.max_iterations - i - 1} attempts remaining.`);
      }
    }

    if (!success) {
      this.fileLog('\n🚫 Failed to achieve success within the maximum number of iterations.');
    }

    this.fileLog('\nDone.');
  }
}

// Command line interface
if (require.main === module) {
  const configPath = process.argv[2] || 'specs/basic.yaml';
  const director = new Director(configPath);
  director.direct().catch(console.error);
}

module.exports = Director;
