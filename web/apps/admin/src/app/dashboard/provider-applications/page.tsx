"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, Input } from "@tankua/ui";
import { adminDbRequest } from "@/lib/admin-api";
import { approveProvider, getProviderApplications, updateProviderStatus, getProviders, type SupportTicket, type Provider } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export default function ProviderApplicationsPage() {
  const [applications, setApplications] = useState<SupportTicket[]>([]);
  const [inactiveProviders, setInactiveProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tickets" | "providers">("tickets");

  useEffect(() => {
    loadApplications();
    loadInactiveProviders();
  }, []);

  useEffect(() => {
    if (viewMode === "providers" && !selectedApp && inactiveProviders.length > 0) {
      selectProvider(inactiveProviders[0]);
    }
  }, [viewMode, inactiveProviders, selectedApp]);

  const loadApplications = async () => {
    try {
      const result = await getProviderApplications();
      setApplications(result.applications);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
  };

  const loadInactiveProviders = async () => {
    setLoading(true);
    try {
      // Also load inactive providers directly (these are pending applications)
      const result = await getProviders({
        status: "inactive",
        limit: 100,
      });
      setInactiveProviders(result.providers);
    } catch (error) {
      console.error("Error loading inactive providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    if (!confirm("Are you sure you want to approve this provider?")) return;

    const result = await approveProvider(providerId);
    if (result.success) {
      // Update ticket status
      await adminDbRequest({
        table: "support_tickets",
        action: "update",
        values: { status: "resolved", resolution_notes: "Provider approved", updated_at: new Date().toISOString() },
        filters: [
          { column: "provider_id", value: providerId },
          { column: "status", value: "open" },
        ],
      });

      loadApplications();
      loadInactiveProviders();
      setSelectedApp(null);
    } else {
      alert(result.error || "Failed to approve provider");
    }
  };

  const handleReject = async (providerId: string, ticketId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    // Update provider status to suspended
    await updateProviderStatus(providerId, "suspended");

    const ticketUpdate = {
      status: "resolved",
      resolution_notes: `Rejected: ${reason}`,
    };

    await adminDbRequest({
      table: "support_tickets",
      action: "update",
      values: { ...ticketUpdate, updated_at: new Date().toISOString() },
      filters: [{ column: "id", value: ticketId }],
    });

    await adminDbRequest({
      table: "support_tickets",
      action: "update",
      values: { ...ticketUpdate, updated_at: new Date().toISOString() },
      filters: [
        { column: "provider_id", value: providerId },
        { column: "status", value: "open" },
      ],
    });

    loadApplications();
    loadInactiveProviders();
    setSelectedApp(null);
  };

  const selectProvider = (provider: Provider) => {
    const relatedTicket = applications.find((ticket) => ticket.provider_id === provider.id);
    if (relatedTicket) {
      setSelectedApp(relatedTicket);
      return;
    }

    setSelectedApp({
      id: `provider-${provider.id}`,
      ticket_number: "Direct provider record",
      subject: `Provider: ${provider.name}`,
      description: [
        `Company: ${provider.name}`,
        `Email: ${provider.email || "N/A"}`,
        `Phone: ${provider.phone || "N/A"}`,
        `Description: ${provider.description || "N/A"}`,
      ].join("\n"),
      category: "general",
      priority: "high",
      status: "open",
      provider_id: provider.id,
      provider,
      user_id: null,
      booking_id: null,
      assigned_to: null,
      created_at: provider.created_at,
      updated_at: provider.created_at,
    });
  };

  const parseApplicationData = (description: string) => {
    const data: Record<string, string> = {};
    const lines = description.split("\n");
    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        data[key.trim()] = valueParts.join(":").trim();
      }
    }
    return data;
  };

  const getDocumentUrl = (url: string | null) => {
    if (!url) return null;
    // Extract file path from URL if it's a full URL
    const match = url.match(/provider-docs\/(.+)/);
    if (match) {
      return supabase.storage.from("provider-docs").getPublicUrl(match[1]).data.publicUrl;
    }
    return url;
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      app.subject.toLowerCase().includes(searchLower) ||
      app.provider?.name?.toLowerCase().includes(searchLower) ||
      app.provider?.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredProviders = inactiveProviders.filter((provider) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      provider.name?.toLowerCase().includes(searchLower) ||
      provider.email?.toLowerCase().includes(searchLower) ||
      provider.phone?.toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = viewMode === "tickets" ? applications.length : inactiveProviders.length;

  return (
    <div className="min-h-screen">
      <Header
        title="Provider Applications"
        subtitle={`${pendingCount} pending application${pendingCount !== 1 ? "s" : ""}`}
        actions={
          <>
            <div className="flex items-center gap-2 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("tickets")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === "tickets"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                From Tickets
              </button>
              <button
                onClick={() => setViewMode("providers")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === "providers"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inactive Providers
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              loadApplications();
              loadInactiveProviders();
            }}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Applications</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : viewMode === "tickets" && filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending applications from tickets</p>
                  <p className="text-xs mt-2">Try switching to "Inactive Providers" view</p>
                </div>
              ) : viewMode === "providers" && filteredProviders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inactive providers</p>
                </div>
              ) : viewMode === "tickets" ? (
                <div className="space-y-3">
                  {filteredApplications.map((app) => {
                    const appData = parseApplicationData(app.description);
                    return (
                      <div
                        key={app.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedApp?.id === app.id
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-muted/30 hover:border-border"
                        }`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar name={app.provider?.name || "Provider"} size="sm" />
                            <div>
                              <p className="font-medium text-sm">{app.provider?.name || "Unknown Provider"}</p>
                              <p className="text-xs text-muted-foreground">{app.ticket_number}</p>
                            </div>
                          </div>
                          <Badge variant="destructive" dot>
                            Pending
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          {appData.Company && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Company:</span> {appData.Company}
                            </p>
                          )}
                          {appData.Email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {appData.Email}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedApp?.provider_id === provider.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/30 hover:border-border"
                      }`}
                      onClick={() => selectProvider(provider)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={provider.name} size="sm" />
                          <div>
                            <p className="font-medium text-sm">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">Inactive Provider</p>
                          </div>
                        </div>
                        <Badge variant="secondary" dot>
                          Inactive
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        {provider.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {provider.email}
                          </p>
                        )}
                        {provider.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {provider.phone}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(provider.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleApprove(provider.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleReject(provider.id, `provider-${provider.id}`);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedApp ? (
                <div className="space-y-4">
                  {(() => {
                    const appData = parseApplicationData(selectedApp.description);
                    const tradeLicenseUrl = appData["Trade License"];
                    const tourLicenseUrl = appData["Tour License"];

                    return (
                      <>
                        <div className="p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar name={selectedApp.provider?.name || "Provider"} size="md" />
                            <div>
                              <p className="font-semibold">{selectedApp.provider?.name || "Unknown Provider"}</p>
                              <p className="text-xs text-muted-foreground">{selectedApp.ticket_number}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            {appData.Company && (
                              <div>
                                <span className="text-muted-foreground">Company:</span> {appData.Company}
                              </div>
                            )}
                            {appData["Business Type"] && (
                              <div>
                                <span className="text-muted-foreground">Business Type:</span> {appData["Business Type"]}
                              </div>
                            )}
                            {appData.City && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">City:</span> {appData.City}
                              </div>
                            )}
                            {appData.Address && (
                              <div>
                                <span className="text-muted-foreground">Address:</span> {appData.Address}
                              </div>
                            )}
                            {appData.Owner && (
                              <div>
                                <span className="text-muted-foreground">Owner:</span> {appData.Owner}
                              </div>
                            )}
                            {appData.Phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{appData.Phone}</span>
                              </div>
                            )}
                            {appData.Email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{appData.Email}</span>
                              </div>
                            )}
                            {appData.Description && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <span className="text-muted-foreground">Description:</span>
                                <p className="mt-1">{appData.Description}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Documents</p>
                          {tradeLicenseUrl && tradeLicenseUrl !== "N/A" && (
                            <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Trade License</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = getDocumentUrl(tradeLicenseUrl);
                                    if (url) window.open(url, "_blank");
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = getDocumentUrl(tradeLicenseUrl);
                                    if (url) {
                                      const link = document.createElement("a");
                                      link.href = url;
                                      link.download = "trade-license.pdf";
                                      link.click();
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {tourLicenseUrl && tourLicenseUrl !== "N/A" && (
                            <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Tour License</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = getDocumentUrl(tourLicenseUrl);
                                    if (url) window.open(url, "_blank");
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = getDocumentUrl(tourLicenseUrl);
                                    if (url) {
                                      const link = document.createElement("a");
                                      link.href = url;
                                      link.download = "tour-license.pdf";
                                      link.click();
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {selectedApp.provider_id && (
                          <div className="flex gap-2 pt-4 border-t border-border">
                            <Button
                              className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              variant="outline"
                              onClick={() => handleApprove(selectedApp.provider_id!)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(selectedApp.provider_id!, selectedApp.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an application to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

