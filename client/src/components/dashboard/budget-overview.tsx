import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetOverview() {
  // Mock data - in a real app this would come from API
  const budgetData = [
    {
      category: "Core Supports",
      percentage: 68,
      amount: "$42,500 / $62,500",
      color: "bg-ndis-primary"
    },
    {
      category: "Capacity Building", 
      percentage: 45,
      amount: "$18,000 / $40,000",
      color: "bg-ndis-secondary"
    },
    {
      category: "Capital Supports",
      percentage: 12,
      amount: "$1,800 / $15,000", 
      color: "bg-ndis-accent"
    }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {budgetData.map((budget) => (
            <div key={budget.category}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                <span 
                  className="text-sm text-gray-600" 
                  data-testid={`text-budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}-percentage`}
                >
                  {budget.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${budget.color} h-2 rounded-full`}
                  style={{ width: `${budget.percentage}%` }}
                ></div>
              </div>
              <p 
                className="text-xs text-gray-600 mt-1" 
                data-testid={`text-budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}-amount`}
              >
                {budget.amount}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
