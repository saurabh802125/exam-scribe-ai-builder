
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Educator } from "@/types/auth";

export async function fetchUserProfile(user: User): Promise<Educator | null> {
  try {
    // Get user profile data
    const { data: educator, error } = await supabase
      .from('educators')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching educator profile:", error);
      return null;
    }

    // Get educator courses
    const { data: courseData, error: courseError } = await supabase
      .from('educator_courses')
      .select('courses(code)')
      .eq('educator_id', user.id);

    if (courseError) {
      console.error("Error fetching educator courses:", courseError);
      return null;
    }

    // Extract course codes
    const courses = courseData.map(item => item.courses.code);

    // Return educator data with courses
    return {
      id: educator.id,
      name: educator.name,
      email: educator.email,
      department: educator.department,
      semester: educator.semester,
      courses: courses
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
}
