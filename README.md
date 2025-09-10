# Deepseek 3.1 has `<think>` token

When requesting a stream from Together AI's `deepseek-v3.1` model with thinking enabled the first chunk is always the string `"<think>"`. This chunk appears in the stream before any reasoning content and it's exists in the messages content chunk.

I think this `"<think>"` chunk is most likely a bug and shouldn't be in the content of the stream.

## Example

```text
$ pnpm tsx examples/together-fetch-streaming.ts
Reading stream
........................................................................................................................................................................
Stream ended, processing buffer
Total chunks: 172
First reasoning chunk position: 3
First reasoning chunk value: H
First content chunk position: 0
First content chunk value: <think>
```

## Setup

Create a `.env` file in the root directory with the following variables:

```env
# .env
TOGETHER_API_KEY=
```

Install dependencies:

```text
pnpm install
```

## Usage

Run each of the following scripts to see the tool call output from the services:

| Command                                         | Description                                 | Streams reasoning                                 |
| ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| `pnpm tsx examples/together-fetch-streaming.ts` | Fetch a streaming response from Together AI | ❌ Content is "`<think>`" before reasoning begins |
