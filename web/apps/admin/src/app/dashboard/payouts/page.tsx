"use client";

import { useState } from "react";
import {
  Wallet,
  Building2,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, formatCurrency } from "@tankua/ui";

const payouts = [
  { id: "PO-001", provider: "Abyssinia Tours", amount: 245000, status: "completed", date: "Jan 14, 2024", bank: "CBE" },
  { id: "PO-002", provider: "Lalibela Pilgrimage", amount: 189000, status: "completed", date: "Jan 14, 2024", bank: "Awash" },
  { id: "PO-003", provider: "Tigray Heritage Tours", amount: 156000, status: "pending", date: "Jan 15, 2024", bank: "CBE" },
  { id: "PO-004", provider: "Holy Land Travels", amount: 98500, status: "pending", date: "Jan 15, 2024", bank: "Dashen" },
  { id: "PO-005", provider: "Ethiopian Odyssey", amount: 312000, status: "completed", date: "Jan 7, 2024", bank: "CBE" },
];

const pendingPayouts = payouts.filter(p => p.status === "pending");
const completedPayouts = payouts.filter(p => p.status === "completed");

export default function PayoutsPage() {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleProcessPayout = async (id: string) => {
    setProcessing(id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(null);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Payouts"
        subtitle="Manage provider payouts"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<Wallet className="h-4 w-4" />}>
              Process All Pending
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {formatCurrency(pendingPayouts.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500/20" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{pendingPayouts.length} providers waiting</p>
          </Card>
          <Card className="p-4 sm:p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed This Week</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {formatCurrency(completedPayouts.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500/20" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{completedPayouts.length} payouts processed</p>
          </Card>
          <Card className="p-4 sm:p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Providers</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">48</p>
              </div>
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary/20" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Eligible for payout</p>
          </Card>
        </div>

        {/* Pending Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>All payouts have been processed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <Avatar name={payout.provider} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{payout.provider}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{payout.bank} • {payout.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-base sm:text-lg">{formatCurrency(payout.amount)}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{payout.date}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleProcessPayout(payout.id)}
                        isLoading={processing === payout.id}
                      >
                        Process
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Recent Completed Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-border">
              {completedPayouts.map((payout) => (
                <div key={payout.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={payout.provider} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{payout.provider}</p>
                        <p className="text-xs text-muted-foreground truncate">{payout.bank} • {payout.id}</p>
                      </div>
                    </div>
                    <Badge variant="success" dot>Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-sm mt-1">{formatCurrency(payout.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm mt-1">{payout.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Provider</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPayouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={payout.provider} size="sm" />
                          <span className="font-medium text-sm">{payout.provider}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary">{payout.bank}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-sm">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-muted-foreground">{payout.date}</p>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="success" dot>Completed</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

