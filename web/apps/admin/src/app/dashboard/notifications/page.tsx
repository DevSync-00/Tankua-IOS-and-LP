"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Users,
  Building2,
  Megaphone,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar } from "@tankua/ui";

const notifications = [
  { id: 1, title: "System Maintenance", message: "Scheduled maintenance on Jan 20, 2024 from 2-4 AM", target: "all", status: "sent", date: "Jan 15, 2024", recipients: 12450 },
  { id: 2, title: "New Feature Launch", message: "QR tickets now available for all bookings!", target: "users", status: "sent", date: "Jan 14, 2024", recipients: 10234 },
  { id: 3, title: "Provider Update", message: "New payout schedule starts next week", target: "providers", status: "sent", date: "Jan 13, 2024", recipients: 48 },
  { id: 4, title: "Holiday Special", message: "Timket special discounts available now!", target: "all", status: "scheduled", date: "Jan 18, 2024", recipients: 12450 },
];

const templates = [
  { id: 1, name: "System Update", description: "Notify users about system changes" },
  { id: 2, name: "Promotion", description: "Send promotional offers" },
  { id: 3, name: "Provider Notice", description: "Important updates for providers" },
  { id: 4, name: "Holiday Greeting", description: "Holiday wishes and offers" },
];

export default function NotificationsPage() {
  const [showCompose, setShowCompose] = useState(false);

  const getTargetBadge = (target: string) => {
    switch (target) {
      case "all":
        return <Badge variant="default">All Users</Badge>;
      case "users":
        return <Badge variant="secondary">App Users</Badge>;
      case "providers":
        return <Badge variant="secondary">Providers</Badge>;
      default:
        return <Badge variant="secondary">{target}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="success" dot>Sent</Badge>;
      case "scheduled":
        return <Badge variant="warning" dot>Scheduled</Badge>;
      case "draft":
        return <Badge variant="secondary" dot>Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Notifications"
        subtitle="Manage push notifications and announcements"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCompose(true)}>
            New Notification
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12.4K</p>
                <p className="text-sm text-muted-foreground">Total Reach</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    {getTargetBadge(notification.target)}
                    {getStatusBadge(notification.status)}
                    <span className="text-xs text-muted-foreground">{notification.date}</span>
                    <span className="text-xs text-muted-foreground">• {notification.recipients.toLocaleString()} recipients</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                  onClick={() => setShowCompose(true)}
                >
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Compose Modal Placeholder */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-xl font-bold mb-4">Compose Notification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Notification title"
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Your message..."
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <select className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background">
                    <option value="all">All Users</option>
                    <option value="users">App Users Only</option>
                    <option value="providers">Providers Only</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
                  <Button leftIcon={<Send className="h-4 w-4" />}>Send Now</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

