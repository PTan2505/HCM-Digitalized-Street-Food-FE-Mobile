import { defineConfig } from 'orval';

const mutatorConfig = {
  path: './src/lib/api/orvalMutator.ts',
  name: 'orvalMutator',
} as const;

/**
 * Orval code-generation configuration.
 *
 * Each section targets one unimplemented feature from openspec/ and outputs to
 * the corresponding feature slice directory (Feature-Sliced Design).
 *
 * Run: `bun generate`
 *
 * Generated files:
 *   src/features/<feature>/api/generated.ts  — typed async axios service functions
 *   src/features/<feature>/types/generated/  — TypeScript model interfaces
 *
 * Usage in Redux thunks:
 *   import { getGroupSession } from '@features/group-ordering/api/generated';
 *   export const fetchSessionThunk = createAppAsyncThunk('groupOrdering/fetchSession',
 *     async (sessionId: string, { rejectWithValue }) => {
 *       try { return await getGroupSession(sessionId); }
 *       catch (e) { return rejectWithValue(e); }
 *     });
 */
export default defineConfig({
  groupOrdering: {
    input: {
      target: './openapi.json',
      filters: {
        tags: ['GroupOrdering'],
      },
    },
    output: {
      target: './src/features/group-ordering/api/generated.ts',
      schemas: './src/features/group-ordering/types/generated',
      client: 'axios',
      override: {
        mutator: mutatorConfig,
      },
    },
  },

  vendorVerification: {
    input: {
      target: './openapi.json',
      filters: {
        tags: ['VendorVerification'],
      },
    },
    output: {
      target: './src/features/vendor-verification/api/generated.ts',
      schemas: './src/features/vendor-verification/types/generated',
      client: 'axios',
      override: {
        mutator: mutatorConfig,
      },
    },
  },

  reputation: {
    input: {
      target: './openapi.json',
      filters: {
        tags: ['Reputation'],
      },
    },
    output: {
      target: './src/features/reputation/api/generated.ts',
      schemas: './src/features/reputation/types/generated',
      client: 'axios',
      override: {
        mutator: mutatorConfig,
      },
    },
  },

  platformEconomy: {
    input: {
      target: './openapi.json',
      filters: {
        tags: ['PlatformEconomy'],
      },
    },
    output: {
      target: './src/features/platform-economy/api/generated.ts',
      schemas: './src/features/platform-economy/types/generated',
      client: 'axios',
      override: {
        mutator: mutatorConfig,
      },
    },
  },

  campaigns: {
    input: {
      target: './openapi.json',
      filters: {
        tags: ['Campaigns'],
      },
    },
    output: {
      target: './src/features/campaigns/api/generated.ts',
      schemas: './src/features/campaigns/types/generated',
      client: 'axios',
      override: {
        mutator: mutatorConfig,
      },
    },
  },
});
