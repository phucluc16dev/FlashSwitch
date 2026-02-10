import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, Info } from 'lucide-react';

function InfoPage() {
  const { t } = useTranslation();

  return (
    <div className="scrollbar-hide container mx-auto h-[calc(100vh-theme(spacing.16))] max-w-4xl space-y-8 overflow-y-auto p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('info.title')}</h2>
        <p className="text-muted-foreground mt-1">{t('info.description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('info.developer')}
            </CardTitle>
            <CardDescription>{t('info.developed_by', { name: 'Tran Phuc Luc' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Flashswitch Manager is designed to help you manage your Google Gemini accounts efficiently.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('info.contact')}</CardTitle>
            <CardDescription>{t('info.join_community')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open('https://t.me/flashswitch_channel', '_blank')}
            >
              <Send className="h-4 w-4 text-blue-500" />
              {t('info.telegram')}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open('https://zalo.me/0367545048', '_blank')}
            >
              <MessageCircle className="h-4 w-4 text-blue-600" />
              {t('info.zalo')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/info')({
  component: InfoPage,
});
