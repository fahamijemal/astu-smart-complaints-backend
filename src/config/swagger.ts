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
            { url: '/api/v1', description: 'Versioned API base path' },
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
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', nullable: true },
                        data: { type: 'object', nullable: true },
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
        tags: [
            { name: 'Health', description: 'Service health and status' },
            { name: 'Auth', description: 'Authentication and account management' },
            { name: 'Complaints', description: 'Complaint lifecycle operations' },
            { name: 'Notifications', description: 'Notification management' },
            { name: 'Chatbot', description: 'AI assistant endpoints' },
            { name: 'Analytics', description: 'Reporting and analytics endpoints' },
            { name: 'Admin', description: 'Admin-only user management endpoints' },
            { name: 'Categories', description: 'Category management endpoints' },
            { name: 'Departments', description: 'Department listing endpoint' },
        ],
        security: [{ bearerAuth: [] }],
        paths: {
            '/health': {
                get: {
                    tags: ['Health'],
                    summary: 'Health check',
                    security: [],
                    responses: {
                        '200': { description: 'Healthy service' },
                        '503': { description: 'Service degraded' },
                    },
                },
            },
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
                                        department_id: { type: 'string', format: 'uuid', nullable: true },
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
            '/auth/refresh': {
                post: {
                    tags: ['Auth'],
                    summary: 'Refresh access token',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['refresh_token'],
                                    properties: {
                                        refresh_token: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Token refreshed' } },
                },
            },
            '/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Logout user and invalidate refresh token',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['refresh_token'],
                                    properties: {
                                        refresh_token: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Logout successful' } },
                },
            },
            '/auth/me': {
                get: {
                    tags: ['Auth'],
                    summary: 'Get current user profile',
                    responses: { '200': { description: 'User profile' } },
                },
            },
            '/auth/change-password': {
                patch: {
                    tags: ['Auth'],
                    summary: 'Change current user password',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['current_password', 'new_password'],
                                    properties: {
                                        current_password: { type: 'string' },
                                        new_password: { type: 'string', minLength: 8 },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Password changed successfully' } },
                },
            },
            '/complaints': {
                get: {
                    tags: ['Complaints'],
                    summary: 'List complaints with filtering and pagination',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'] } },
                        { name: 'category_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
                        { name: 'department_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
                        { name: 'from', in: 'query', schema: { type: 'string' } },
                        { name: 'to', in: 'query', schema: { type: 'string' } },
                        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'status'] } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] } },
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
                delete: {
                    tags: ['Complaints'],
                    summary: 'Delete complaint (admin only)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Complaint deleted' } },
                },
            },
            '/complaints/{id}/history': {
                get: {
                    tags: ['Complaints'],
                    summary: 'Get complaint status/history timeline',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Complaint history' } },
                },
            },
            '/complaints/{id}/status': {
                patch: {
                    tags: ['Complaints'],
                    summary: 'Update complaint status',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['status'],
                                    properties: {
                                        status: { type: 'string', enum: ['in_progress', 'resolved', 'closed', 'reopened'] },
                                        note: { type: 'string', maxLength: 500 },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Status updated' } },
                },
            },
            '/complaints/{id}/remarks': {
                post: {
                    tags: ['Complaints'],
                    summary: 'Add a complaint remark (staff/admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content'],
                                    properties: {
                                        content: { type: 'string', minLength: 1, maxLength: 2000 },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '201': { description: 'Remark added' } },
                },
            },
            '/notifications': {
                get: {
                    tags: ['Notifications'],
                    summary: 'Get user notifications',
                    responses: { '200': { description: 'Notification list with unread count' } },
                },
            },
            '/notifications/read-all': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark all notifications as read',
                    responses: { '200': { description: 'All notifications marked as read' } },
                },
            },
            '/notifications/{id}/read': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark one notification as read',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Notification marked as read' } },
                },
            },
            '/analytics/summary': {
                get: {
                    tags: ['Analytics'],
                    summary: 'Get summary analytics',
                    responses: { '200': { description: 'Dashboard stats by status' } },
                },
            },
            '/analytics/timeseries': {
                get: {
                    tags: ['Analytics'],
                    summary: 'Get complaints time series (admin only)',
                    parameters: [
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
                        { name: 'days', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    ],
                    responses: { '200': { description: 'Time series data' } },
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
                post: {
                    tags: ['Admin'],
                    summary: 'Create a staff account (admin only)',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        full_name: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        university_id: { type: 'string' },
                                        password: { type: 'string' },
                                        department_id: { type: 'string', format: 'uuid', nullable: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '201': { description: 'Staff account created' } },
                },
            },
            '/admin/users/{id}/role': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Update user role (admin only)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['role'],
                                    properties: {
                                        role: { type: 'string', enum: ['student', 'staff', 'admin'] },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Role updated' } },
                },
            },
            '/admin/users/{id}/deactivate': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Deactivate a user account (admin only)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'Account deactivated' } },
                },
            },
            '/categories': {
                get: {
                    tags: ['Categories'],
                    summary: 'List categories (authenticated users)',
                    responses: { '200': { description: 'Category list' } },
                },
                post: {
                    tags: ['Categories'],
                    summary: 'Create category (admin only)',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'department_id'],
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string', nullable: true },
                                        department_id: { type: 'string', format: 'uuid' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '201': { description: 'Category created' } },
                },
            },
            '/categories/{id}': {
                patch: {
                    tags: ['Categories'],
                    summary: 'Update category (admin only)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string', nullable: true },
                                        department_id: { type: 'string', format: 'uuid' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { '200': { description: 'Category updated' } },
                },
            },
            '/departments': {
                get: {
                    tags: ['Departments'],
                    summary: 'List departments (admin only)',
                    responses: { '200': { description: 'Department list' } },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
