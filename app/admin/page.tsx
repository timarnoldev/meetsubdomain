"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createUser,
  getUsers,
  changePassword,
  getMeets,
  createMeet,
  updateMeet,
  deleteMeet,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getCalendarTokens,
  createCalendarToken,
  deleteCalendarToken,
  getBaseUrl,
} from "./actions";
import {
  KeyRound,
  LogOut,
  Plus,
  Users,
  Link2,
  Pencil,
  Trash2,
  Key,
  Copy,
  Check,
  Calendar,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type Meet = {
  id: string;
  slug: string | null;
  name: string | null;
  notes: string | null;
  resolveUrl: string;
  showContactPage: boolean;
  meetingTime: Date;
  createdAt: Date;
};

type ApiKey = {
  id: string;
  name: string;
  createdAt: Date;
};

type CalendarToken = {
  id: string;
  name: string;
  token: string;
  createdAt: Date;
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createMeetOpen, setCreateMeetOpen] = useState(false);
  const [editMeetOpen, setEditMeetOpen] = useState(false);
  const [deleteMeetOpen, setDeleteMeetOpen] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [deleteKeyOpen, setDeleteKeyOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [calendarTokens, setCalendarTokens] = useState<CalendarToken[]>([]);
  const [createCalTokenOpen, setCreateCalTokenOpen] = useState(false);
  const [deleteCalTokenOpen, setDeleteCalTokenOpen] = useState(false);
  const [selectedCalToken, setSelectedCalToken] = useState<CalendarToken | null>(null);
  const [copiedCalUrl, setCopiedCalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadUsers();
    loadMeets();
    loadApiKeys();
    loadCalendarTokens();
    getBaseUrl().then(setBaseUrl);
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function loadMeets() {
    const data = await getMeets();
    setMeets(data);
  }

  async function loadApiKeys() {
    const data = await getApiKeys();
    setApiKeys(data);
  }

  async function loadCalendarTokens() {
    const data = await getCalendarTokens();
    setCalendarTokens(data);
  }

  async function handleCreateCalendarToken(formData: FormData) {
    setLoading(true);
    clearMessage();
    const name = formData.get("calTokenName") as string;
    const result = await createCalendarToken(name);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setCreateCalTokenOpen(false);
      loadCalendarTokens();
    }
    setLoading(false);
  }

  async function handleDeleteCalendarToken() {
    if (!selectedCalToken) return;
    setLoading(true);
    const result = await deleteCalendarToken(selectedCalToken.id);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setDeleteCalTokenOpen(false);
      setSelectedCalToken(null);
      loadCalendarTokens();
    }
    setLoading(false);
  }

  async function handleCreateApiKey(formData: FormData) {
    setLoading(true);
    clearMessage();
    const name = formData.get("keyName") as string;
    const result = await createApiKey(name);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result.key) {
      setNewKey(result.key);
      loadApiKeys();
    }
    setLoading(false);
  }

  async function handleDeleteApiKey() {
    if (!selectedKey) return;
    setLoading(true);
    const result = await deleteApiKey(selectedKey.id);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setDeleteKeyOpen(false);
      setSelectedKey(null);
      loadApiKeys();
    }
    setLoading(false);
  }

  function clearMessage() {
    setMessage({ text: "", type: "" });
  }

  async function handleCreateUser(formData: FormData) {
    setLoading(true);
    clearMessage();
    const result = await createUser(formData);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setCreateUserOpen(false);
      loadUsers();
    }
    setLoading(false);
  }

  async function handleChangePassword(formData: FormData) {
    if (!selectedUser) return;
    setLoading(true);
    clearMessage();
    const password = formData.get("password") as string;
    const result = await changePassword(selectedUser.id, password);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setPasswordOpen(false);
    }
    setLoading(false);
  }

  async function handleCreateMeet(formData: FormData) {
    setLoading(true);
    clearMessage();
    const resolveUrl = formData.get("resolveUrl") as string;
    const showContactPage = formData.get("showContactPage") === "on";
    const meetingTime = formData.get("meetingTime") as string;
    const name = formData.get("meetName") as string;
    const notes = formData.get("notes") as string;
    const slug = formData.get("slug") as string;
    const result = await createMeet(resolveUrl, showContactPage, meetingTime, name, notes, slug);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setCreateMeetOpen(false);
      loadMeets();
    }
    setLoading(false);
  }

  async function handleUpdateMeet(formData: FormData) {
    if (!selectedMeet) return;
    setLoading(true);
    clearMessage();
    const resolveUrl = formData.get("resolveUrl") as string;
    const showContactPage = formData.get("showContactPage") === "on";
    const meetingTime = formData.get("meetingTime") as string;
    const name = formData.get("meetName") as string;
    const notes = formData.get("notes") as string;
    const slug = formData.get("slug") as string;
    const result = await updateMeet(
      selectedMeet.id,
      resolveUrl,
      showContactPage,
      meetingTime,
      name,
      notes,
      slug,
    );
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setEditMeetOpen(false);
      setSelectedMeet(null);
      loadMeets();
    }
    setLoading(false);
  }

  async function handleDeleteMeet() {
    if (!selectedMeet) return;
    setLoading(true);
    const result = await deleteMeet(selectedMeet.id);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setDeleteMeetOpen(false);
      setSelectedMeet(null);
      loadMeets();
    }
    setLoading(false);
  }

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-start justify-center p-6 pt-16">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Signed in as {session?.user?.email}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meets">
            <TabsList>
              <TabsTrigger value="meets">
                <Link2 className="mr-1 h-4 w-4" />
                Meets
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-1 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="mr-1 h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="api-keys">
                <Key className="mr-1 h-4 w-4" />
                API Keys
              </TabsTrigger>
            </TabsList>

            {/* Meets Tab */}
            <TabsContent value="meets" className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setShowPast(!showPast)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPast ? "Hide past meetings" : "Show past meetings"}
                </button>
                <Dialog
                  open={createMeetOpen}
                  onOpenChange={(open) => {
                    setCreateMeetOpen(open);
                    if (!open) clearMessage();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Meet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Meet</DialogTitle>
                      <DialogDescription>
                        A unique ID will be generated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    {message.text && message.type === "error" && (
                      <p className="text-sm text-red-500">{message.text}</p>
                    )}
                    <form
                      action={handleCreateMeet}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="meetName">Name</Label>
                        <Input
                          id="meetName"
                          name="meetName"
                          placeholder="e.g. Call with Alex"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="slug">Custom Slug</Label>
                        <Input
                          id="slug"
                          name="slug"
                          placeholder="e.g. coffee-chat"
                          pattern="[a-z0-9\-]+"
                          title="Lowercase letters, numbers, and hyphens only"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional. Access via /coffee-chat instead of /a3f-9k2
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="resolveUrl">Resolve URL</Label>
                        <Input
                          id="resolveUrl"
                          name="resolveUrl"
                          type="url"
                          placeholder="https://example.com/meeting"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="meetingTime">Meeting Time</Label>
                        <Input
                          id="meetingTime"
                          name="meetingTime"
                          type="datetime-local"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                          id="notes"
                          name="notes"
                          placeholder="Internal notes..."
                          rows={2}
                          className="rounded-md border bg-transparent px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="showContactPage"
                          name="showContactPage"
                        />
                        <Label htmlFor="showContactPage">
                          Show contact page
                        </Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {(() => {
                const now = new Date();
                const filteredMeets = showPast
                  ? meets
                  : meets.filter((m) => new Date(m.meetingTime) >= now);
                if (filteredMeets.length === 0) {
                  return (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {showPast ? "No meets yet." : "No upcoming meets."}
                    </p>
                  );
                }
                return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Meeting Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeets.map((m) => (
                      <TableRow
                        key={m.id}
                        className={
                          new Date(m.meetingTime) < now ? "opacity-50" : ""
                        }
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {m.name || "—"}
                            </span>
                            {m.notes && (
                              <span className="text-xs text-muted-foreground truncate max-w-40">
                                {m.notes}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                              {m.slug || m.id}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              title="Copy link"
                              onClick={() => {
                                const link = `${baseUrl}/${m.slug || m.id}`;
                                navigator.clipboard.writeText(link);
                                setCopiedMeetId(m.id);
                                setTimeout(() => setCopiedMeetId(null), 2000);
                              }}
                            >
                              {copiedMeetId === m.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(m.meetingTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.showContactPage ? "default" : "secondary"
                            }
                          >
                            {m.showContactPage ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit"
                              onClick={() => {
                                setSelectedMeet(m);
                                setEditMeetOpen(true);
                                clearMessage();
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Delete"
                              onClick={() => {
                                setSelectedMeet(m);
                                setDeleteMeetOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                );
              })()}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Dialog
                  open={createUserOpen}
                  onOpenChange={(open) => {
                    setCreateUserOpen(open);
                    if (!open) clearMessage();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Add a new user with email and password authentication.
                      </DialogDescription>
                    </DialogHeader>
                    {message.text && message.type === "error" && (
                      <p className="text-sm text-red-500">{message.text}</p>
                    )}
                    <form
                      action={handleCreateUser}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Min. 6 characters"
                          minLength={6}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {users.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No users yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Change password"
                            onClick={() => {
                              setSelectedUser(u);
                              setPasswordOpen(true);
                              clearMessage();
                            }}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Dialog
                  open={createCalTokenOpen}
                  onOpenChange={(open) => {
                    setCreateCalTokenOpen(open);
                    if (!open) clearMessage();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      New Calendar Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Calendar Subscription</DialogTitle>
                      <DialogDescription>
                        Generate a URL you can subscribe to in Google Calendar,
                        Apple Calendar, or any calendar app.
                      </DialogDescription>
                    </DialogHeader>
                    {message.text && message.type === "error" && (
                      <p className="text-sm text-red-500">{message.text}</p>
                    )}
                    <form
                      action={handleCreateCalendarToken}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="calTokenName">Name</Label>
                        <Input
                          id="calTokenName"
                          name="calTokenName"
                          placeholder="e.g. My Google Calendar"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {calendarTokens.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No calendar subscriptions yet. Create one to subscribe in your
                  calendar app.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {calendarTokens.map((ct) => {
                    const calUrl = `${baseUrl}/api/calendar/${ct.token}`;
                    return (
                      <div
                        key={ct.id}
                        className="flex items-center gap-2 rounded-md border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{ct.name}</p>
                          <code className="text-xs text-muted-foreground break-all">
                            {calUrl}
                          </code>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Copy URL"
                          onClick={() => {
                            navigator.clipboard.writeText(calUrl);
                            setCopiedCalUrl(ct.id);
                            setTimeout(() => setCopiedCalUrl(null), 2000);
                          }}
                        >
                          {copiedCalUrl === ct.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete"
                          onClick={() => {
                            setSelectedCalToken(ct);
                            setDeleteCalTokenOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 rounded-md border border-dashed p-4">
                <p className="text-sm font-medium mb-2">How to subscribe</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the calendar URL above</li>
                  <li>
                    <strong>Google Calendar:</strong> Settings → Add calendar →
                    From URL → Paste the URL
                  </li>
                  <li>
                    <strong>Apple Calendar:</strong> File → New Calendar
                    Subscription → Paste the URL
                  </li>
                  <li>
                    <strong>Outlook:</strong> Add calendar → Subscribe from web →
                    Paste the URL
                  </li>
                </ol>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Dialog
                  open={createKeyOpen}
                  onOpenChange={(open) => {
                    setCreateKeyOpen(open);
                    if (!open) {
                      clearMessage();
                      setNewKey(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Generate Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate API Key</DialogTitle>
                      <DialogDescription>
                        Create a new API key for programmatic access.
                      </DialogDescription>
                    </DialogHeader>
                    {newKey ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                          Copy this key now. You won&apos;t be able to see it
                          again.
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-muted px-3 py-2 text-xs break-all">
                            {newKey}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(newKey);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex justify-end">
                          <DialogClose asChild>
                            <Button>Done</Button>
                          </DialogClose>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.text && message.type === "error" && (
                          <p className="text-sm text-red-500">{message.text}</p>
                        )}
                        <form
                          action={handleCreateApiKey}
                          className="flex flex-col gap-4"
                        >
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="keyName">Name</Label>
                            <Input
                              id="keyName"
                              name="keyName"
                              placeholder="e.g. CI/CD Pipeline"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                              {loading ? "Generating..." : "Generate"}
                            </Button>
                          </div>
                        </form>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              {apiKeys.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No API keys yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium">{k.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() => {
                              setSelectedKey(k);
                              setDeleteKeyOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                API docs available at{" "}
                <a href="/admin/openapi" target="_blank" className="rounded bg-muted px-1 py-0.5 font-mono hover:underline">/admin/openapi</a>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open);
          if (!open) {
            setSelectedUser(null);
            clearMessage();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {message.text && message.type === "error" && (
            <p className="text-sm text-red-500">{message.text}</p>
          )}
          <form
            action={handleChangePassword}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Meet Dialog */}
      <Dialog
        open={editMeetOpen}
        onOpenChange={(open) => {
          setEditMeetOpen(open);
          if (!open) {
            setSelectedMeet(null);
            clearMessage();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meet</DialogTitle>
            <DialogDescription>
              Update meet{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {selectedMeet?.id}
              </code>
            </DialogDescription>
          </DialogHeader>
          {message.text && message.type === "error" && (
            <p className="text-sm text-red-500">{message.text}</p>
          )}
          <form
            action={handleUpdateMeet}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-meetName">Name</Label>
              <Input
                id="edit-meetName"
                name="meetName"
                placeholder="e.g. Call with Alex"
                defaultValue={selectedMeet?.name ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-slug">Custom Slug</Label>
              <Input
                id="edit-slug"
                name="slug"
                placeholder="e.g. coffee-chat"
                pattern="[a-z0-9\-]+"
                title="Lowercase letters, numbers, and hyphens only"
                defaultValue={selectedMeet?.slug ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-resolveUrl">Resolve URL</Label>
              <Input
                id="edit-resolveUrl"
                name="resolveUrl"
                type="url"
                defaultValue={selectedMeet?.resolveUrl}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-meetingTime">Meeting Time</Label>
              <Input
                id="edit-meetingTime"
                name="meetingTime"
                type="datetime-local"
                defaultValue={
                  selectedMeet?.meetingTime
                    ? new Date(selectedMeet.meetingTime)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <textarea
                id="edit-notes"
                name="notes"
                placeholder="Internal notes..."
                rows={2}
                defaultValue={selectedMeet?.notes ?? ""}
                className="rounded-md border bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-showContactPage"
                name="showContactPage"
                defaultChecked={selectedMeet?.showContactPage}
              />
              <Label htmlFor="edit-showContactPage">Show contact page</Label>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Meet Dialog */}
      <Dialog
        open={deleteMeetOpen}
        onOpenChange={(open) => {
          setDeleteMeetOpen(open);
          if (!open) setSelectedMeet(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete meet{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {selectedMeet?.id}
              </code>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteMeet}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Calendar Token Dialog */}
      <Dialog
        open={deleteCalTokenOpen}
        onOpenChange={(open) => {
          setDeleteCalTokenOpen(open);
          if (!open) setSelectedCalToken(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Calendar Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCalToken?.name}&quot;?
              Any calendar apps using this link will stop updating.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteCalendarToken}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog
        open={deleteKeyOpen}
        onOpenChange={(open) => {
          setDeleteKeyOpen(open);
          if (!open) setSelectedKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key &quot;{selectedKey?.name}&quot;?
              Any integrations using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteApiKey}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
