import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is the new centralized Genkit configuration.
// The `ai` object is exported and used by all flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
