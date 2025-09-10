import "dotenv/config";

const payload = {
  model: "accounts/fireworks/models/deepseek-v3p1",
  messages: [
    {
      role: "system",
      content: "You are XYZ Chat, an AI assistant created by XYZ AI.",
    },
    {
      role: "user",
      content: "Why is the sky blue?",
    },
  ],
  // from what i can tell fireworks does not have a way to enable
  // reasoning responses with deepseek v3.1
  stream: true,
};

async function main() {
  const response = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env["FIREWORKS_API_KEY"]}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const textDecoder = new TextDecoderStream();

  if (!response.ok) {
    const text = await response.text();
    console.error("Error response:", text);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const readableStream = response.body.pipeThrough(textDecoder);

  console.log("Reading stream");
  let buffer = "";
  for await (const chunk of readableStream) {
    process.stdout.write(".");
    buffer += chunk;
  }

  console.log("\nStream ended, processing buffer");

  let chunks: any[] = [];
  let firstReasoningChunkPosition = -1;
  let firstContentChunkPosition = -1;

  buffer.split("\n").forEach((line) => {
    if (line.startsWith("data: ")) {
      const jsonLine = line.slice(6).trim();
      if (jsonLine === "[DONE]") {
        return;
      }
      try {
        const parsed = JSON.parse(jsonLine);
        chunks.push(parsed);

        const choices = parsed.choices;
        const delta = choices[0]?.delta;
        const reasoning = delta?.reasoning;
        const content = delta?.content;

        if (reasoning && firstReasoningChunkPosition === -1) {
          firstReasoningChunkPosition = chunks.length - 1;
        }

        if (content && firstContentChunkPosition === -1) {
          firstContentChunkPosition = chunks.length - 1;
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Line", jsonLine);
      }
    }
  });

  console.log("Total chunks:", chunks.length);

  console.log("First reasoning chunk position:", firstReasoningChunkPosition);
  if (firstReasoningChunkPosition > -1) {
    const firstReasoningChunk = chunks[firstReasoningChunkPosition];
    console.log(
      "First reasoning chunk value:",
      firstReasoningChunk.choices[0].delta.reasoning,
    );
  }

  console.log("First content chunk position:", firstContentChunkPosition);
  if (firstContentChunkPosition > -1) {
    const firstContentChunk = chunks[firstContentChunkPosition];
    console.log(
      "First content chunk value:",
      firstContentChunk.choices[0].delta.content,
    );
  }
}

main();
