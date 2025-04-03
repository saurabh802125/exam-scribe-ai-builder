
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data and available courses
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDepartment(currentUser.department);
      setSemester(currentUser.semester);
      setCourses(currentUser.courses || []);
    }
    
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
  }, [currentUser]);

  const toggleCourse = (courseCode: string) => {
    setCourses(prev => 
      prev.includes(courseCode)
        ? prev.filter(c => c !== courseCode)
        : [...prev, courseCode]
    );
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Update educator profile
      const { error: profileError } = await supabase
        .from('educators')
        .update({
          name,
          department,
          semester
        })
        .eq('id', currentUser.id);
      
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      // First delete all existing course associations
      const { error: deleteError } = await supabase
        .from('educator_courses')
        .delete()
        .eq('educator_id', currentUser.id);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      // Then insert new course associations
      if (courses.length > 0) {
        // Get course IDs from codes
        const { data: courseData, error: courseLookupError } = await supabase
          .from('courses')
          .select('id, code')
          .in('code', courses);
        
        if (courseLookupError) {
          throw new Error(courseLookupError.message);
        }
        
        // Create array of educator-course associations
        const courseAssociations = courseData.map(course => ({
          educator_id: currentUser.id,
          course_id: course.id
        }));
        
        // Insert all associations
        const { error: insertError } = await supabase
          .from('educator_courses')
          .insert(courseAssociations);
        
        if (insertError) {
          throw new Error(insertError.message);
        }
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
      
      // Reload the page to refresh the user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (currentUser) {
      setName(currentUser.name);
      setDepartment(currentUser.department);
      setSemester(currentUser.semester);
      setCourses(currentUser.courses || []);
    }
    setIsEditing(false);
  };

  if (!currentUser) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Educator Profile</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and manage your personal information and teaching assignments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  value={currentUser.email}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Current Semester</Label>
              <Input 
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Courses</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {availableCourses.map((course) => (
                <div key={course.code} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`course-${course.code}`}
                    checked={courses.includes(course.code)}
                    onCheckedChange={() => toggleCourse(course.code)}
                    disabled={!isEditing}
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
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
