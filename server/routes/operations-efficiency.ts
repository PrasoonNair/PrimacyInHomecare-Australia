import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Get efficiency metrics for roles
router.get('/efficiency', isAuthenticated, async (req, res) => {
  try {
    const { role } = req.query;
    
    // Mock efficiency data - in production, this would aggregate real metrics
    const efficiencyMetrics = {
      'support-worker': {
        serviceCompletion: { value: 94, target: 95, trend: 'up', change: 2.1 },
        responseTime: { value: 8, target: 10, trend: 'down', change: -1.5 },
        documentation: { value: 89, target: 100, trend: 'up', change: 5.2 },
        utilization: { value: 82, target: 85, trend: 'stable', change: 0.3 }
      },
      'case-manager': {
        planReviews: { value: 12, target: 15, trend: 'down', change: -2.3 },
        satisfaction: { value: 4.6, target: 4.5, trend: 'up', change: 0.2 },
        goalAchievement: { value: 78, target: 80, trend: 'up', change: 3.1 },
        caseload: { value: 24, target: 25, trend: 'stable', change: 0.5 }
      },
      'support-coordinator': {
        coordination: { value: 88, target: 90, trend: 'up', change: 1.8 },
        providerResponse: { value: 48, target: 24, trend: 'down', change: -6.2 },
        budgetUtilization: { value: 92, target: 95, trend: 'up', change: 2.7 }
      },
      'finance-officer': {
        invoiceProcessing: { value: 2.1, target: 3.0, trend: 'down', change: -0.8 },
        paymentAccuracy: { value: 99.2, target: 99.0, trend: 'stable', change: 0.1 },
        reconciliation: { value: 5, target: 7, trend: 'down', change: -1.2 }
      }
    };

    // Calculate overall efficiency scores
    const overallScores = {
      'support-worker': 87,
      'case-manager': 91,
      'support-coordinator': 85,
      'finance-officer': 93
    };

    // Recommendations based on metrics
    const recommendations = {
      'support-worker': [
        'Focus on completing progress notes within 24 hours of service delivery',
        'Use mobile app for real-time documentation during visits',
        'Schedule buffer time between services for better time management'
      ],
      'case-manager': [
        'Implement automated goal tracking to improve achievement rates',
        'Use bulk communication tools for routine participant updates',
        'Schedule quarterly review check-ins proactively'
      ],
      'support-coordinator': [
        'Establish preferred provider networks for faster response times',
        'Use automated budget tracking and alert systems',
        'Implement provider performance scorecards'
      ],
      'finance-officer': [
        'Continue leveraging automated invoice processing',
        'Implement real-time payment tracking dashboard',
        'Set up automated reconciliation alerts for discrepancies'
      ]
    };

    if (role && role !== 'all') {
      const roleKey = role.toLowerCase().replace(/[\s-]/g, '-');
      res.json({
        role: roleKey,
        metrics: efficiencyMetrics[roleKey as keyof typeof efficiencyMetrics] || {},
        overallScore: overallScores[roleKey as keyof typeof overallScores] || 0,
        recommendations: recommendations[roleKey as keyof typeof recommendations] || []
      });
    } else {
      // Return all roles data
      res.json({
        roles: Object.keys(efficiencyMetrics).map(roleKey => ({
          role: roleKey,
          metrics: efficiencyMetrics[roleKey as keyof typeof efficiencyMetrics],
          overallScore: overallScores[roleKey as keyof typeof overallScores],
          recommendations: recommendations[roleKey as keyof typeof recommendations]
        })),
        systemAverage: Object.values(overallScores).reduce((sum, score) => sum + score, 0) / Object.values(overallScores).length
      });
    }
  } catch (error) {
    console.error('Error fetching efficiency metrics:', error);
    res.status(500).json({ error: 'Failed to fetch efficiency metrics' });
  }
});

// Get automation opportunities
router.get('/automation-opportunities', isAuthenticated, async (req, res) => {
  try {
    const opportunities = [
      {
        id: 'progress-note-automation',
        title: 'Automated Progress Notes',
        description: 'Auto-generate progress notes from service completion data',
        potentialSavings: '40% time reduction',
        complexity: 'medium',
        roi: 'high',
        affectedRoles: ['Support Worker', 'Case Manager']
      },
      {
        id: 'scheduling-optimization',
        title: 'AI-Powered Scheduling',
        description: 'Optimize staff and participant scheduling using machine learning',
        potentialSavings: '25% efficiency gain',
        complexity: 'high',
        roi: 'very-high',
        affectedRoles: ['Service Delivery Manager', 'Support Coordinator']
      },
      {
        id: 'invoice-automation',
        title: 'Complete Invoice Automation',
        description: 'Fully automate invoice generation, approval, and payment processing',
        potentialSavings: '80% faster processing',
        complexity: 'low',
        roi: 'high',
        affectedRoles: ['Finance Officer', 'Finance Manager']
      },
      {
        id: 'compliance-monitoring',
        title: 'Real-time Compliance Monitoring',
        description: 'Continuous monitoring of NDIS compliance with automated alerts',
        potentialSavings: '90% error reduction',
        complexity: 'medium',
        roi: 'very-high',
        affectedRoles: ['Quality Manager', 'All Staff']
      }
    ];

    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching automation opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch automation opportunities' });
  }
});

// Get role-specific performance insights
router.get('/performance-insights/:role', isAuthenticated, async (req, res) => {
  try {
    const { role } = req.params;
    
    // Mock performance insights based on role
    const insights = {
      'support-worker': {
        currentPerformance: 87,
        benchmarkComparison: 'Above average (+5%)',
        topStrengths: ['Service delivery quality', 'Participant rapport', 'Punctuality'],
        improvementAreas: ['Documentation speed', 'Digital tool usage'],
        actionableSteps: [
          'Complete mobile documentation training',
          'Use voice-to-text for faster note taking',
          'Set documentation reminders 30 minutes post-service'
        ]
      },
      'case-manager': {
        currentPerformance: 91,
        benchmarkComparison: 'Excellent (+12%)',
        topStrengths: ['Plan management', 'Goal achievement', 'Participant satisfaction'],
        improvementAreas: ['Review timeline', 'Technology adoption'],
        actionableSteps: [
          'Implement automated goal tracking system',
          'Schedule proactive review reminders',
          'Use bulk communication tools for routine updates'
        ]
      }
    };

    const roleKey = role.toLowerCase().replace(/[\s-]/g, '-');
    const insight = insights[roleKey as keyof typeof insights];

    if (!insight) {
      return res.status(404).json({ error: 'Performance insights not found for this role' });
    }

    res.json(insight);
  } catch (error) {
    console.error('Error fetching performance insights:', error);
    res.status(500).json({ error: 'Failed to fetch performance insights' });
  }
});

export default router;