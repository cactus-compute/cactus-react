![Cactus Logo](assets/logo.png)

Official React-Native plugin for Cactus, a framework for deploying LLM/VLM/TTS models locally in your app. Requires iOS 12.0+, Android API 24+ and Yarn. For iOS apps, ensure you have cocoapods or install with `brew install cocoapods`. For Android apps, you need Java 17 installed. Expo is strongly recommended.

## Resources
[![cactus](https://img.shields.io/badge/cactus-000000?logo=github&logoColor=white)](https://github.com/cactus-compute/cactus) [![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/Cactus-Compute/models?sort=downloads) [![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/bNurx3AXTJ) [![Documentation](https://img.shields.io/badge/Documentation-4285F4?logo=googledocs&logoColor=white)](https://cactuscompute.com/docs/react-native)

## Installation
Execute the following command in your project terminal:
```bash
npm install cactus-react-native 
# or 
yarn add cactus-react-native
```
*N/B*: To build locally or use this repo, see instructions in `example/README.md`

## Text Completion
```typescript
import { CactusLM } from 'cactus-react-native';

const { lm, error } = await CactusLM.init({
    model: '/path/to/model.gguf', // this is a local model file inside the app sandbox
    n_ctx: 2048,
});

const messages = [{ role: 'user', content: 'Hello!' }];
const params = { n_predict: 100, temperature: 0.7 };
const response = await lm.completion(messages, params);
```
## Embeddings
 ```typescript
import { CactusLM } from 'cactus-react-native';

const { lm, error } = await CactusLM.init({
    model: '/path/to/model.gguf', // local model file inside the app sandbox
    n_ctx: 2048,
    embedding: true,
});

const text = 'Your text to embed';
const params = { normalize: true };
const result = await lm.embedding(text, params);
```
## Visual Language Models
```typescript
import { CactusVLM } from 'cactus-react-native';

const { vlm, error } = await CactusVLM.init({
    model: '/path/to/vision-model.gguf', // local model file inside the app sandbox
    mmproj: '/path/to/mmproj.gguf', // local model file inside the app sandbox
});

const messages = [{ role: 'user', content: 'Describe this image' }];

const params = {
    images: ['/absolute/path/to/image.jpg'],
    n_predict: 200,
    temperature: 0.3,
};

const response = await vlm.completion(messages, params);
```
## Cloud Fallback
```typescript
const { lm } = await CactusLM.init({
  model: '/path/to/model.gguf',
  n_ctx: 2048,
}, undefined, 'your_cactus_token');

// Try local first, fallback to cloud if local fails (its blazing fast)
const embedding = await lm.embedding('text', undefined, 'localfirst');

// local (default): strictly only run on-device
// localfirst: fallback to cloud if device fails
// remotefirst: primarily remote, run local if API fails
// remote: strictly run on cloud
```

## Agents
```typescript
import { CactusAgent } from 'cactus-react-native';

// we recommend Qwen 3 family, 0.6B is great
const { agent, error } = await CactusAgent.init({
    model: '/path/to/model.gguf',
    n_ctx: 2048,
});

const weatherTool = agent.addTool(
    (location: string) => `Weather in ${location}: 72°F, sunny`,
    'Get current weather for a location',
    {
        location: { type: 'string', description: 'City name', required: true }
    }
);

const messages = [{ role: 'user', content: 'What\'s the weather in NYC?' }];
  const result = await agent.completionWithTools(messages, {
  n_predict: 200,
  temperature: 0.7,
});

await agent.release();
```