"use client";

import { useState } from "react";
import {
  Settings,
  Building2,
  User,
  Lock,
  Bell,
  CreditCard,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar } from "@tankua/ui";
import { changeProviderPassword } from "@/lib/auth";

const settingsSections = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "banking", label: "Banking", icon: CreditCard },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("company");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    try {
      setPasswordSaving(true);
      await changeProviderPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated successfully.");
    } catch (err: any) {
      setPasswordError(err.message || "Unable to update password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
        actions={
          <Button size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === "company" && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-border">
                    <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold">
                      A
                    </div>
                    <div>
                      <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <input
                        type="text"
                        defaultValue="Abyssinia Tours"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Type</label>
                      <select className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background">
                        <option value="tour_operator">Tour Operator</option>
                        <option value="travel_agency">Travel Agency</option>
                        <option value="transport_company">Transport Company</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+251 911 123 456"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="info@abyssiniatours.com"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        rows={3}
                        defaultValue="Leading tour operator specializing in religious and cultural tourism in Ethiopia."
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Owner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-border">
                    <Avatar name="Abebe Kebede" size="xl" />
                    <div>
                      <Button variant="outline" size="sm">Change Photo</Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Abebe Kebede"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="abebe@abyssiniatours.com"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue="+251 911 123 456"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        defaultValue="Owner"
                        disabled
                        className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 text-muted-foreground"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                    {passwordError && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{passwordError}</p>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p>{passwordSuccess}</p>
                      </div>
                    )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                    <Button type="submit" className="mt-4" isLoading={passwordSaving}>
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "New bookings", description: "When customers book your trips", enabled: true },
                    { label: "Booking cancellations", description: "When bookings are cancelled", enabled: true },
                    { label: "New reviews", description: "When customers leave reviews", enabled: true },
                    { label: "Payout notifications", description: "Weekly payout updates", enabled: true },
                    { label: "Marketing updates", description: "Tips and platform news", enabled: false },
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === "banking" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bank Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-brand-dark to-brand-earth rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-6">
                      <Building2 className="h-8 w-8" />
                      <Badge className="bg-emerald-500">Verified</Badge>
                    </div>
                    <p className="text-lg font-mono tracking-wider mb-2">•••• •••• •••• 4521</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-70">Account Holder</p>
                        <p className="font-medium">Abyssinia Tours PLC</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-70">Bank</p>
                        <p className="font-medium">Commercial Bank of Ethiopia</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Update Bank Details</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

