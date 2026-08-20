// Supabase REST API Service & Authentication Client for SafeBank AI Web

const SUPABASE_URL = "https://ebtivogzivmvhjrdruba.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xCs4KANdT3lRbiEQ9vvqMQ_A1z3-gCw";

const getHeaders = (token = null) => {
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  return headers;
};

export const SupabaseService = {
  // GoTrue Auth endpoints
  signUp: async (email, password) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error_description || "Sign up failed");
      return { success: true, data };
    } catch (err) {
      console.warn("Supabase Auth SignUp Fallback:", err.message);
      return { success: false, message: err.message };
    }
  },

  signIn: async (email, password) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || "Invalid email or password");
      return { 
        success: true, 
        token: data.access_token, 
        user: data.user 
      };
    } catch (err) {
      console.warn("Supabase Auth SignIn Error:", err.message);
      return { success: false, message: err.message };
    }
  },

  recoverPassword: async (email) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || "Password reset failed");
      }
      return { success: true };
    } catch (err) {
      console.warn("Supabase Recover Password Error:", err.message);
      return { success: false, message: err.message };
    }
  },

  // PostgREST Database Endpoints
  getReports: async (token = null) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*&order=timestamp.desc`, {
        headers: getHeaders(token)
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Supabase getReports Error:", err.message);
      return [];
    }
  },

  insertReport: async (reportData, token = null) => {
    try {
      const payload = {
        category: reportData.category || "UPI ID",
        reporter_name: reportData.reporterName || "Anonymous",
        target_value: reportData.targetValue || "",
        details: reportData.details || "",
        timestamp: reportData.timestamp || Date.now(),
        risk_score: reportData.riskScore || 90,
        status: reportData.status || "UNVERIFIED"
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: "POST",
        headers: {
          ...getHeaders(token),
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      
      return res.ok;
    } catch (err) {
      console.warn("Supabase insertReport Error:", err.message);
      return false;
    }
  },

  getUserContacts: async (email, token = null) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_contacts?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: getHeaders(token)
      });
      if (!res.ok) throw new Error("Failed to fetch user contacts");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          return JSON.parse(data[0].contacts);
        } catch (e) {
          return [];
        }
      }
      return [];
    } catch (err) {
      console.warn("Supabase getUserContacts Error:", err.message);
      return [];
    }
  },

  upsertUserContacts: async (email, contactsList, token = null) => {
    try {
      const payload = {
        email: email,
        contacts: JSON.stringify(contactsList)
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_contacts`, {
        method: "POST",
        headers: {
          ...getHeaders(token),
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.warn("Supabase upsertUserContacts Error:", err.message);
      return false;
    }
  },

  triggerEmergencyAlert: async (userEmail, location, contactsList, token = null) => {
    try {
      const payload = {
        timestamp: Date.now(),
        user_email: userEmail,
        location: location,
        status: "ACTIVE_SOS",
        contacts: JSON.stringify(contactsList)
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/emergency_alerts`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.warn("Supabase triggerEmergencyAlert Error:", err.message);
      return false;
    }
  },

  insertUserLogin: async (email, token = null) => {
    try {
      const payload = {
        email: email,
        login_time: Date.now()
      };
      await fetch(`${SUPABASE_URL}/rest/v1/user_logins`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Supabase insertUserLogin Error:", err.message);
    }
  },

  getUserLogins: async (token = null) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_logins?select=*&order=login_time.desc`, {
        headers: getHeaders(token)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  insertActivityLog: async (email, feature, details, token = null) => {
    try {
      const payload = {
        email: email,
        feature: feature,
        details: details,
        timestamp: Date.now()
      };
      await fetch(`${SUPABASE_URL}/rest/v1/user_activity_logs`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Supabase insertActivityLog Error:", err.message);
    }
  },

  getActivityLogs: async (token = null) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_activity_logs?select=*&order=timestamp.desc`, {
        headers: getHeaders(token)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }
};
