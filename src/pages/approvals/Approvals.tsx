import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { useState } from "react";

const Approvals = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const pendingApprovals = [
    {
      id: 1,
      type: "Skill Assessment",
      requester: "John Smith",
      title: "React Advanced Certification",
      description: "Request to update skill level from Intermediate to Advanced",
      priority: "High",
      submitDate: "2024-01-20",
      dueDate: "2024-01-25"
    },
    {
      id: 2,
      type: "Training Request",
      requester: "Sarah Johnson", 
      title: "AWS Cloud Architecture Course",
      description: "External training course approval needed",
      priority: "Medium",
      submitDate: "2024-01-19",
      dueDate: "2024-01-28"
    },
    {
      id: 3,
      type: "Skill Addition",
      requester: "Mike Chen",
      title: "Add Machine Learning Skills",
      description: "Request to add new skill category and assessment",
      priority: "Low",
      submitDate: "2024-01-18",
      dueDate: "2024-01-30"
    }
  ];

  const recentActions = [
    {
      id: 1,
      action: "Approved",
      title: "Python Certification Request",
      approver: "Admin User",
      date: "2024-01-20"
    },
    {
      id: 2,
      action: "Rejected",
      title: "Overtime Skills Assessment",
      approver: "Manager User",
      date: "2024-01-19"
    },
    {
      id: 3,
      action: "Approved",
      title: "New Team Member Onboarding",
      approver: "HR Manager",
      date: "2024-01-18"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage pending approval requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 high priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <XCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5d</div>
            <p className="text-xs text-muted-foreground">-0.5d improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Items awaiting your review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <p className="font-medium">{approval.title}</p>
                      <p className="text-sm text-muted-foreground">{approval.description}</p>
                    </div>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {approval.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>By: {approval.requester}</span>
                    <span>Due: {approval.dueDate}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
            <CardDescription>
              Recently processed approval requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      By: {action.approver} • {action.date}
                    </p>
                  </div>
                  <Badge className={getActionColor(action.action)}>
                    {action.action}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Approvals;