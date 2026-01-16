"use client";

import { useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, Button, Badge, Avatar, formatCurrency } from "@tankua/ui";

const payments = [
  { id: "PAY-001", user: "Yohannes T.", method: "Chapa", amount: 5000, status: "completed", date: "Jan 15, 2024", booking: "BK-001" },
  { id: "PAY-002", user: "Sara M.", method: "Telebirr", amount: 2400, status: "completed", date: "Jan 15, 2024", booking: "BK-002" },
  { id: "PAY-003", user: "Abebe K.", method: "CBE Birr", amount: 10000, status: "pending", date: "Jan 15, 2024", booking: "BK-003" },
  { id: "PAY-004", user: "Meron G.", method: "Chapa", amount: 3600, status: "completed", date: "Jan 14, 2024", booking: "BK-004" },
  { id: "PAY-005", user: "Daniel H.", method: "Telebirr", amount: 7500, status: "completed", date: "Jan 14, 2024", booking: "BK-005" },
  { id: "PAY-006", user: "Hana T.", method: "Chapa", amount: 2400, status: "refunded", date: "Jan 13, 2024", booking: "BK-006" },
];

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" dot>Completed</Badge>;
      case "pending":
        return <Badge variant="warning" dot>Pending</Badge>;
      case "refunded":
        return <Badge variant="destructive" dot>Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen">
      <Header
        title="Payments"
        subtitle="Track all payment transactions"
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-primary mt-1">{formatCurrency(totalRevenue)}</p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
              {payments.filter(p => p.status === "completed").length}
            </p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
              {payments.filter(p => p.status === "pending").length}
            </p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Refunded</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
              {payments.filter(p => p.status === "refunded").length}
            </p>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar name={payment.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{payment.user}</p>
                        <p className="text-xs text-muted-foreground font-mono">{payment.id}</p>
                      </div>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-sm mt-1">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Method</p>
                      <Badge variant="secondary" className="mt-1">{payment.method}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment ID</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-mono text-sm">{payment.id}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={payment.user} size="sm" />
                          <span className="font-medium text-sm">{payment.user}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary">{payment.method}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-sm">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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

