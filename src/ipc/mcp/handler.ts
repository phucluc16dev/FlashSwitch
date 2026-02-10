
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

const MCP_CONFIG_PATH = path.join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json');

export interface McpConfig {
    mcpServers: {
        [key: string]: {
            serverUrl?: string; // Some might use command/args
            command?: string;
            args?: string[];
            headers?: {
                [key: string]: string;
            };
            disabled?: boolean;
            autoApprove?: string[];
            [key: string]: any;
        };
    };
}

export async function getMcpConfig(): Promise<McpConfig | null> {
    try {
        const content = await fs.readFile(MCP_CONFIG_PATH, 'utf-8');
        return JSON.parse(content) as McpConfig;
    } catch (error) {
        // If file doesn't exist, return null so we can handle it (create new or show empty)
        return null;
    }
}

export async function updateStitchConfig(apiKey: string): Promise<void> {
    let config: McpConfig = { mcpServers: {} };

    try {
        const existingConfig = await getMcpConfig();
        if (existingConfig) {
            config = existingConfig;
        }
    } catch (e) {
        // Ignore error, start with empty config
    }

    // Ensure mcpServers object exists
    if (!config.mcpServers) {
        config.mcpServers = {};
    }

    // Update or set the stitch config
    config.mcpServers['stitch'] = {
        serverUrl: 'https://stitch.googleapis.com/mcp',
        headers: {
            'X-Goog-Api-Key': apiKey,
        },
    };

    // Ensure directory exists
    const dir = path.dirname(MCP_CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
