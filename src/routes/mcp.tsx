
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ipc } from '@/ipc/manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/mcp')({
    component: McpPage,
});

function McpPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const key = await ipc.client.mcp.getStitchApiKey();
            if (key) {
                setApiKey(key);
            }
        } catch (error) {
            console.error('Failed to load MCP config:', error);
            toast({
                title: 'Error',
                description: 'Failed to load existing configuration.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a valid API Key.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSaving(true);
            await ipc.client.mcp.updateStitchConfig({ apiKey: apiKey.trim() });
            toast({
                title: 'Success',
                description: 'MCP Stitch configuration saved successfully.',
            });
        } catch (error) {
            console.error('Failed to save MCP config:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-10 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>MCP Stitch Configuration</CardTitle>
                    <CardDescription>
                        Configure Google Stitch MCP integration. Enter your API Key below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Google Stitch API Key</Label>
                        <Input
                            id="api-key"
                            placeholder="Enter your API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            type="password"
                        />
                        <p className="text-sm text-muted-foreground">
                            This key will be saved to your local MCP configuration file.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stitch MCP Commands Guide</CardTitle>
                    <CardDescription>
                        Reference for available Stitch MCP commands and their usage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">1. create_project</h3>
                            <p className="text-sm text-muted-foreground">Creates a new Stitch project. A project is a container for UI designs and frontend code.</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">2. get_project</h3>
                            <p className="text-sm text-muted-foreground">Retrieves the details of a specific Stitch project using its project name.</p>
                            <div className="bg-muted p-2 rounded-md text-xs font-mono">
                                <strong>Input Requirements:</strong><br />
                                - name (string - MANDATORY): The name of the project (format: <code>projects/&#123;project_id&#125;</code>)
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">3. list_projects</h3>
                            <p className="text-sm text-muted-foreground">Lists all Stitch projects accessible to the user.</p>
                            <div className="bg-muted p-2 rounded-md text-xs font-mono">
                                <strong>Input Requirements:</strong><br />
                                - filter (string - OPTIONAL): Defaults to "view=owned".<br />
                                &nbsp;&nbsp;* "view=owned": List projects owned by user.<br />
                                &nbsp;&nbsp;* "view=shared": List projects shared with user.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">4. list_screens</h3>
                            <p className="text-sm text-muted-foreground">Lists all screens within a given Stitch project.</p>
                            <div className="bg-muted p-2 rounded-md text-xs font-mono">
                                <strong>Input Requirements:</strong><br />
                                - project_id (string - MANDATORY): The project ID (format: <code>projects/&#123;project_id&#125;</code>)
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">5. get_screen</h3>
                            <p className="text-sm text-muted-foreground">Retrieves the details of a specific screen within a project.</p>
                            <div className="bg-muted p-2 rounded-md text-xs font-mono">
                                <strong>Input Requirements:</strong><br />
                                - project_id (string - MANDATORY): Project ID (no slashes, e.g., <code>3780309359108792857</code>)<br />
                                - screen_id (string - MANDATORY): Screen ID (no slashes, e.g., <code>88805318abe84d16add098fae3add91e</code>)
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">6. generate_screen_from_text</h3>
                            <p className="text-sm text-muted-foreground">Generates a new screen within a project from a text prompt.</p>
                            <div className="bg-muted p-2 rounded-md text-xs font-mono">
                                <strong>Input Requirements:</strong><br />
                                - project_id (string - MANDATORY): Project ID (no slashes)<br />
                                - prompt (string - MANDATORY): Description of the desired screen<br />
                                - device_type (enum - OPTIONAL): MOBILE (default) or DESKTOP<br />
                                - model_id (enum - OPTIONAL): GEMINI_3_FLASH (default) or GEMINI_3_PRO
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <em>Note: Generation may take a few minutes. If it times out, try <code>get_screen</code> later.</em>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
