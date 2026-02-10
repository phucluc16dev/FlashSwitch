import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Star, Zap, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Define plans locally or import if available
// Plan 1 (Pro) : 35K/ 1 tháng / 1 Email 
// Plan 2 (Pro+): 190K / 6 tháng / 2 Email
// Plan 3 (Pro Vip) : 1 năm 420K / 3 email
const PLANS = [
    {
        id: 'pro',
        name: 'Pro',
        price: 35000,
        duration: '1 Month',
        emailLimit: 1,
        icon: Star,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
    },
    {
        id: 'pro_plus',
        name: 'Pro+',
        price: 190000,
        duration: '6 Months',
        emailLimit: 2,
        recommended: true,
        icon: Zap,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
    },
    {
        id: 'pro_vip',
        name: 'Pro Vip',
        price: 420000,
        duration: '1 Year',
        emailLimit: 3,
        icon: Crown,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    }
];

interface GoogleProPurchaseDialogProps {
    children?: React.ReactNode;
}

export function GoogleProPurchaseDialog({ children }: GoogleProPurchaseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'INPUT' | 'SUCCESS'>('INPUT');
    const [emails, setEmails] = useState<string>('');
    const [contactInfo, setContactInfo] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('pro_plus');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];

    const handleSubmit = async () => {
        // 1. Validate Emails
        const emailList = emails
            .split('\n')
            .map((e) => e.trim())
            .filter((e) => e);

        if (emailList.length === 0) {
            toast({
                title: 'Missing Emails',
                description: 'Please enter at least one email address.',
                variant: 'destructive',
            });
            return;
        }

        if (emailList.length > selectedPlan.emailLimit) {
            toast({
                title: 'Limit Exceeded',
                description: `The ${selectedPlan.name} plan only allows ${selectedPlan.emailLimit} email(s). You entered ${emailList.length}.`,
                variant: 'destructive',
            });
            return;
        }

        // Strict validation: abcxyz@gmail.com
        const gmailRegex = /^[a-zA-Z0-9.]+@gmail\.com$/;
        const invalidEmails = emailList.filter((e) => !gmailRegex.test(e));

        if (invalidEmails.length > 0) {
            toast({
                title: 'Invalid Email Format',
                description: `All emails must be @gmail.com. Invalid: ${invalidEmails.join(', ')}`,
                variant: 'destructive',
            });
            return;
        }

        // 2. Validate Contact Info
        if (!contactInfo.trim()) {
            toast({
                title: 'Missing Contact Info',
                description: 'Please enter your Zalo or Telegram so we can contact you.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8045/api/payment/request-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails: emailList,
                    planId: selectedPlan.name, // Send readable name
                    contactInfo: contactInfo,
                    amount: selectedPlan.price
                }),
            });

            if (!response.ok) throw new Error('Failed to send request');

            setStep('SUCCESS');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not send request. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setStep('INPUT');
        setEmails('');
        setContactInfo('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && reset() || v && setIsOpen(v)}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                {step === 'INPUT' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Upgrade Google Account (Pro)</DialogTitle>
                            <DialogDescription>
                                Nâng cấp trước - Chuyển khoản sau. Choose your plan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
                            {PLANS.map((plan) => {
                                const Icon = plan.icon;
                                const isSelected = selectedPlanId === plan.id;
                                return (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:bg-accent",
                                            isSelected ? `border-primary bg-accent/50` : "border-muted",
                                            plan.recommended && !isSelected && "border-amber-400/50"
                                        )}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                    >
                                        {plan.recommended && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                Best Value
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center text-center space-y-1">
                                            <div className={cn("p-2 rounded-full", plan.bg)}>
                                                <Icon className={cn("h-5 w-5", plan.color)} />
                                            </div>
                                            <h3 className="font-bold text-sm">{plan.name}</h3>
                                            <div className="text-xs text-muted-foreground">
                                                {plan.emailLimit} Email{plan.emailLimit > 1 ? 's' : ''}
                                            </div>
                                            <div className="font-semibold text-primary text-sm">
                                                {plan.price.toLocaleString()}đ
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                / {plan.duration}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid gap-4 py-2">
                            <div className="space-y-2">
                                <Label>
                                    Emails to Upgrade
                                    <span className="text-xs font-normal text-muted-foreground ml-2">
                                        (Max {selectedPlan.emailLimit} for {selectedPlan.name})
                                    </span>
                                </Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="user1@gmail.com&#10;user2@gmail.com"
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Only @gmail.com addresses allowed.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Your Contact Info (Zalo / Telegram)</Label>
                                <Input
                                    placeholder="e.g. 0367545048 or @username"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                />
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex flex-col gap-1">
                                    <span className="font-semibold">Support Contact:</span>
                                    <span>• Telegram: <a href="https://t.me/defautmmo" target="_blank" className="text-blue-500 hover:underline">defautmmo</a></span>
                                    <span>• Zalo: 0367545048 (Phúc Lực)</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Request
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'SUCCESS' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-green-600 flex items-center justify-center">
                                <CheckCircle2 className="mr-2 h-6 w-6 animate-in fade-in zoom-in duration-300" />
                                Request Sent!
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center animate-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-green-50 p-4 rounded-full relative">
                                <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-20"></div>
                            </div>
                            <div className="px-4 space-y-2">
                                <p className="font-semibold text-xl text-green-700">Everything looks good!</p>
                                <p className="font-medium">We received your upgrade request.</p>
                                <p className="text-muted-foreground text-sm">
                                    We will contact you via <strong className="text-foreground">{contactInfo}</strong> (Zalo/Telegram) shortly.
                                </p>
                                <p className="text-sm font-medium text-amber-600 border border-amber-200 bg-amber-50 p-3 rounded-lg mt-4 shadow-sm">
                                    "Nâng cấp trước - Chuyển khoản sau"
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={reset} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
