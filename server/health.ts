import { Request, Response } from 'express';
import { db } from './db';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connectivity
    await db.execute('SELECT 1');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        server: 'running'
      },
      uptime: process.uptime()
    };

    res.status(200).json(health);
  } catch (error) {
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'disconnected',
        server: 'running'
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    };

    res.status(503).json(health);
  }
}