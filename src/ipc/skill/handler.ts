import { os } from '@orpc/server';
import { z } from 'zod';
import { dialog } from 'electron';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as osNative from 'os';

const execAsync = promisify(exec);

export const skillHandler = os.router({
    // Open directory selection dialog
    selectProject: os.output(z.string().nullable()).handler(async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Project Directory',
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    }),

    // Install Antigravity Kit into the target project
    installKit: os.input(z.object({ projectPath: z.string() })).output(z.object({ success: z.boolean(), message: z.string() })).handler(async ({ input }) => {
        const { projectPath } = input;

        if (!fs.existsSync(projectPath)) {
            throw new Error('Project path does not exist');
        }

        const tempDir = path.join(osNative.tmpdir(), `ag-kit-${Date.now()}`);
        const repoUrl = 'https://github.com/vudovn/antigravity-kit.git';

        try {
            // Check for git
            try {
                await execAsync('git --version');
            } catch (e) {
                throw new Error('Git is not installed or not in PATH.');
            }

            // Clone repo to temp dir
            await execAsync(`git clone ${repoUrl} "${tempDir}"`);

            const sourceAgentDir = path.join(tempDir, '.agent');
            const targetAgentDir = path.join(projectPath, '.agent');

            if (!fs.existsSync(sourceAgentDir)) {
                throw new Error('The cloned repository does not contain an .agent directory.');
            }

            // Copy .agent folder
            await fs.promises.cp(sourceAgentDir, targetAgentDir, { recursive: true, force: true });

            // Clean up temp dir
            await fs.promises.rm(tempDir, { recursive: true, force: true });

            return { success: true, message: 'Antigravity Kit installed successfully.' };

        } catch (error: any) {
            // Clean up temp dir in case of error
            if (fs.existsSync(tempDir)) {
                await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => { });
            }
            console.error('Failed to install kit:', error);
            throw new Error(`Installation failed: ${error.message}`);
        }
    }),
});
