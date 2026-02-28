import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ASTU Complaint & Issue Tracking System API',
            version: '1.0.0',
            description: 'REST API for managing campus complaints, user authentication, notifications, and AI-assisted triage at Adama Science and Technology University.',
            contact: {
                name: 'ASTU IT Department',
                email: 'it@astu.edu.et',
            },
        },
        servers: [
            { url: '/api', description: 'API base path' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        full_name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['student', 'staff', 'admin'] },
                        department_id: { type: 'string', format: 'uuid', nullable: true },
                    },
                },
                Complaint: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        ticket_number: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'] },
                        category_id: { type: 'string', format: 'uuid' },
                        submitted_by: { type: 'string', format: 'uuid' },
                        department_id: { type: 'string', format: 'uuid' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        paths: {
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new student account',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['full_name', 'university_id', 'email', 'password'],
                                    properties: {
                                        full_name: { type: 'string' },
                                        university_id: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', minLength: 8 },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '201': { description: 'Registration successful' } },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login with email and password',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Login successful with tokens' } },
                },
            },
            '/auth/me': {
                get: {
                    tags: ['Auth'],
                    summary: 'Get current user profile',
                    responses: { '200': { description: 'User profile' } },
                },
            },
            '/complaints': {
                get: {
                    tags: ['Complaints'],
                    summary: 'List complaints with filtering and pagination',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                        { name: 'status', in: 'query', schema: { type: 'string' } },
                    ],
                    responses: { '200': { description: 'Paginated complaint list' } },
                },
                post: {
                    tags: ['Complaints'],
                    summary: 'Submit a new complaint',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'description', 'category_id'],
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        category_id: { type: 'string', format: 'uuid' },
                                        location: { type: 'string' },
                                        attachments: { type: 'array', items: { type: 'string', format: 'binary' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '201': { description: 'Complaint created' } },
                },
            },
            '/complaints/{id}': {
                get: {
                    tags: ['Complaints'],
                    summary: 'Get complaint details by ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Complaint details' } },
                },
            },
            '/complaints/{id}/status': {
                patch: {
                    tags: ['Complaints'],
                    summary: 'Update complaint status',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Status updated' } },
                },
            },
            '/notifications': {
                get: {
                    tags: ['Notifications'],
                    summary: 'Get user notifications',
                    responses: { '200': { description: 'Notification list with unread count' } },
                },
            },
            '/analytics/dashboard': {
                get: {
                    tags: ['Analytics'],
                    summary: 'Get dashboard statistics',
                    responses: { '200': { description: 'Dashboard stats by status' } },
                },
            },
            '/chatbot/message': {
                post: {
                    tags: ['Chatbot'],
                    summary: 'Send a message to the AI campus assistant',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['message'],
                                    properties: {
                                        message: { type: 'string' },
                                        history: { type: 'array', items: { type: 'object' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'AI reply' } },
                },
            },
            '/admin/users': {
                get: {
                    tags: ['Admin'],
                    summary: 'List all users (admin only)',
                    responses: { '200': { description: 'Paginated user list' } },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
