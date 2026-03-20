import { env } from "../config/env";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Smart Agriwaste Backend API",
    version: "1.0.0",
    description:
      "Production API documentation for Smart Agriwaste backend services.",
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Local server",
    },
  ],
  tags: [
    { name: "System" },
    { name: "Buyer" },
    { name: "Farmer" },
    { name: "Waste" },
    { name: "Order" },
    { name: "Negotiation" },
    { name: "Notification" },
    { name: "Community" },
    { name: "ImageKit" },
    { name: "Webhooks" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      GenericSuccess: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          nextCursor: { type: "string", nullable: true },
          limit: { type: "integer" },
          hasNext: { type: "boolean" },
        },
      },
      Address: {
        type: "object",
        properties: {
          houseBuildingName: { type: "string" },
          roadarealandmarkName: { type: "string" },
          state: { type: "string" },
          district: { type: "string" },
          taluka: { type: "string" },
          village: { type: "string" },
        },
      },
      TranslatedText: {
        type: "object",
        properties: {
          en: { type: "string" },
          hi: { type: "string" },
          mr: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "API root health message",
        responses: {
          "200": {
            description: "Backend is running",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["System"],
        summary: "Service health check",
        responses: {
          "200": {
            description: "Healthy",
          },
          "503": {
            description: "Degraded",
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["System"],
        summary: "Liveness check",
        responses: {
          "200": {
            description: "Service process is alive",
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["System"],
        summary: "Readiness check",
        responses: {
          "200": {
            description: "Service is ready to receive traffic",
          },
          "503": {
            description: "Service is not ready to receive traffic",
          },
        },
      },
    },

    "/api/imagekit/auth": {
      get: {
        tags: ["ImageKit"],
        summary: "Get ImageKit authentication parameters",
        responses: {
          "200": {
            description: "ImageKit auth params",
          },
        },
      },
    },

    "/api/webhooks/clerk": {
      post: {
        tags: ["Webhooks"],
        summary: "Handle Clerk webhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Webhook processed" },
          "400": { description: "Invalid webhook payload/signature" },
        },
      },
    },

    "/api/buyer/create-account": {
      post: {
        tags: ["Buyer"],
        summary: "Create buyer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Buyer account created" },
        },
      },
    },
    "/api/buyer/get-account/{id}": {
      get: {
        tags: ["Buyer"],
        summary: "Get buyer account by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Buyer account data" },
          "404": { description: "Buyer not found" },
        },
      },
    },
    "/api/buyer/update-account/{id}": {
      put: {
        tags: ["Buyer"],
        summary: "Update buyer account by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Buyer account updated" },
        },
      },
    },

    "/api/farmer/create-account": {
      post: {
        tags: ["Farmer"],
        summary: "Create farmer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Farmer account created" },
        },
      },
    },
    "/api/farmer/get-account/{id}": {
      get: {
        tags: ["Farmer"],
        summary: "Get farmer account by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Farmer account data" },
          "404": { description: "Farmer not found" },
        },
      },
    },
    "/api/farmer/update-account/{id}": {
      put: {
        tags: ["Farmer"],
        summary: "Update farmer account by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Farmer account updated" },
        },
      },
    },

    "/api/waste/create-waste": {
      post: {
        tags: ["Waste"],
        summary: "Create waste listing",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  wasteType: { type: "string" },
                  wasteProduct: { type: "string" },
                  wasteCategory: { type: "string" },
                  quantity: { type: "number" },
                  moisture: { type: "string" },
                  price: { type: "number" },
                  imageUrl: { type: "string" },
                  unit: { type: "string" },
                  seller: { type: "object" },
                  address: { $ref: "#/components/schemas/Address" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Waste created" },
        },
      },
    },
    "/api/waste/get-wastes": {
      get: {
        tags: ["Waste"],
        summary: "Get waste list",
        parameters: [
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          "200": { description: "Paginated waste list" },
        },
      },
    },
    "/api/waste/get-single/{id}": {
      get: {
        tags: ["Waste"],
        summary: "Get single waste by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Waste item" },
        },
      },
    },
    "/api/waste/get-waste/{id}": {
      get: {
        tags: ["Waste"],
        summary: "Get waste list by seller id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          "200": { description: "Seller waste list" },
        },
      },
    },
    "/api/waste/update-waste/{id}": {
      put: {
        tags: ["Waste"],
        summary: "Update waste by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Waste updated" },
        },
      },
    },
    "/api/waste/delete/{id}": {
      delete: {
        tags: ["Waste"],
        summary: "Delete waste by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Waste deleted" },
        },
      },
    },

    "/api/order/create-order": {
      post: {
        tags: ["Order"],
        summary: "Create one or many orders",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { type: "object" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Orders created" },
        },
      },
    },
    "/api/order/get-order/farmer/{id}": {
      get: {
        tags: ["Order"],
        summary: "Get orders by farmer id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          "200": { description: "Farmer order list" },
        },
      },
    },
    "/api/order/get-order/buyer/{id}": {
      get: {
        tags: ["Order"],
        summary: "Get orders by buyer id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          "200": { description: "Buyer order list" },
        },
      },
    },
    "/api/order/get-order/{id}": {
      get: {
        tags: ["Order"],
        summary: "Get order by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Order details" },
        },
      },
    },
    "/api/order/confirm-order/{orderId}": {
      patch: {
        tags: ["Order"],
        summary: "Confirm pending order",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Order confirmed" },
          "409": { description: "Validation or stock conflict" },
        },
      },
    },
    "/api/order/delivery-charge/{orderId}": {
      patch: {
        tags: ["Order"],
        summary: "Set delivery charge for farmer delivery",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  deliveryCharge: { type: "number", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Delivery charge set" },
        },
      },
    },
    "/api/order/review-price/{orderId}": {
      patch: {
        tags: ["Order"],
        summary: "Buyer reviews delivery quote",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  action: {
                    type: "string",
                    enum: ["accept", "reject"],
                  },
                },
                required: ["action"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Review submitted" },
        },
      },
    },
    "/api/order/cancel-order/{orderId}": {
      patch: {
        tags: ["Order"],
        summary: "Cancel order",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Order cancelled" },
        },
      },
    },
    "/api/order/confirm-delivery/{id}": {
      patch: {
        tags: ["Order"],
        summary: "Confirm order delivery via secret code",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  secretCode: { type: "string" },
                },
                required: ["secretCode"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Delivery confirmed" },
        },
      },
    },
    "/api/order/setoutFor-delivered/{id}": {
      patch: {
        tags: ["Order"],
        summary: "Mark order as out for delivery",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Order updated" },
        },
      },
    },

    "/api/negotiation/add-negotiation": {
      post: {
        tags: ["Negotiation"],
        summary: "Create negotiation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Negotiation created" },
        },
      },
    },
    "/api/negotiation/get-negotiation/farmer/{id}": {
      get: {
        tags: ["Negotiation"],
        summary: "Get negotiations by farmer id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Farmer negotiations" },
        },
      },
    },
    "/api/negotiation/get-negotiation/buyer/{id}": {
      get: {
        tags: ["Negotiation"],
        summary: "Get negotiations by buyer id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Buyer negotiations" },
        },
      },
    },
    "/api/negotiation/update-status": {
      patch: {
        tags: ["Negotiation"],
        summary: "Update negotiation status",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Negotiation updated" },
        },
      },
    },

    "/api/notification/send-notification": {
      post: {
        tags: ["Notification"],
        summary: "Send notification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Notification sent" },
        },
      },
    },
    "/api/notification/get-notification/{id}": {
      get: {
        tags: ["Notification"],
        summary: "Get notifications by user id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Notification list" },
        },
      },
    },
    "/api/notification/read-notification/{id}": {
      patch: {
        tags: ["Notification"],
        summary: "Mark notification as read",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Notification updated" },
        },
      },
    },
    "/api/notification/delete-notification/{id}": {
      delete: {
        tags: ["Notification"],
        summary: "Delete notification",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Notification deleted" },
        },
      },
    },

    "/api/community/posts": {
      get: {
        tags: ["Community"],
        summary: "List community posts",
        responses: {
          "200": { description: "Community post list" },
        },
      },
      post: {
        tags: ["Community"],
        summary: "Create community post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "201": { description: "Community post created" },
        },
      },
    },
    "/api/community/posts/{id}": {
      delete: {
        tags: ["Community"],
        summary: "Delete community post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Community post deleted" },
        },
      },
      patch: {
        tags: ["Community"],
        summary: "Update community post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Community post updated" },
        },
      },
    },
    "/api/community/posts/{id}/like": {
      patch: {
        tags: ["Community"],
        summary: "Toggle community like",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Like toggled" },
        },
      },
    },
    "/api/community/posts/{id}/save": {
      patch: {
        tags: ["Community"],
        summary: "Toggle community save",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Save toggled" },
        },
      },
    },
    "/api/community/posts/{id}/replies": {
      post: {
        tags: ["Community"],
        summary: "Add community reply",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "201": { description: "Reply added" },
        },
      },
    },
    "/api/community/posts/{id}/replies/{replyId}": {
      patch: {
        tags: ["Community"],
        summary: "Update community reply",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "replyId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Reply updated" },
        },
      },
      delete: {
        tags: ["Community"],
        summary: "Delete community reply",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "replyId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Reply deleted" },
        },
      },
    },
  },
} as const;
