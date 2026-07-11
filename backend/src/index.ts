import 'dotenv/config';
import express from 'express';
import path from 'path';
import sitesRouter from './routes/sites';
import recordsRouter from './routes/records';
import { closeDb } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

app.use('/api/sites', sitesRouter);
app.use('/api/records', recordsRouter);

const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await closeDb();
  server.close(() => {
    process.exit(0);
  });
});
