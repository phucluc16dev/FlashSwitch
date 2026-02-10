import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ipc } from '@/ipc/manager';
import { Loader2, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function SkillAgentPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [projectPath, setProjectPath] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);
    const [status, setStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSelectProject = async () => {
        try {
            const path = await ipc.client.skill.selectProject();
            if (path) {
                setProjectPath(path);
                setStatus('idle');
            }
        } catch (error) {
            console.error('Failed to select project:', error);
        }
    };

    const handleInstall = async () => {
        if (!projectPath) return;

        setIsInstalling(true);
        setStatus('installing');
        setErrorMessage('');

        try {
            const result = await ipc.client.skill.installKit({ projectPath });
            if (result.success) {
                setStatus('success');
                toast({
                    title: t('skill.status.success'),
                    description: result.message,
                });
            } else {
                setStatus('error');
                setErrorMessage(result.message);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: t('skill.status.error', { message: result.message }),
                });
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Unknown error');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: t('skill.status.error', { message: error.message || 'Unknown error' }),
            });
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <div className="scrollbar-hide container mx-auto h-[calc(100vh-theme(spacing.16))] max-w-4xl space-y-8 overflow-y-auto p-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('skill.title')}</h2>
                <p className="text-muted-foreground mt-1">{t('skill.description')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Setup</CardTitle>
                    <CardDescription>Select your project folder to integrate Agent Skills.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Button onClick={handleSelectProject} variant="outline" disabled={isInstalling}>
                                <FolderOpen className="mr-2 h-4 w-4" />
                                {t('skill.select_project')}
                            </Button>
                            {projectPath && (
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{t('skill.selected_path')}</span> {projectPath}
                                </div>
                            )}
                        </div>

                        {projectPath && (
                            <div className="rounded-md border p-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">
                                        Ready to install <strong>Antigravity Kit</strong> into <code>{projectPath}</code>.
                                    </p>
                                    <Button onClick={handleInstall} disabled={isInstalling}>
                                        {isInstalling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('skill.install')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {status !== 'idle' && (
                            <div className={`flex items-center gap-2 p-4 rounded-md border ${status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' :
                                status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300' :
                                    'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                                }`}>
                                {status === 'installing' && <Loader2 className="h-5 w-5 animate-spin" />}
                                {status === 'success' && <CheckCircle className="h-5 w-5" />}
                                {status === 'error' && <XCircle className="h-5 w-5" />}
                                <div>
                                    <p className="font-medium">
                                        {status === 'installing' && t('skill.status.installing')}
                                        {status === 'success' && t('skill.status.success')}
                                        {status === 'error' && t('skill.status.error', { message: errorMessage })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Why Install Antigravity Kit?</CardTitle>
                    <CardDescription>
                        Unlock the full potential of your development workflow with these powerful agentic capabilities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1 rounded-md">1.</span>
                                Accelerated Development
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Automate repetitive tasks, from project scaffolding to complex refactoring, allowing you to focus on high-value logic.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1 rounded-md">2.</span>
                                Intelligent Routing
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Automatically routes requests to specialized agents (Frontend, Backend, Security) for expert-level handling of every task.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1 rounded-md">3.</span>
                                Best Practices Enforced
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Built-in guidelines for Clean Code, Security, and Performance ensure your codebase remains robust and maintainable.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1 rounded-md">4.</span>
                                Specialized Skills
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Access a library of skills including Database Design, API Patterns, and Mobile Development tailored to your specific needs.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export const Route = createFileRoute('/skill-agent')({
    component: SkillAgentPage,
});
