import OpenAI from "openai";

async function testOllama() {
  console.log("=== TEST OLLAMA CONNECTION ===\n");

  const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
  });

  try {
    console.log("1. Testing connection to Ollama...");
    
    const response = await fetch('http://localhost:11434');
    const text = await response.text();
    console.log(`   ✓ Ollama is running: ${text}\n`);

    console.log("2. Testing chat completion with qwen2.5...");
    
    const completion = await client.chat.completions.create({
      model: 'qwen2.5:7b',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond in JSON format.',
        },
        {
          role: 'user',
          content: 'Generate a simple JSON object with fields: name (string), age (number), hobbies (array of strings).',
        },
      ],
      temperature: 0.7,
    });

    console.log("   ✓ Response received:\n");
    const content = completion.choices[0].message.content;
    console.log(content);

    console.log("\n3. Testing JSON parsing...");
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const json = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      console.log("   ✓ Valid JSON parsed:");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("   ✗ Failed to parse JSON:", e.message);
    }

    console.log("\n=== ALL TESTS PASSED ===");
    console.log("\nOllama is ready to generate training plans!");
    
  } catch (error) {
    console.error("\n=== TEST FAILED ===\n");
    
    if (error.code === 'ECONNREFUSED') {
      console.error("ERROR: Cannot connect to Ollama");
      console.error("\nPossible solutions:");
      console.error("1. Start Ollama server:");
      console.error("   ollama serve");
      console.error("\n2. Check if Ollama is installed:");
      console.error("   ollama --version");
      console.error("\n3. Install Ollama:");
      console.error("   macOS: brew install ollama");
      console.error("   or visit: https://ollama.com/download");
    } else if (error.message?.includes('model')) {
      console.error("ERROR: Model not found");
      console.error("\nPlease install qwen2.5:7b model:");
      console.error("   ollama pull qwen2.5:7b");
    } else {
      console.error("ERROR:", error.message);
      console.error("\nFull error:");
      console.error(error);
    }
    
    process.exit(1);
  }
}

testOllama();
