import express from 'express';
import config from './config';
import webhookRouter from './routes/webhook';

const app = express();

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Code Review Bot is running',
    env: config.NODE_ENV,
  });
});

// Webhook route — raw body parser applied here only
app.use('/api', webhookRouter);

// JSON parser for everything else
app.use(express.json());

app.listen(config.PORT, () => {
  console.log(`✅ Server running on http://localhost:${config.PORT}`);
});

export default app;