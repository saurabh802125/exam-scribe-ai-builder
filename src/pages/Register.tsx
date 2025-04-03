
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const availableCourses = [
  { id: "ML", name: "Machine Learning" },
  { id: "ACN", name: "Advanced Computer Networks" },
  { id: "DCN", name: "Data Communication Networks" },
  { id: "DL", name: "Deep Learning" },
  { id: "DS", name: "Data Structures" },
  { id: "DBMS", name: "Database Management Systems" },
  { id: "AI", name: "Artificial Intelligence" },
  { id: "OS", name: "Operating Systems" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    semester: "",
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear password error when typing in password fields
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    
    if (selectedCourses.length === 0) {
      toast({
        title: "Course selection required",
        description: "Please select at least one course",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        semester: formData.semester,
        courses: selectedCourses,
      });
      
      if (success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please login.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration failed",
          description: "This email may already be registered. Please try another.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Educator Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for Exam-Scribe AI
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {passwordError && (
                <p className="text-sm font-medium text-destructive">{passwordError}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("department", value)}
                    value={formData.department}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS">Computer Science</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="EC">Electronics & Communication</SelectItem>
                      <SelectItem value="ME">Mechanical Engineering</SelectItem>
                      <SelectItem value="CE">Civil Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("semester", value)}
                    value={formData.semester}
                  >
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Courses</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                  {availableCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <label 
                        htmlFor={`course-${course.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {course.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
