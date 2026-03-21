import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import projectRoutes from './routes/projects';
import materialRoutes from './routes/materials';
import laborRoutes from './routes/labor';
import taskRoutes from './routes/tasks';
import documentRoutes from './routes/documents';
import contactRoutes from './routes/contact';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || '*', // allow netlify + local
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ ROOT ROUTE (VERY IMPORTANT FOR RENDER)
app.get('/', (_req, res) => {
  res.send('🚀 SiteCraft API is running successfully');
});

// ✅ Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contact', contactRoutes);

// ❌ 404 handler (IMPORTANT)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ❌ Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 SiteCraft API server running on port ${PORT}`);
});

export default app;