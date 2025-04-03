
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Book, CalendarCheck, FileQuestion, LogOut } from "lucide-react";

const Dashboard = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!currentUser) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {currentUser.name}</h1>
          <p className="text-gray-600">Department of {currentUser.department} | {currentUser.semester}</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button variant="outline" asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              CIE Exam Setup
            </CardTitle>
            <CardDescription>
              Create Continuous Internal Evaluation exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Set up CIE exams for your courses with customizable question patterns and marks distribution.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/cie-exam-setup">
                Create CIE Exam
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Semester Exam Setup
            </CardTitle>
            <CardDescription>
              Create end-of-semester examinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Configure semester-end exams with module-wise question distribution and comprehensive coverage.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/semester-exam-setup">
                Create Semester Exam
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5" />
              Generate Questions
            </CardTitle>
            <CardDescription>
              Generate AI-powered questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Use AI to generate diverse questions based on course content, topics, and difficulty levels.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/generate-questions">
                Generate Questions
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        {currentUser.courses && currentUser.courses.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentUser.courses.map((course) => (
              <Card key={course}>
                <CardContent className="p-4">
                  <p className="font-medium">{course}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No courses assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
