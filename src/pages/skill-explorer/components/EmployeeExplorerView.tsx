import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatRole, getRatingColor } from "../utils/skillExplorerHelpers";
import { cn } from "@/lib/utils";

interface ApprovedRating {
  skill_id: string;
  skill_name: string;
  subskill_id: string | null;
  subskill_name: string | null;
  rating: "high" | "low" | "medium";
  approved_at: string;
  category_id: string;
  category_name: string;
}

interface EmployeeCategory {
  category_id: string;
  category_name: string;
  ratings: ApprovedRating[];
}

interface Employee {
  user_id: string;
  full_name: string;
  role: string;
  email: string;
  categories: EmployeeCategory[];
}

interface EmployeeExplorerViewProps {
  employees: Employee[];
  loading: boolean;
}

export function EmployeeExplorerView({ employees, loading }: EmployeeExplorerViewProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EmployeeCategory | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  // Show subskills for selected category
  if (selectedCategory && selectedEmployee) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{selectedEmployee.full_name}</h3>
            <p className="text-sm text-muted-foreground">{selectedCategory.category_name}</p>
          </div>
        </div>

        <div className="grid gap-3">
          {selectedCategory.ratings.map((rating, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {rating.subskill_name || rating.skill_name}
                  {rating.subskill_name && (
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      ({rating.skill_name})
                    </span>
                  )}
                </p>
                <Badge className={cn("shrink-0", getRatingColor(rating.rating))}>
                  {rating.rating}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show categories for selected employee
  if (selectedEmployee) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedEmployee(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{selectedEmployee.full_name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatRole(selectedEmployee.role)} • {selectedEmployee.email}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {selectedEmployee.categories.map((category) => (
            <Card
              key={category.category_id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{category.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.ratings.length} skill{category.ratings.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show employee list
  return (
    <div className="space-y-4">
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
          <p className="text-muted-foreground max-w-md">
            No employees or tech leads with approved ratings found.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {employees.map((employee) => (
            <Card
              key={employee.user_id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{employee.full_name}</p>
                    <p className="text-sm text-muted-foreground">{formatRole(employee.role)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="shrink-0">
                    {employee.categories.length} categor
                    {employee.categories.length === 1 ? "y" : "ies"}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
