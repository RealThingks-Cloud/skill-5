import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";

const Skills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  const skillCategories = [
    {
      name: "Frontend Development",
      skills: ["React", "TypeScript", "CSS", "HTML", "Vue.js"],
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Backend Development", 
      skills: ["Node.js", "Python", "Java", "PostgreSQL", "MongoDB"],
      color: "bg-green-100 text-green-800"
    },
    {
      name: "DevOps & Cloud",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Data Science",
      skills: ["Python", "R", "SQL", "Machine Learning", "Statistics"],
      color: "bg-orange-100 text-orange-800"
    }
  ];

  if (showMatrix) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skills Matrix</h1>
            <p className="text-muted-foreground">
              Visual representation of team skills and proficiency levels
            </p>
          </div>
          <Button onClick={() => setShowMatrix(false)} variant="outline">
            Back to Skills List
          </Button>
        </div>
        <div className="text-center p-8 text-muted-foreground">
          Skills Matrix component will be implemented here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Management</h1>
          <p className="text-muted-foreground">
            Manage and track skills across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowMatrix(true)} variant="outline">
            View Matrix
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
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

      <div className="grid gap-6 md:grid-cols-2">
        {skillCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category.name}
                <Badge className={category.color}>
                  {category.skills.length} skills
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage skills in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Skills;