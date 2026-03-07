import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Meet with Tim API",
      version: "1.0.0",
      description: "API for managing meeting links programmatically.",
    },
    servers: [{ url: "/api" }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer",
          description: "API key (mk_...) passed as Bearer token",
        },
      },
      schemas: {
        Meet: {
          type: "object" as const,
          properties: {
            id: { type: "string", example: "a3f-9k2" },
            slug: {
              type: "string",
              nullable: true,
              example: "coffee-chat",
              description: "Custom URL slug. Access meet via /{slug} instead of /{id}",
            },
            name: { type: "string", nullable: true, example: "Call with Alex" },
            notes: {
              type: "string",
              nullable: true,
              example: "Discuss project timeline",
            },
            resolveUrl: {
              type: "string",
              format: "uri",
              example: "https://meet.google.com/abc-def-ghi",
            },
            showContactPage: { type: "boolean", example: true },
            meetingTime: {
              type: "string",
              format: "date-time",
              example: "2026-03-15T14:00:00.000Z",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        MeetInput: {
          type: "object" as const,
          required: ["resolveUrl", "meetingTime"],
          properties: {
            slug: { type: "string", nullable: true, pattern: "^[a-z0-9\\-]+$" },
            name: { type: "string", nullable: true },
            notes: { type: "string", nullable: true },
            resolveUrl: { type: "string", format: "uri" },
            showContactPage: { type: "boolean", default: false },
            meetingTime: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object" as const,
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/meets": {
        get: {
          summary: "List all meets",
          operationId: "listMeets",
          responses: {
            "200": {
              description: "List of meets sorted by meeting time",
              content: {
                "application/json": {
                  schema: {
                    type: "array" as const,
                    items: { $ref: "#/components/schemas/Meet" },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a meet",
          operationId: "createMeet",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeetInput" },
              },
            },
          },
          responses: {
            "201": {
              description: "Meet created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Meet" },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/meets/{id}": {
        parameters: [
          {
            name: "id",
            in: "path" as const,
            required: true,
            schema: { type: "string" },
            example: "a3f-9k2",
          },
        ],
        get: {
          summary: "Get a meet by ID",
          operationId: "getMeet",
          responses: {
            "200": {
              description: "Meet found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Meet" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        put: {
          summary: "Update a meet",
          operationId: "updateMeet",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeetInput" },
              },
            },
          },
          responses: {
            "200": {
              description: "Meet updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Meet" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete a meet",
          operationId: "deleteMeet",
          responses: {
            "204": { description: "Meet deleted" },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
    },
  };

  return Response.json(spec);
}
