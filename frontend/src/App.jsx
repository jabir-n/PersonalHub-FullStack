import { useState, useEffect, useRef } from "react";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  
  const [verificationStatus, setVerificationStatus] =
    useState("checking");

  const verificationStarted = useRef(false);

  
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetPasswordData, setResetPasswordData] = useState({
    uid: "",
    token: "",
  });

  
  const clearAuthentication = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setLinks([]);
    setCategories([]);
    setProfile(null);

    setSelectedMenu("Dashboard");
    setSearchTerm("");

    setIsLoggedIn(false);
  };

  
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.access) {
        return null;
      }

      localStorage.setItem("access", data.access);

      
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh);
      }

      return data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  
  async function validateAccessToken(token) {
    return fetch(`${API_BASE}/links/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  
  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      setAuthChecking(true);

      const accessToken = localStorage.getItem("access");

      if (!accessToken) {
        if (!cancelled) {
          setIsLoggedIn(false);
          setAuthChecking(false);
        }

        return;
      }

      try {
        let response = await validateAccessToken(accessToken);

        if (cancelled) return;

        
        if (response.status === 401) {
          const newAccessToken = await refreshAccessToken();

          if (cancelled) return;

          if (newAccessToken) {
            response = await validateAccessToken(newAccessToken);
          }
        }

        if (cancelled) return;

        if (response.ok) {
          setIsLoggedIn(true);
        } else if (response.status === 401) {
          clearAuthentication();
        } else {
          
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        if (!cancelled) {
          
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    const path = window.location.pathname;

    if (!path.startsWith("/verify-email/")) {
      return;
    }

    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const parts = path.split("/").filter(Boolean);

    const uid = parts[1];
    const token = parts[2];

    if (!uid || !token) {
      setVerificationStatus("invalid");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_BASE}/verify-email/${uid}/${token}/`
        );

        const data = await response.json();

        if (response.ok) {
          if (data.status === "already_verified") {
            setVerificationStatus("already_verified");
          } else {
            setVerificationStatus("success");
          }
        } else {
          console.error("Email verification failed:", data);
          setVerificationStatus("invalid");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationStatus("error");
      }
    }

    verifyEmail();
  }, []);

  
  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/").filter(Boolean);

    if (
      parts[0] === "reset-password" &&
      parts[1] &&
      parts[2]
    ) {
      setResetPasswordData({
        uid: parts[1],
        token: parts[2],
      });

      setShowResetPassword(true);
    }
  }, []);

  
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;

    async function fetchAuthenticatedData() {
      try {
        let token = localStorage.getItem("access");

        if (!token) {
          clearAuthentication();
          return;
        }

        async function authenticatedFetch(path) {
          let response = await fetch(`${API_BASE}${path}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            const newToken = await refreshAccessToken();

            if (newToken) {
              token = newToken;

              response = await fetch(`${API_BASE}${path}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            }
          }

          return response;
        }

        const [linksResponse, categoriesResponse, profileResponse] =
          await Promise.all([
            authenticatedFetch("/links/"),
            authenticatedFetch("/categories/"),
            authenticatedFetch("/profile/"),
          ]);

        if (cancelled) return;

        
        if (
          linksResponse.status === 401 ||
          categoriesResponse.status === 401 ||
          profileResponse.status === 401
        ) {
          clearAuthentication();
          return;
        }

        if (linksResponse.ok) {
          const data = await linksResponse.json();

          if (!cancelled) {
            setLinks(data);
          }
        } else {
          console.error("Failed to load links:", linksResponse.status);
        }

        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();

          if (!cancelled) {
            setCategories(data);
          }
        } else {
          console.error(
            "Failed to load categories:",
            categoriesResponse.status
          );
        }

        if (profileResponse.ok) {
          const data = await profileResponse.json();

          if (!cancelled) {
            setProfile(data);
          }
        } else {
          console.error(
            "Failed to load profile:",
            profileResponse.status
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading dashboard data:", error);
        }
      }
    }

    fetchAuthenticatedData();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  
  if (window.location.pathname.startsWith("/verify-email/")) {
    if (verificationStatus === "checking") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              Verifying Email...
            </h1>

            <p className="text-zinc-400">
              Please wait while we verify your account.
            </p>
          </div>
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              Email Verified! 🎉
            </h1>

            <p className="text-zinc-400 mb-6">
              Your PersonalHub account has been verified successfully.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (verificationStatus === "already_verified") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              Already Verified! ✅
            </h1>

            <p className="text-zinc-400 mb-6">
              Your email has already been verified.
              You can log in to your PersonalHub account.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Verification Failed
          </h1>

          <p className="text-zinc-400 mb-6">
            {verificationStatus === "error"
              ? "Unable to connect to the server. Please try again."
              : "This verification link is invalid or has expired."}
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-6 py-3 rounded-xl bg-purple-600 font-bold text-white"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  
  if (showResetPassword) {
    return (
      <ResetPassword
        uid={resetPasswordData.uid}
        token={resetPasswordData.token}
        onBackToLogin={() => {
          window.history.replaceState({}, "", "/");

          setShowResetPassword(false);

          setResetPasswordData({
            uid: "",
            token: "",
          });

          setShowForgotPassword(false);
        }}
      />
    );
  }

  
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-3">
            PersonalHub
          </h1>

          <p className="text-zinc-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  
  if (!isLoggedIn) {
    if (showForgotPassword) {
      return (
        <ForgotPassword
          onBackToLogin={() => {
            setShowForgotPassword(false);
          }}
        />
      );
    }

    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        onForgotPassword={() => {
          setShowForgotPassword(true);
        }}
      />
    );
  }

  
  return (
    <div className="app-shell min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex flex-col md:flex-row">
      <Sidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        links={links}
        categories={categories}
        setCategories={setCategories}
      />

      <div className="app-main min-w-0 flex-1">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          profile={profile}
          setProfile={setProfile}
          setIsLoggedIn={(value) => {
            if (!value) {
              clearAuthentication();
            } else {
              setIsLoggedIn(true);
            }
          }}
        />

        <Dashboard
          selectedMenu={selectedMenu}
          searchTerm={searchTerm}
          links={links}
          setLinks={setLinks}
          categories={categories}
          setCategories={setCategories}
        />
      </div>
    </div>
  );
}

export default App;