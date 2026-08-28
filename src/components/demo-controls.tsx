"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  RefreshCw, 
  Zap, 
  CreditCard, 
  ShoppingCart, 
  Repeat, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function DemoControls() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState("PAYMENT_FAILED");
  const [amount, setAmount] = useState("350");
  const [currency, setCurrency] = useState("USD");
  const [customerName, setCustomerName] = useState("Apex Global Inc");
  const [customerEmail, setCustomerEmail] = useState("billing@apexglobal.io");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsSubmitting(true);
    setResultMessage(null);

    let payload: Record<string, any> = {};
    if (eventType === "PAYMENT_FAILED") {
      payload = {
        errorCode: "insufficient_funds",
        errorMessage: "Simulated soft decline",
        cardBrand: "visa",
        cardLast4: "8821",
        issuerBank: "JPMorgan Chase",
      };
    } else if (eventType === "CHECKOUT_ABANDONED") {
      payload = {
        dropoffStep: "shipping_calculation",
        sessionDurationSeconds: 140,
        cartId: `cart_sim_${Date.now()}`,
      };
    } else if (eventType === "SUBSCRIPTION_CHARGE_FAILED") {
      payload = {
        failureReason: "card_expired",
        planName: "Enterprise Plan",
        consecutiveFailedCycles: 1,
      };
    } else if (eventType === "INVOICE_OVERDUE") {
      payload = {
        invoiceNumber: `INV-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        daysOverdue: 42,
      };
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          amount: parseFloat(amount) || 100,
          currency,
          customer: {
            name: customerName,
            email: customerEmail,
            segment: "ENTERPRISE",
          },
          payload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage(`Case #${data.caseId.slice(0, 8)} created & diagnosed!`);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1200);
      } else {
        setResultMessage(`Error: ${data.error || "Failed to simulate event"}`);
      }
    } catch (e: any) {
      setResultMessage(`Error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBatch = async () => {
    if (!confirm("Reset database to fresh demo dataset?")) return;
    setIsResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleResetBatch}
        disabled={isResetting}
        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className={`size-3.5 ${isResetting ? "animate-spin" : ""}`} />
        {isResetting ? "Resetting..." : "Replay Batch"}
      </Button>

      <Button 
        size="sm" 
        onClick={() => setIsOpen(true)} 
        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
      >
        <Sparkles className="size-3.5" />
        Simulate Signal
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="size-4 text-emerald-600" />
              Simulate Live Ingestion Signal
            </DialogTitle>
            <DialogDescription className="text-xs">
              Inject a realistic event signal into the recovery pipeline to trigger detection & diagnosis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Workflow Event Type</label>
              <Select value={eventType} onValueChange={(val) => val && setEventType(val)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT_FAILED">Payment Retry (Gateway Failure)</SelectItem>
                  <SelectItem value="CHECKOUT_ABANDONED">Checkout Drop-off (Friction)</SelectItem>
                  <SelectItem value="SUBSCRIPTION_CHARGE_FAILED">Subscription Failed Renewal</SelectItem>
                  <SelectItem value="INVOICE_OVERDUE">B2B Invoice Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-foreground">At-Risk Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Currency</label>
                <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                  <SelectTrigger className="h-9 text-xs bg-background font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">Customer Name</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">Customer Email</label>
              <Input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {resultMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{resultMessage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSimulate}
              disabled={isSubmitting}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {isSubmitting ? "Ingesting..." : "Fire Event Signal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
