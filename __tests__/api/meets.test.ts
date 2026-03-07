import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

const mockMeets: Record<string, any> = {};
let insertedId: string | null = null;

vi.mock("@/db", () => {
  const chainable = (data: any) => ({
    from: () => chainable(data),
    where: (cond: any) => {
      // cond is a mock - we use insertedId or the id from params
      const id = cond?._id;
      if (id && mockMeets[id]) {
        return { limit: () => [mockMeets[id]], then: (fn: any) => fn([mockMeets[id]]) };
      }
      return { limit: () => [], then: (fn: any) => fn([]) };
    },
    orderBy: () => Object.values(mockMeets),
    limit: () => data,
    values: (val: any) => {
      if (val?.id) {
        insertedId = val.id;
        mockMeets[val.id] = { ...val };
      }
      return Promise.resolve();
    },
    set: (val: any) => ({
      where: (cond: any) => {
        const id = cond?._id;
        if (id && mockMeets[id]) {
          Object.assign(mockMeets[id], val);
        }
        return Promise.resolve();
      },
    }),
  });

  return {
    db: {
      select: () => chainable([]),
      insert: () => ({ values: (val: any) => chainable([]).values(val) }),
      update: () => ({
        set: (val: any) => ({
          where: (cond: any) => {
            const id = cond?._id;
            if (id && mockMeets[id]) {
              Object.assign(mockMeets[id], val);
            }
            return Promise.resolve();
          },
        }),
      }),
      delete: () => ({
        where: (cond: any) => {
          const id = cond?._id;
          if (id) delete mockMeets[id];
          return Promise.resolve();
        },
      }),
    },
  };
});

vi.mock("@/db/schema", () => ({
  meet: {
    id: "id",
    slug: "slug",
    name: "name",
    notes: "notes",
    resolveUrl: "resolve_url",
    showContactPage: "show_contact_page",
    meetingTime: "meeting_time",
    createdAt: "created_at",
  },
  apiKey: {
    id: "id",
    key: "key",
  },
}));

// Mock drizzle-orm eq to return an object with _id for tracking
vi.mock("drizzle-orm", () => ({
  eq: (field: string, value: string) => ({ _id: value }),
}));

let validApiKey = "mk_test_valid_key";

vi.mock("@/lib/api-auth", () => ({
  validateApiKey: async (request: Request) => {
    const auth = request.headers.get("authorization");
    return auth === `Bearer ${validApiKey}`;
  },
  unauthorized: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
  badRequest: (msg: string) => Response.json({ error: msg }, { status: 400 }),
}));

// --- Helpers ---

