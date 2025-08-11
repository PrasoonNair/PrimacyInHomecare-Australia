import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">NDIS Manager</h1>
          <p className="text-xl text-gray-600 mb-8">Comprehensive Case Management System for NDIS Service Providers</p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-blue-700 text-white px-8 py-4 text-lg"
            data-testid="button-login"
          >
            Sign In to Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-users text-primary text-2xl"></i>
              </div>
              <CardTitle>Participant Management</CardTitle>
              <CardDescription>Comprehensive profiles with NDIS-specific fields and documentation</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-file-alt text-secondary text-2xl"></i>
              </div>
              <CardTitle>Plan Management</CardTitle>
              <CardDescription>Track NDIS plans, budgets, and service categories with compliance monitoring</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-calendar-check text-accent text-2xl"></i>
              </div>
              <CardTitle>Service Scheduling</CardTitle>
              <CardDescription>Efficient booking and scheduling system with staff assignment and tracking</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-clipboard-list text-purple-600 text-2xl"></i>
              </div>
              <CardTitle>Progress Documentation</CardTitle>
              <CardDescription>Detailed progress notes and outcome tracking for NDIS reporting</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-dollar-sign text-error text-2xl"></i>
              </div>
              <CardTitle>Financial Management</CardTitle>
              <CardDescription>Invoice generation, budget tracking, and financial reporting</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="fas fa-chart-bar text-warning text-2xl"></i>
              </div>
              <CardTitle>Compliance Reporting</CardTitle>
              <CardDescription>Generate NDIS-compliant reports and maintain audit trails</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Australian NDIS Providers</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive case management system is designed specifically for NDIS service providers, 
            ensuring compliance with Australian disability service requirements while streamlining operations 
            and improving participant outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}
