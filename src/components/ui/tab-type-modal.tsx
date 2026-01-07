"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Wallet, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type TabType = "regular" | "prepaid";

const PRESET_AMOUNTS = [25, 50, 100, 200];

interface TabTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TabType, amount?: number) => Promise<void>;
  tableNumber?: string;
}

export function TabTypeModal({
  isOpen,
  onClose,
  onSelect,
  tableNumber,
}: TabTypeModalProps) {
  const [selectedType, setSelectedType] = React.useState<TabType>("regular");
  const [prepaidAmount, setPrepaidAmount] = React.useState<string>("");
  const [selectedPreset, setSelectedPreset] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedType("regular");
      setPrepaidAmount("");
      setSelectedPreset(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setPrepaidAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setPrepaidAmount(value);
    setSelectedPreset(null);
  };

  const getAmount = (): number | undefined => {
    if (selectedType === "regular") return undefined;
    const amount = parseFloat(prepaidAmount);
    return isNaN(amount) || amount <= 0 ? undefined : amount;
  };

  const canSubmit = () => {
    if (selectedType === "regular") return true;
    const amount = getAmount();
    return amount !== undefined && amount > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSelect(selectedType, getAmount());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--charcoal-900)] rounded-2xl border border-[var(--card-border)] w-full max-w-md overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    How will they pay?
                  </h2>
                  {tableNumber && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Table {tableNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Tab Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Regular Tab */}
                  <button
                    onClick={() => setSelectedType("regular")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      selectedType === "regular"
                        ? "border-[var(--gold-500)] bg-[var(--gold-500)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--charcoal-600)]"
                    )}
                  >
                    <CreditCard className={cn(
                      "w-8 h-8 mx-auto mb-2",
                      selectedType === "regular" ? "text-[var(--gold-400)]" : "text-[var(--muted-foreground)]"
                    )} />
                    <div className={cn(
                      "font-semibold",
                      selectedType === "regular" ? "text-[var(--gold-400)]" : "text-[var(--foreground)]"
                    )}>
                      Regular Tab
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      Pay at the end
                    </div>
                  </button>

                  {/* Prepaid Tab */}
                  <button
                    onClick={() => setSelectedType("prepaid")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      selectedType === "prepaid"
                        ? "border-[var(--gold-500)] bg-[var(--gold-500)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--charcoal-600)]"
                    )}
                  >
                    <Wallet className={cn(
                      "w-8 h-8 mx-auto mb-2",
                      selectedType === "prepaid" ? "text-[var(--gold-400)]" : "text-[var(--muted-foreground)]"
                    )} />
                    <div className={cn(
                      "font-semibold",
                      selectedType === "prepaid" ? "text-[var(--gold-400)]" : "text-[var(--foreground)]"
                    )}>
                      Prepaid
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      Load balance first
                    </div>
                  </button>
                </div>

                {/* Prepaid Amount Selection */}
                <AnimatePresence>
                  {selectedType === "prepaid" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-3">
                        <label className="text-sm font-medium text-[var(--muted-foreground)]">
                          Deposit Amount
                        </label>

                        {/* Preset Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          {PRESET_AMOUNTS.map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handlePresetClick(amount)}
                              className={cn(
                                "py-3 rounded-lg font-semibold text-sm transition-all",
                                selectedPreset === amount
                                  ? "bg-[var(--gold-500)] text-[var(--charcoal-900)]"
                                  : "bg-[var(--charcoal-700)] text-[var(--foreground)] hover:bg-[var(--charcoal-600)]"
                              )}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                            $
                          </span>
                          <input
                            type="number"
                            placeholder="Custom amount"
                            value={prepaidAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-[var(--charcoal-800)] border border-[var(--card-border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--card-border)]">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit() || isSubmitting}
                  className="w-full"
                  size="large"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Opening Tab...
                    </>
                  ) : (
                    <>
                      Start Order
                      {selectedType === "prepaid" && prepaidAmount && (
                        <span className="ml-2 opacity-75">
                          (${parseFloat(prepaidAmount).toFixed(2)} deposit)
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
