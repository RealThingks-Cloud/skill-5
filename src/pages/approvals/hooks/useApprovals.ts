import { useState } from "react";

export interface ApprovalRequest {
  id: string;
  type: string;
  requester: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  submitDate: string;
  dueDate: string;
}

export interface RecentAction {
  id: string;
  action: 'Approved' | 'Rejected';
  title: string;
  approver: string;
  date: string;
}

export const useApprovals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const pendingApprovals: ApprovalRequest[] = [
    {
      id: "1",
      type: "Skill Assessment",
      requester: "John Doe",
      title: "React Development Skills",
      description: "Requesting approval for advanced React development skills rating",
      priority: "High",
      submitDate: "2024-01-15",
      dueDate: "2024-01-20"
    },
    // Add more mock data as needed
  ];

  const recentActions: RecentAction[] = [
    {
      id: "1",
      action: "Approved",
      title: "Python Programming Skills",
      approver: "Jane Smith",
      date: "2024-01-14"
    },
    // Add more mock data as needed
  ];

  return {
    searchTerm,
    setSearchTerm,
    pendingApprovals,
    recentActions,
    loading
  };
};