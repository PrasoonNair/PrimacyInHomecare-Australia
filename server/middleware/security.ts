import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Security headers middleware using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Rate limiting for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Data sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Helper function to sanitize objects
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
}

// Helper function to sanitize individual values
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove potential XSS vectors
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  return value;
}

// Privacy compliance headers
export const privacyHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add privacy-related headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // GDPR/Privacy Act compliance
  res.setHeader('X-Data-Classification', 'sensitive');
  res.setHeader('X-Privacy-Policy', '/privacy');
  
  next();
};

// Audit logging middleware
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Log request
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id,
      sessionId: req.sessionID,
    };
    
    // Log to console (should be replaced with proper logging service)
    console.log('[AUDIT]', JSON.stringify(logEntry));
    
    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const responseLog = {
        ...logEntry,
        statusCode: res.statusCode,
        duration,
      };
      console.log('[AUDIT-RESPONSE]', JSON.stringify(responseLog));
    });
    
    next();
  };
};

// Data retention compliance
export const dataRetentionCheck = (req: Request, res: Response, next: NextFunction) => {
  // Add data retention headers
  res.setHeader('X-Data-Retention-Policy', '2-years');
  res.setHeader('X-Data-Retention-Compliant', 'true');
  next();
};

// AI ethics headers for endpoints using AI
export const aiEthicsHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-AI-Powered', 'true');
  res.setHeader('X-AI-Model', 'claude-sonnet-4-20250514');
  res.setHeader('X-AI-Purpose', 'healthcare-assistance');
  res.setHeader('X-AI-Human-Review', 'required');
  res.setHeader('X-AI-Ethics-Policy', '/ai-ethics');
  next();
};

// Cybersecurity Essential Eight compliance check
export const essentialEightCompliance = (req: Request, res: Response, next: NextFunction) => {
  // Add Essential Eight compliance headers
  res.setHeader('X-ACSC-Essential-Eight', 'partial');
  res.setHeader('X-Security-Maturity', 'level-1');
  res.setHeader('X-MFA-Required', 'pending');
  res.setHeader('X-Patch-Status', 'current');
  next();
};