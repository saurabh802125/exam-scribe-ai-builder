
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available courses on component mount
  useState(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('code, name');
        
        if (error) {
          console.error("Error fetching courses:", error);
          return;
        }
        
        if (data) {
          setAvailableCourses(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching courses:", error);
      }
    };
    
    fetchCourses();
  });

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!department.trim()) {
      newErrors.department = "Department is required";
    }
    
    if (!semester.trim()) {
      newErrors.semester = "Semester is required";
    }
    
    if (courses.length === 0) {
      newErrors.courses = "Please select at least one course";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
  };
  
  const toggleCourse = (courseCode: string) => {
    setCourses(prev => 
      prev.includes(courseCode)
        ? prev.filter(c => c !== courseCode)
        : [...prev, courseCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        name,
        email,
        password,
        department,
        semester,
        courses
      });
      
      if (success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration.",
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
            <CardTitle className="text-2xl font-bold text-center">Exam-Scribe AI</CardTitle>
            <CardDescription className="text-center">
              Create your educator account
            </CardDescription>
            <div className="flex justify-center space-x-2 pt-2">
              <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${currentStep === 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button type="button" className="w-full" onClick={handleNextStep}>
                    Next
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science"
                    />
                    {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester</Label>
                    <Input 
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="Spring 2025"
                    />
                    {errors.semester && <p className="text-sm text-red-500">{errors.semester}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Courses You Teach</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availableCourses.map((course) => (
                        <div key={course.code} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`course-${course.code}`}
                            checked={courses.includes(course.code)}
                            onCheckedChange={() => toggleCourse(course.code)}
                          />
                          <Label 
                            htmlFor={`course-${course.code}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {course.name} ({course.code})
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.courses && <p className="text-sm text-red-500">{errors.courses}</p>}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
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
