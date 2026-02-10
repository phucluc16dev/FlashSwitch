
import { os } from '@orpc/server';
import { z } from 'zod';
import { getMcpConfig, updateStitchConfig } from './handler';

export const mcpRouter = os.router({
    getStitchApiKey: os.output(z.string().nullable()).handler(async () => {
        const config = await getMcpConfig();
        return config?.mcpServers?.['stitch']?.headers?.['X-Goog-Api-Key'] || null;
    }),

    updateStitchConfig: os.input(z.object({ apiKey: z.string() })).handler(async ({ input }) => {
        await updateStitchConfig(input.apiKey);
    }),
});
