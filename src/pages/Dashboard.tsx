
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  code: string;
}

const Dashboard = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [examType, setExamType] = useState("");
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserCourses = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        // Get the user's course IDs
        const { data: coursesData, error: coursesError } = await supabase
          .from('educator_courses')
          .select('course_id')
          .eq('educator_id', currentUser.id);

        if (coursesError) {
          console.error("Error fetching course IDs:", coursesError);
          return;
        }

        if (!coursesData || coursesData.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get course details
        const courseIds = coursesData.map(item => item.course_id);
        const { data: fullCoursesData, error: fullCoursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (fullCoursesError) {
          console.error("Error fetching course details:", fullCoursesError);
          return;
        }

        setUserCourses(fullCoursesData || []);
      } catch (error) {
        console.error("Error in fetchUserCourses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCourses();
  }, [isAuthenticated, currentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examType || !semester || !course) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to the appropriate setup page based on exam type
    if (examType === "CIE") {
      navigate("/cie-exam-setup", { 
        state: { examType, semester, course } 
      });
    } else if (examType === "SemesterEnd") {
      navigate("/semester-exam-setup", {
        state: { examType, semester, course }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Exam-Scribe AI</h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Hi, <span className="font-medium">{currentUser.name}</span>
            </p>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create Question Paper</CardTitle>
                <CardDescription>
                  Configure your exam settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="examType" className="text-sm font-medium">
                      Exam Type
                    </label>
                    <Select
                      value={examType}
                      onValueChange={setExamType}
                    >
                      <SelectTrigger id="examType">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIE">Continuous Internal Evaluation (CIE)</SelectItem>
                        <SelectItem value="SemesterEnd">Semester End Examination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="semester" className="text-sm font-medium">
                      Semester
                    </label>
                    <Select
                      value={semester}
                      onValueChange={setSemester}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="course" className="text-sm font-medium">
                      Course
                    </label>
                    <Select
                      value={course}
                      onValueChange={setCourse}
                    >
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {userCourses.map((course) => (
                          <SelectItem key={course.id} value={course.code}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full mt-4">
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