function makeRequest(
  method: string,
  body?: any,
  apiKey?: string,
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (apiKey !== undefined) {
    headers["authorization"] = `Bearer ${apiKey}`;
  }
  return new Request("http://localhost/api/meets", {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function authedRequest(method: string, body?: any): Request {
  return makeRequest(method, body, validApiKey);
}

const validMeetBody = {
  resolveUrl: "https://meet.google.com/abc-def-ghi",
  meetingTime: "2026-04-15T14:00:00.000Z",
  name: "Test Meeting",
  notes: "Some notes",
  showContactPage: true,
  slug: "test-meet",
};

// --- Import route handlers ---
// We need to import after mocks are set up

import {
  GET as listMeets,
  POST as createMeet,
} from "@/app/api/meets/route";

import {
  GET as getMeet,
  PUT as updateMeet,
  DELETE as deleteMeet,
} from "@/app/api/meets/[id]/route";

// --- Tests ---

describe("API Authentication", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
    insertedId = null;
  });

  it("GET /api/meets returns 401 without auth header", async () => {
    const req = makeRequest("GET");
    const res = await listMeets(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("POST /api/meets returns 401 without auth header", async () => {
    const req = makeRequest("POST", validMeetBody);
    const res = await createMeet(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/meets returns 401 with invalid api key", async () => {
    const req = makeRequest("GET", undefined, "mk_invalid_key");
    const res = await listMeets(req);
    expect(res.status).toBe(401);
  });

  it("POST /api/meets returns 401 with invalid api key", async () => {
    const req = makeRequest("POST", validMeetBody, "mk_invalid_key");
    const res = await createMeet(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/meets/{id} returns 401 without auth", async () => {
    const req = makeRequest("GET");
    const res = await getMeet(req, { params: Promise.resolve({ id: "abc-123" }) });
    expect(res.status).toBe(401);
  });

  it("PUT /api/meets/{id} returns 401 without auth", async () => {
    const req = makeRequest("PUT", validMeetBody);
    const res = await updateMeet(req, { params: Promise.resolve({ id: "abc-123" }) });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/meets/{id} returns 401 without auth", async () => {
    const req = makeRequest("DELETE");
    const res = await deleteMeet(req, { params: Promise.resolve({ id: "abc-123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 401 with empty Bearer token", async () => {
    const req = makeRequest("GET", undefined, "");
    const res = await listMeets(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/meets - Create", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
    insertedId = null;
  });

  it("creates a meet with all fields", async () => {
    const req = authedRequest("POST", validMeetBody);
    const res = await createMeet(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.resolveUrl).toBe(validMeetBody.resolveUrl);
    expect(body.name).toBe(validMeetBody.name);
    expect(body.notes).toBe(validMeetBody.notes);
    expect(body.showContactPage).toBe(true);
    expect(body.slug).toBe("test-meet");
  });

  it("creates a meet with only required fields", async () => {
    const req = authedRequest("POST", {
      resolveUrl: "https://zoom.us/j/123",
      meetingTime: "2026-05-01T10:00:00.000Z",
    });
    const res = await createMeet(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.resolveUrl).toBe("https://zoom.us/j/123");
    expect(body.showContactPage).toBe(false);
    expect(body.name).toBeNull();
    expect(body.notes).toBeNull();
    expect(body.slug).toBeNull();
  });

  it("generates a xxx-xxx format ID", async () => {
    const req = authedRequest("POST", {
      resolveUrl: "https://example.com",
      meetingTime: "2026-05-01T10:00:00.000Z",
    });
    await createMeet(req);
    expect(insertedId).toMatch(/^[a-z0-9]{3}-[a-z0-9]{3}$/);
  });

  it("returns 400 when resolveUrl is missing", async () => {
    const req = authedRequest("POST", {
      meetingTime: "2026-05-01T10:00:00.000Z",
    });
    const res = await createMeet(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("resolveUrl is required");
  });

  it("returns 400 when meetingTime is missing", async () => {
    const req = authedRequest("POST", {
      resolveUrl: "https://example.com",
    });
    const res = await createMeet(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("meetingTime is required");
  });

  it("returns 400 when body is empty", async () => {
    const req = authedRequest("POST", {});
    const res = await createMeet(req);
    expect(res.status).toBe(400);
  });

  it("sets showContactPage to false by default", async () => {
    const req = authedRequest("POST", {
      resolveUrl: "https://example.com",
      meetingTime: "2026-05-01T10:00:00.000Z",
    });
    const res = await createMeet(req);
    const body = await res.json();
    expect(body.showContactPage).toBe(false);
  });

  it("converts meetingTime string to Date", async () => {
    const timeStr = "2026-06-15T09:30:00.000Z";
    const req = authedRequest("POST", {
      resolveUrl: "https://example.com",
      meetingTime: timeStr,
    });
    await createMeet(req);
    const stored = Object.values(mockMeets)[0] as any;
    expect(stored.meetingTime).toBeInstanceOf(Date);
    expect(stored.meetingTime.toISOString()).toBe(timeStr);
  });

  it("stores null for empty optional string fields", async () => {
    const req = authedRequest("POST", {
      resolveUrl: "https://example.com",
      meetingTime: "2026-05-01T10:00:00.000Z",
      name: "",
      notes: "",
      slug: "",
    });
    const res = await createMeet(req);
    const body = await res.json();
    expect(body.name).toBeNull();
    expect(body.notes).toBeNull();
    expect(body.slug).toBeNull();
  });
});

describe("GET /api/meets - List", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
  });

  it("returns empty array when no meets exist", async () => {
    const req = authedRequest("GET");
    const res = await listMeets(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns all meets", async () => {
    mockMeets["a1b-2c3"] = {
      id: "a1b-2c3",
      resolveUrl: "https://example.com/1",
      meetingTime: new Date("2026-04-01"),
    };
    mockMeets["d4e-5f6"] = {
      id: "d4e-5f6",
      resolveUrl: "https://example.com/2",
      meetingTime: new Date("2026-04-02"),
    };

    const req = authedRequest("GET");
    const res = await listMeets(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

describe("GET /api/meets/{id} - Get Single", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
  });

  it("returns 404 for non-existent meet", async () => {
    const req = authedRequest("GET");
    const res = await getMeet(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  it("returns a meet by ID", async () => {
    mockMeets["x1y-2z3"] = {
      id: "x1y-2z3",
      resolveUrl: "https://example.com",
      name: "My Meet",
      meetingTime: new Date("2026-04-15"),
    };

    const req = authedRequest("GET");
    const res = await getMeet(req, {
      params: Promise.resolve({ id: "x1y-2z3" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("x1y-2z3");
    expect(body.name).toBe("My Meet");
  });
});

describe("PUT /api/meets/{id} - Update", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
  });

  it("returns 404 for non-existent meet", async () => {
    const req = authedRequest("PUT", validMeetBody);
    const res = await updateMeet(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
  });

  it("updates all fields of an existing meet", async () => {
    mockMeets["u1v-2w3"] = {
      id: "u1v-2w3",
      resolveUrl: "https://old.com",
      name: "Old Name",
      notes: "Old notes",
      slug: "old-slug",
      showContactPage: false,
      meetingTime: new Date("2026-03-01"),
    };

    const req = authedRequest("PUT", {
      resolveUrl: "https://new.com",
      name: "New Name",
      notes: "New notes",
      slug: "new-slug",
      showContactPage: true,
      meetingTime: "2026-06-01T12:00:00.000Z",
    });

    const res = await updateMeet(req, {
      params: Promise.resolve({ id: "u1v-2w3" }),
    });
    expect(res.status).toBe(200);

    expect(mockMeets["u1v-2w3"].resolveUrl).toBe("https://new.com");
    expect(mockMeets["u1v-2w3"].name).toBe("New Name");
    expect(mockMeets["u1v-2w3"].notes).toBe("New notes");
    expect(mockMeets["u1v-2w3"].slug).toBe("new-slug");
    expect(mockMeets["u1v-2w3"].showContactPage).toBe(true);
  });

  it("returns 400 when resolveUrl is missing", async () => {
    mockMeets["u1v-2w3"] = { id: "u1v-2w3", resolveUrl: "https://old.com" };

    const req = authedRequest("PUT", {
      meetingTime: "2026-06-01T12:00:00.000Z",
    });
    const res = await updateMeet(req, {
      params: Promise.resolve({ id: "u1v-2w3" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("resolveUrl is required");
  });

  it("returns 400 when meetingTime is missing", async () => {
    mockMeets["u1v-2w3"] = { id: "u1v-2w3", resolveUrl: "https://old.com" };

    const req = authedRequest("PUT", {
      resolveUrl: "https://new.com",
    });
    const res = await updateMeet(req, {
      params: Promise.resolve({ id: "u1v-2w3" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("meetingTime is required");
  });

  it("clears optional fields when set to empty string", async () => {
    mockMeets["u1v-2w3"] = {
      id: "u1v-2w3",
      resolveUrl: "https://old.com",
      name: "Has Name",
      slug: "has-slug",
    };

    const req = authedRequest("PUT", {
      resolveUrl: "https://new.com",
      meetingTime: "2026-06-01T12:00:00.000Z",
      name: "",
      slug: "",
      notes: "",
    });

    await updateMeet(req, {
      params: Promise.resolve({ id: "u1v-2w3" }),
    });

    expect(mockMeets["u1v-2w3"].name).toBeNull();
    expect(mockMeets["u1v-2w3"].slug).toBeNull();
    expect(mockMeets["u1v-2w3"].notes).toBeNull();
  });

  it("defaults showContactPage to false when not provided", async () => {
    mockMeets["u1v-2w3"] = {
      id: "u1v-2w3",
      resolveUrl: "https://old.com",
      showContactPage: true,
    };

    const req = authedRequest("PUT", {
      resolveUrl: "https://new.com",
      meetingTime: "2026-06-01T12:00:00.000Z",
    });

    await updateMeet(req, {
      params: Promise.resolve({ id: "u1v-2w3" }),
    });

    expect(mockMeets["u1v-2w3"].showContactPage).toBe(false);
  });
});

describe("DELETE /api/meets/{id} - Delete", () => {
  beforeEach(() => {
    Object.keys(mockMeets).forEach((k) => delete mockMeets[k]);
  });

  it("returns 404 for non-existent meet", async () => {
    const req = authedRequest("DELETE");
    const res = await deleteMeet(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(404);
  });

  it("deletes an existing meet and returns 204", async () => {
    mockMeets["d1e-2f3"] = {
      id: "d1e-2f3",
      resolveUrl: "https://example.com",
    };

    const req = authedRequest("DELETE");
    const res = await deleteMeet(req, {
      params: Promise.resolve({ id: "d1e-2f3" }),
    });
    expect(res.status).toBe(204);
    expect(mockMeets["d1e-2f3"]).toBeUndefined();
  });

  it("returns empty body on successful delete", async () => {
    mockMeets["d1e-2f3"] = {
      id: "d1e-2f3",
      resolveUrl: "https://example.com",
    };

    const req = authedRequest("DELETE");
    const res = await deleteMeet(req, {
      params: Promise.resolve({ id: "d1e-2f3" }),
    });
    expect(res.body).toBeNull();
  });
});

describe("API Key Validation", () => {
  it("rejects requests without Authorization header", async () => {
    const req = new Request("http://localhost/api/meets", { method: "GET" });
    const res = await listMeets(req);
    expect(res.status).toBe(401);
  });

  it("rejects requests with non-Bearer auth", async () => {
    const req = new Request("http://localhost/api/meets", {
      method: "GET",
      headers: { authorization: "Basic abc123" },
    });
    const res = await listMeets(req);
    expect(res.status).toBe(401);
  });

  it("accepts valid Bearer token", async () => {
    const req = new Request("http://localhost/api/meets", {
      method: "GET",
      headers: { authorization: `Bearer ${validApiKey}` },
    });
    const res = await listMeets(req);
    expect(res.status).toBe(200);
  });
});
