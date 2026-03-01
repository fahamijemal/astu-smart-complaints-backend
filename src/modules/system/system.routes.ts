import { Router } from 'express';
import { env } from '../../config/env';
import { sendSuccess } from '../../utils/response';

const router: Router = Router();

router.get('/', (req, res) => {
    const baseUrl = process.env.PUBLIC_API_URL?.replace(/\/$/, '')
        ?? `${req.protocol}://${req.get('host')}`;
    const docsUrl = `${baseUrl}/api/docs`;
    const openapiUrl = `${baseUrl}/api/docs.json`;
    const healthUrl = `${baseUrl}/api/v1/health`;

    res.setHeader('Cache-Control', 'no-store');

    if (req.accepts('html')) {
        return res.status(200).type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ASTU Complaint API</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
        background: #0b1020;
        color: #e5e7eb;
      }
      .wrap {
        max-width: 860px;
        margin: 48px auto;
        padding: 0 20px;
      }
      .card {
        background: linear-gradient(180deg, #111827, #0f172a);
        border: 1px solid #1f2937;
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0 0 18px; color: #9ca3af; }
      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        border: 1px solid #334155;
        color: #93c5fd;
        margin-bottom: 18px;
      }
      .links { display: grid; gap: 10px; }
      a {
        display: block;
        text-decoration: none;
        color: #e5e7eb;
        border: 1px solid #334155;
        background: #0b1220;
        border-radius: 10px;
        padding: 12px 14px;
      }
      a:hover { border-color: #60a5fa; background: #0b1326; }
      .label { color: #93c5fd; font-size: 13px; display: block; }
      .url { word-break: break-all; }
      .foot { margin-top: 16px; color: #64748b; font-size: 12px; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="card">
        <span class="badge">${env.NODE_ENV.toUpperCase()}</span>
        <h1>ASTU Complaint & Issue Tracking API</h1>
        <p>Service is running. Use the links below to inspect API health and documentation.</p>
        <div class="links">
          <a href="${docsUrl}" target="_blank" rel="noopener noreferrer">
            <span class="label">Swagger UI</span>
            <span class="url">${docsUrl}</span>
          </a>
          <a href="${openapiUrl}" target="_blank" rel="noopener noreferrer">
            <span class="label">OpenAPI JSON</span>
            <span class="url">${openapiUrl}</span>
          </a>
          <a href="${healthUrl}" target="_blank" rel="noopener noreferrer">
            <span class="label">Health Check</span>
            <span class="url">${healthUrl}</span>
          </a>
        </div>
        <p class="foot">Version 1.0.0</p>
      </section>
    </main>
  </body>
</html>`);
    }

    return sendSuccess(
        res,
        {
            name: 'ASTU Complaint & Issue Tracking API',
            status: 'ok',
            environment: env.NODE_ENV,
            version: '1.0.0',
            links: {
                docs: docsUrl,
                openapi: openapiUrl,
                health: healthUrl,
            },
        },
        'Service is running',
    );
});

export default router;
