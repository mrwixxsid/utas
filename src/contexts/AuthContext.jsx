import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUsers } from "@/lib/storage"; 
import { verifyPassword } from "@/lib/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // --- START DEBUG BLOCK ---
    console.groupCollapsed("🔐 Login Attempt Debug");
    console.log(`Input Email: "${email}"`);
    console.log(`Input Password: [Hidden] (Length: ${password.length})`);
    // --- END DEBUG BLOCK ---
    
    try {
      // 1. Fetch Users
      const users = await getUsers(); // Fetch users from Firestore
      
      // 2. Sanitize and Prepare Search
      const sanitizedEmail = email.toLowerCase().trim(); 
      console.log(`Sanitized Email (Search Key): "${sanitizedEmail}"`);

      // 3. Log All Fetched Emails for Inspection
      const fetchedEmails = users.map(u => u.email).filter(e => e); // Filter out any undefined/null emails
      console.log("Emails found in Database (utas_users collection):", fetchedEmails);
      
      // 4. Search for User (Case-insensitive, trim-aware)
      const found = users.find(u => u.email && u.email.toLowerCase() === sanitizedEmail);

      if (!found) {
        console.error("DEBUG FAILURE: Search did not find a matching user object.");
        console.groupEnd();
        toast({ title: "Error", description: "User not found. Check console for details.", variant: "destructive" });
        return null;
      }

      // --- DEBUG: User Found ---
      console.log("DEBUG SUCCESS: User found!");
      console.log("Found User Data:", found);
      console.log("Stored Password Hash:", found.password_hash.substring(0, 10) + '...');
      // ---

      // 5. Verify Password
      const valid = await verifyPassword(password, found.password_hash);
      
      if (!valid) {
        console.error("DEBUG FAILURE: Password verification failed.");
        console.groupEnd();
        toast({ title: "Error", description: "Invalid password", variant: "destructive" });
        return null;
      }

      // 6. Success
      const cleanUser = {
        id: found.id,
        email: found.email,
        role: found.role,
        teacher_id: found.teacher_id || null,
        batch_id: found.batch_id || null,
      };

      setUser(cleanUser);
      localStorage.setItem("currentUser", JSON.stringify(cleanUser));

      toast({ title: "Success", description: `Logged in as ${found.role}` });
      console.log("Login successful. User role:", found.role);
      console.groupEnd();
      
      return found.role;
    } catch (error) {
      console.error("CRITICAL LOGIN ERROR:", error);
      console.groupEnd();
      toast({ title: "Error", description: "Login failed (check console for root cause)", variant: "destructive" });
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    toast({ title: "Success", description: "Logged out successfully" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};