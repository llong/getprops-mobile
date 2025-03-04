import { supabase } from "@/utils/supabase";

// This is just a test function to show the raw column names from the database
export const checkDatabaseColumns = async () => {
  const { data, error } = await supabase.from("spots").select("*").limit(1);

  console.log("Raw database result:", data);
  console.log(
    "First row keys:",
    data && data.length > 0 ? Object.keys(data[0]) : "No data"
  );

  if (error) {
    console.error("Error:", error);
  }

  return data;
};
