import swaggerJsdoc from 'swagger-jsdoc';

const apiBasePath = '/api/v1';
const publicApiUrl = process.env.PUBLIC_API_URL?.replace(/\/$/, '');
const commonErrorResponses = {
    '429': { $ref: '#/components/responses/TooManyRequests' },
    '500': { $ref: '#/components/responses/InternalError' },
};
const protectedErrorResponses = {
    '401': { $ref: '#/components/responses/Unauthorized' },
    ...commonErrorResponses,
};
const adminErrorResponses = {
    ...protectedErrorResponses,
    '403': { $ref: '#/components/responses/Forbidden' },
};

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ASTU Complaint & Issue Tracking System API',
            version: '1.0.0',
            description: 'REST API for managing campus complaints, user authentication, notifications, and AI-assisted triage at Adama Science and Technology University. For full cURL test examples of every endpoint, see docs/api-test-examples.md in the repository.',
            contact: {
                name: 'ASTU IT Department',
                email: 'it@astu.edu.et',
            },
        },
        servers: publicApiUrl
            ? [
                { url: `${publicApiUrl}${apiBasePath}`, description: 'Public deployment URL' },
                { url: apiBasePath, description: 'Relative API base path' },
            ]
            : [
                { url: apiBasePath, description: 'Relative API base path' },
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
                ErrorDetail: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: 'Invalid request payload' },
                        details: { type: 'array', items: { type: 'object' }, nullable: true },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { $ref: '#/components/schemas/ErrorDetail' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', nullable: true, example: 'Operation successful' },
                        data: { type: 'object', nullable: true },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: '2c95e9e4-85f9-4f1e-a2df-66cc3ce74231' },
                        full_name: { type: 'string', example: 'Abebe Kebede' },
                        email: { type: 'string', format: 'email', example: 'abebe@astu.edu.et' },
                        role: { type: 'string', enum: ['student', 'staff', 'admin'], example: 'student' },
                        department_id: { type: 'string', format: 'uuid', nullable: true, example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                    },
                },
                Complaint: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: '6e514645-ec8f-4a89-a91c-1ee4f53c0a50' },
                        ticket_number: { type: 'string', example: 'ASTU-2026-000124' },
                        title: { type: 'string', example: 'Water leakage in dormitory block C' },
                        description: { type: 'string', example: 'There is continuous water leakage near room C-214 causing unsafe floor conditions.' },
                        status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'], example: 'open' },
                        category_id: { type: 'string', format: 'uuid', example: 'c6f8f17c-619b-4f31-8b09-c8bf3864f83e' },
                        submitted_by: { type: 'string', format: 'uuid', example: '2c95e9e4-85f9-4f1e-a2df-66cc3ce74231' },
                        department_id: { type: 'string', format: 'uuid', example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                        created_at: { type: 'string', format: 'date-time', example: '2026-02-28T10:15:00.000Z' },
                    },
                },
                TokenPair: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh' },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: 'Authentication required or token invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                unauthorized: {
                                    value: {
                                        success: false,
                                        error: { code: 'UNAUTHORIZED', message: 'Access token is missing or invalid' },
                                    },
                                },
                            },
                        },
                    },
                },
                Forbidden: {
                    description: 'Insufficient permission',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                forbidden: {
                                    value: {
                                        success: false,
                                        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
                                    },
                                },
                            },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                ValidationError: {
                    description: 'Invalid request payload or query parameters',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                Conflict: {
                    description: 'Resource conflict',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                TooManyRequests: {
                    description: 'Too many requests. Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
                    },
                },
                InternalError: {
                    description: 'Unexpected server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            examples: {
                                internal: {
                                    value: {
                                        success: false,
                                        error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred' },
                                    },
                                },
                            },
                        },
                    },
                },
                ServiceUnavailable: {
                    description: 'Service temporarily unavailable',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                        },
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
                    operationId: 'getHealth',
                    security: [],
                    responses: {
                        '200': { description: 'Healthy service' },
                        '503': { $ref: '#/components/responses/ServiceUnavailable' },
                        ...commonErrorResponses,
                    },
                },
            },
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new student account',
                    operationId: 'register',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['full_name', 'university_id', 'email', 'password'],
                                    properties: {
                                        full_name: { type: 'string', example: 'Abebe Kebede' },
                                        university_id: { type: 'string', example: 'UGR/12345/15' },
                                        email: { type: 'string', format: 'email', example: 'abebe@astu.edu.et' },
                                        password: { type: 'string', minLength: 8, example: 'StrongPass1' },
                                        department_id: { type: 'string', format: 'uuid', nullable: true, example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '201': { description: 'Registration successful' },
                        '409': { $ref: '#/components/responses/Conflict' },
                        '422': { $ref: '#/components/responses/ValidationError' },
                        ...commonErrorResponses,
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login with email and password',
                    operationId: 'login',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email', example: 'abebe@astu.edu.et' },
                                        password: { type: 'string', example: 'StrongPass1' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Login successful with tokens' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '423': { description: 'Account temporarily locked' },
                        '422': { $ref: '#/components/responses/ValidationError' },
                        ...commonErrorResponses,
                    },
                },
            },
            '/auth/refresh': {
                post: {
                    tags: ['Auth'],
                    summary: 'Refresh access token',
                    operationId: 'refreshToken',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['refresh_token'],
                                    properties: {
                                        refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.refresh.token' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Token refreshed' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '422': { $ref: '#/components/responses/ValidationError' },
                        ...commonErrorResponses,
                    },
                },
            },
            '/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Logout user and invalidate refresh token',
                    operationId: 'logout',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['refresh_token'],
                                    properties: {
                                        refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.refresh.token' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Logout successful' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/auth/me': {
                get: {
                    tags: ['Auth'],
                    summary: 'Get current user profile',
                    operationId: 'getCurrentUser',
                    responses: {
                        '200': { description: 'User profile' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/auth/change-password': {
                patch: {
                    tags: ['Auth'],
                    summary: 'Change current user password',
                    operationId: 'changePassword',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['current_password', 'new_password'],
                                    properties: {
                                        current_password: { type: 'string', example: 'StrongPass1' },
                                        new_password: { type: 'string', minLength: 8, example: 'NewStrongPass2' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Password changed successfully' },
                        '400': { $ref: '#/components/responses/ValidationError' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/complaints': {
                get: {
                    tags: ['Complaints'],
                    summary: 'List complaints with filtering and pagination',
                    operationId: 'listComplaints',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', example: 20 } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'] } },
                        { name: 'category_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
                        { name: 'department_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
                        { name: 'from', in: 'query', schema: { type: 'string', example: '2026-01-01' } },
                        { name: 'to', in: 'query', schema: { type: 'string', example: '2026-12-31' } },
                        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'status'] } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] } },
                    ],
                    responses: {
                        '200': { description: 'Paginated complaint list' },
                        ...protectedErrorResponses,
                    },
                },
                post: {
                    tags: ['Complaints'],
                    summary: 'Submit a new complaint',
                    operationId: 'createComplaint',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'description', 'category_id'],
                                    properties: {
                                        title: { type: 'string', example: 'Water leakage in dormitory block C' },
                                        description: { type: 'string', example: 'Leakage near room C-214 has persisted for two days and needs urgent fix.' },
                                        category_id: { type: 'string', format: 'uuid', example: 'c6f8f17c-619b-4f31-8b09-c8bf3864f83e' },
                                        location: { type: 'string', example: 'Dormitory Block C, second floor' },
                                        attachments: { type: 'array', items: { type: 'string', format: 'binary' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '201': { description: 'Complaint created' },
                        '400': { $ref: '#/components/responses/ValidationError' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/complaints/{id}': {
                get: {
                    tags: ['Complaints'],
                    summary: 'Get complaint details by ID',
                    operationId: 'getComplaintById',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        '200': { description: 'Complaint details' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...protectedErrorResponses,
                    },
                },
                delete: {
                    tags: ['Complaints'],
                    summary: 'Delete complaint (admin only)',
                    operationId: 'deleteComplaint',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        '200': { description: 'Complaint deleted' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/complaints/{id}/history': {
                get: {
                    tags: ['Complaints'],
                    summary: 'Get complaint status/history timeline',
                    operationId: 'getComplaintHistory',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        '200': { description: 'Complaint history' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/complaints/{id}/status': {
                patch: {
                    tags: ['Complaints'],
                    summary: 'Update complaint status',
                    operationId: 'updateComplaintStatus',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['status'],
                                    properties: {
                                        status: { type: 'string', enum: ['in_progress', 'resolved', 'closed', 'reopened'], example: 'in_progress' },
                                        note: { type: 'string', maxLength: 500, example: 'Maintenance team assigned and parts ordered.' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Status updated' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/complaints/{id}/remarks': {
                post: {
                    tags: ['Complaints'],
                    summary: 'Add a complaint remark (staff/admin)',
                    operationId: 'addComplaintRemark',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content'],
                                    properties: {
                                        content: { type: 'string', minLength: 1, maxLength: 2000, example: 'Technician visited site and started repair.' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '201': { description: 'Remark added' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/notifications': {
                get: {
                    tags: ['Notifications'],
                    summary: 'Get user notifications',
                    operationId: 'listNotifications',
                    responses: {
                        '200': { description: 'Notification list with unread count' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/notifications/read-all': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark all notifications as read',
                    operationId: 'markAllNotificationsRead',
                    responses: {
                        '200': { description: 'All notifications marked as read' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/notifications/{id}/read': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark one notification as read',
                    operationId: 'markNotificationRead',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        '200': { description: 'Notification marked as read' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/analytics/summary': {
                get: {
                    tags: ['Analytics'],
                    summary: 'Get summary analytics',
                    operationId: 'getAnalyticsSummary',
                    responses: {
                        '200': { description: 'Dashboard stats by status' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/analytics/timeseries': {
                get: {
                    tags: ['Analytics'],
                    summary: 'Get complaints time series (admin only)',
                    operationId: 'getAnalyticsTimeSeries',
                    parameters: [
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['daily', 'weekly', 'monthly'], example: 'daily' } },
                        { name: 'days', in: 'query', schema: { type: 'integer', minimum: 1, example: 30 } },
                    ],
                    responses: {
                        '200': { description: 'Time series data' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/chatbot/message': {
                post: {
                    tags: ['Chatbot'],
                    summary: 'Send a message to the AI campus assistant',
                    operationId: 'sendChatbotMessage',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['message'],
                                    properties: {
                                        message: { type: 'string', example: 'How can I submit a complaint about internet outage?' },
                                        history: {
                                            type: 'array',
                                            items: { type: 'object' },
                                            example: [
                                                { role: 'user', content: 'Hello' },
                                                { role: 'assistant', content: 'Hi! How can I help you today?' },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'AI reply' },
                        '400': { $ref: '#/components/responses/ValidationError' },
                        '503': { $ref: '#/components/responses/ServiceUnavailable' },
                        ...protectedErrorResponses,
                    },
                },
            },
            '/admin/users': {
                get: {
                    tags: ['Admin'],
                    summary: 'List all users (admin only)',
                    operationId: 'listUsers',
                    responses: {
                        '200': { description: 'Paginated user list' },
                        ...adminErrorResponses,
                    },
                },
                post: {
                    tags: ['Admin'],
                    summary: 'Create a staff account (admin only)',
                    operationId: 'createStaffUser',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        full_name: { type: 'string', example: 'Getachew Tadesse' },
                                        email: { type: 'string', format: 'email', example: 'getachew.staff@astu.edu.et' },
                                        university_id: { type: 'string', example: 'STAFF/2026/002' },
                                        password: { type: 'string', example: 'StrongPass1' },
                                        department_id: { type: 'string', format: 'uuid', nullable: true, example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '201': { description: 'Staff account created' },
                        '409': { $ref: '#/components/responses/Conflict' },
                        '422': { $ref: '#/components/responses/ValidationError' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/admin/users/{id}/role': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Update user role (admin only)',
                    operationId: 'updateUserRole',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['role'],
                                    properties: {
                                        role: { type: 'string', enum: ['student', 'staff', 'admin'], example: 'staff' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Role updated' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/admin/users/{id}/deactivate': {
                patch: {
                    tags: ['Admin'],
                    summary: 'Deactivate a user account (admin only)',
                    operationId: 'deactivateUser',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: {
                        '200': { description: 'Account deactivated' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/categories': {
                get: {
                    tags: ['Categories'],
                    summary: 'List categories (authenticated users)',
                    operationId: 'listCategories',
                    responses: {
                        '200': { description: 'Category list' },
                        ...protectedErrorResponses,
                    },
                },
                post: {
                    tags: ['Categories'],
                    summary: 'Create category (admin only)',
                    operationId: 'createCategory',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'department_id'],
                                    properties: {
                                        name: { type: 'string', example: 'Water and Sanitation' },
                                        description: { type: 'string', nullable: true, example: 'Handles water supply and sanitation issues in campus buildings.' },
                                        department_id: { type: 'string', format: 'uuid', example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '201': { description: 'Category created' },
                        '422': { $ref: '#/components/responses/ValidationError' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/categories/{id}': {
                patch: {
                    tags: ['Categories'],
                    summary: 'Update category (admin only)',
                    operationId: 'updateCategory',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Water and Utilities' },
                                        description: { type: 'string', nullable: true, example: 'Updated category name for utility issues.' },
                                        department_id: { type: 'string', format: 'uuid', example: 'd5a39e6e-38d6-4b83-95df-2f28a69d2b80' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Category updated' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        ...adminErrorResponses,
                    },
                },
            },
            '/departments': {
                get: {
                    tags: ['Departments'],
                    summary: 'List departments (admin only)',
                    operationId: 'listDepartments',
                    responses: {
                        '200': { description: 'Department list' },
                        ...adminErrorResponses,
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
