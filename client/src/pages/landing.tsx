import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
        <div className="w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
        <div className="w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20 mb-6">
            <span className="text-sm font-medium text-blue-700">✨ Primacy Care Australia</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Primacy Care Australia CMS
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Australia's leading NDIS case management system. Streamline your service delivery with our comprehensive platform designed specifically for disability service providers.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="btn-modern text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
            data-testid="button-login"
          >
            <span className="mr-2">🚀</span>
            Start Your Journey
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                Participant Management
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                Comprehensive profiles with NDIS-specific fields, documentation, and progress tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-file-alt text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                Plan Management
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                Smart NDIS plan tracking with automated budgets, service categories, and compliance monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-calendar-check text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                Smart Scheduling
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                AI-powered booking system with intelligent staff matching and real-time availability tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-clipboard-list text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                Progress Analytics
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                Comprehensive progress documentation with outcome tracking and automated NDIS reporting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-dollar-sign text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Financial Intelligence
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                Automated invoicing, budget optimization, and real-time financial insights with SCHADS compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center card-hover group border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <i className="fas fa-chart-bar text-white text-2xl"></i>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                Compliance Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mt-3">
                Real-time compliance monitoring with automated reporting and comprehensive audit trail management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-20 text-center">
          <div className="glass-effect rounded-3xl p-12 max-w-5xl mx-auto shadow-2xl">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6">
              Built for Australian NDIS Providers
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
              Our comprehensive case management platform is designed specifically for NDIS service providers, 
              ensuring full compliance with Australian disability service requirements while streamlining operations 
              and dramatically improving participant outcomes through intelligent automation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center px-4 py-2 bg-white/60 rounded-full border border-white/20">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm font-medium text-gray-700">NDIS Compliant</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/60 rounded-full border border-white/20">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm font-medium text-gray-700">SCHADS Award Ready</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/60 rounded-full border border-white/20">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm font-medium text-gray-700">AI-Powered Automation</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/60 rounded-full border border-white/20">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm font-medium text-gray-700">Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
