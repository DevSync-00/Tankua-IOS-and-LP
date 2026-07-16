"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Header } from "@/components/header";
import { supabase } from "@/lib/supabase";
import {
  createAdminTrip,
  deleteAdminTrip,
  getAdminTrips,
  getProviders,
  updateAdminTripStatus,
  type AdminTrip,
  type Provider,
} from "@/lib/queries";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, formatCurrency } from "@tankua/ui";

type DestinationOption = {
  id: string;
  name: string;
  city?: string | null;
  region?: string | null;
};

const emptyForm = {
  provider_id: "",
  destination_id: "",
  trip_type: "one_way",
  departure_date: "",
  departure_time: "",
  return_date: "",
  price: "",
  max_seats: "",
  tour_category: "",
  itinerary: "",
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    loadTrips();
  }, [statusFilter, providerFilter]);

  const loadPage = async () => {
    setLoading(true);
    await Promise.all([loadTrips(), loadProviders(), loadDestinations()]);
    setLoading(false);
  };

  const loadTrips = async () => {
    const result = await getAdminTrips({
      status: statusFilter || undefined,
      providerId: providerFilter || undefined,
      limit: 250,
    });
    setTrips(result.trips);
  };

  const loadProviders = async () => {
    const result = await getProviders({ limit: 500 });
    setProviders(result.providers);
  };

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, name, city, region")
      .order("name");

    if (!error) {
      setDestinations((data || []) as DestinationOption[]);
    }
  };

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return trips;

    return trips.filter((trip) => {
      return [
        trip.destination?.name,
        trip.destination?.city,
        trip.destination?.region,
        trip.provider?.name,
        trip.provider?.email,
        trip.tour_category,
        trip.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [search, trips]);

  const stats = useMemo(() => {
    const totalSeats = filteredTrips.reduce((sum, trip) => sum + trip.max_seats, 0);
    const bookedSeats = filteredTrips.reduce((sum, trip) => sum + trip.bookings_count, 0);
    const activeTrips = filteredTrips.filter((trip) => ["upcoming", "ongoing"].includes(trip.status)).length;
    return { totalSeats, bookedSeats, activeTrips };
  }, [filteredTrips]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="success" dot>Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="warning" dot>Ongoing</Badge>;
      case "completed":
        return <Badge variant="secondary" dot>Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" dot>Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (value: string) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateTrip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.provider_id || !formData.destination_id || !formData.departure_date || !formData.departure_time) {
      setError("Provider, destination, date, and time are required.");
      setSaving(false);
      return;
    }

    const price = Number(formData.price);
    const maxSeats = Number(formData.max_seats);

    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(maxSeats) || maxSeats <= 0) {
      setError("Enter a valid price and seat count.");
      setSaving(false);
      return;
    }

    const result = await createAdminTrip({
      provider_id: formData.provider_id,
      destination_id: formData.destination_id,
      trip_type: formData.trip_type,
      departure_date: `${formData.departure_date}T${formData.departure_time}:00`,
      return_date: formData.return_date || null,
      price,
      max_seats: maxSeats,
      tour_category: formData.tour_category,
      itinerary: formData.itinerary,
    });

    if (result.success) {
      setSuccess("Trip created successfully.");
      setFormData(emptyForm);
      await loadTrips();
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 800);
    } else {
      setError(result.error || "Failed to create trip.");
    }

    setSaving(false);
  };

  const handleStatusChange = async (tripId: string, status: "upcoming" | "ongoing" | "completed" | "cancelled") => {
    const result = await updateAdminTripStatus(tripId, status);
    if (result.success) {
      await loadTrips();
    } else {
      alert(result.error || "Failed to update trip status.");
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Delete this trip? Trips with bookings cannot be deleted.")) return;

    setDeletingId(tripId);
    const result = await deleteAdminTrip(tripId);
    if (result.success) {
      await loadTrips();
    } else {
      alert(result.error || "Failed to delete trip.");
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Trips"
        subtitle={`${filteredTrips.length} trips across all providers`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={loadPage} isLoading={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active trips</p>
            <p className="text-2xl font-bold mt-1">{stats.activeTrips}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Booked seats</p>
            <p className="text-2xl font-bold mt-1 text-primary">{stats.bookedSeats}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total seats</p>
            <p className="text-2xl font-bold mt-1">{stats.totalSeats}</p>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search provider, destination, category, status..."
              className="pl-9"
            />
          </div>
          <select
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
          >
            <option value="">All Providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trips found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Provider</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seats</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{trip.destination?.name || "Unknown destination"}</p>
                              <p className="text-xs text-muted-foreground">
                                {trip.trip_type === "round_trip" ? "Round trip" : "One way"} · {formatCurrency(trip.price)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium">{trip.provider?.name || "Unknown provider"}</p>
                          <p className="text-xs text-muted-foreground">{trip.provider?.email || trip.provider_id}</p>
                        </td>
                        <td className="py-4 px-6 text-sm">{formatDateTime(trip.departure_date)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{trip.bookings_count}/{trip.max_seats}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(trip.status)}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end items-center gap-2">
                            <select
                              value={trip.status}
                              onChange={(event) => handleStatusChange(trip.id, event.target.value as any)}
                              className="h-9 px-2 rounded-lg border border-border bg-background text-xs"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive"
                              disabled={deletingId === trip.id}
                              onClick={() => handleDelete(trip.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Trip</CardTitle>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                {error && (
                  <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <select
                      value={formData.provider_id}
                      onChange={(event) => setFormData({ ...formData, provider_id: event.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                      required
                    >
                      <option value="">Select provider</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Destination</label>
                    <select
                      value={formData.destination_id}
                      onChange={(event) => setFormData({ ...formData, destination_id: event.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                      required
                    >
                      <option value="">Select destination</option>
                      {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}{destination.city ? `, ${destination.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trip Type</label>
                    <select
                      value={formData.trip_type}
                      onChange={(event) => setFormData({ ...formData, trip_type: event.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    >
                      <option value="one_way">One way</option>
                      <option value="round_trip">Round trip</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.departure_date}
                      onChange={(event) => setFormData({ ...formData, departure_date: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      type="time"
                      value={formData.departure_time}
                      onChange={(event) => setFormData({ ...formData, departure_time: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Return Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.return_date}
                      onChange={(event) => setFormData({ ...formData, return_date: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seats</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.max_seats}
                      onChange={(event) => setFormData({ ...formData, max_seats: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={formData.tour_category}
                    onChange={(event) => setFormData({ ...formData, tour_category: event.target.value })}
                    placeholder="Pilgrimage, cultural, historical..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Itinerary</label>
                  <textarea
                    value={formData.itinerary}
                    onChange={(event) => setFormData({ ...formData, itinerary: event.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={saving}>
                    Create Trip
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
