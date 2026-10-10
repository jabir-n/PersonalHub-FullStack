import { useState, useEffect, useRef } from "react"
import Login from "./components/Login"
import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"

function App() {

  const [selectedMenu, setSelectedMenu] = useState("Dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [profile, setProfile] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState("checking")
  const verificationStarted = useRef(false)
  
  useEffect(() => {

    const token = localStorage.getItem("access")

    if (token) {
      setIsLoggedIn(true)
    }

  }, [])

  useEffect(() => {

    const path = window.location.pathname

    if (!path.startsWith("/verify-email/")) {
      return
    }

    if (verificationStarted.current) {
      return
    }

    verificationStarted.current = true

    const parts = path.split("/")





    const uid = parts[2]
    const token = parts[3]

    if (!uid || !token) {
      setVerificationStatus("invalid")
      return
    }

    async function verifyEmail() {

      try {

        const response = await fetch(
          `http://127.0.0.1:8000/api/verify-email/${uid}/${token}/`
        )

        const data = await response.json()

        if (response.ok) {
          if (data.status === "already_verified") {
            setVerificationStatus("already_verified")
          } else {
            setVerificationStatus("success")
          }
        } else {
          console.log(data)
          setVerificationStatus("invalid")
        }



      } catch (error) {

        console.log(error)
        setVerificationStatus("error")

      }

    }

    verifyEmail()

  }, [])

  useEffect(() => {

    if (!isLoggedIn) return

    async function fetchLinks() {

      try {

        const token = localStorage.getItem("access")

        const response = await fetch(
          "http://127.0.0.1:8000/api/links/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          console.log("Failed to load links")
          return
        }

        const data = await response.json()

        setLinks(data)

      } catch (error) {

        console.log(error)

      }

    }

    async function fetchCategories() {

      try {

        const token = localStorage.getItem("access");

        const response = await fetch(
          "http://127.0.0.1:8000/api/categories/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.log("Failed to load categories");
          return;
        }

        const data = await response.json();

        console.log("Categories:", data);

        setCategories(data);

      } catch (error) {

        console.log(error);

      }

    }

    async function fetchProfile() {

      try {

        const token = localStorage.getItem("access")

        const response = await fetch(
          "http://127.0.0.1:8000/api/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          console.log("Failed to load profile")
          return
        }

        const data = await response.json()

        setProfile(data)

      } catch (error) {

        console.log(error)

      }

    }

    fetchLinks()
    fetchCategories()
    fetchProfile()

  }, [isLoggedIn])

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
      )
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
                window.location.href = "/"
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
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
                window.location.href = "/"
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Verification Failed
          </h1>

          <p className="text-zinc-400 mb-6">
            This verification link is invalid or has expired.
          </p>

          <button
            onClick={() => {
              window.location.href = "/"
            }}
            className="px-6 py-3 rounded-xl bg-purple-600 font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {

    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
      />
    )

  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex">

      <Sidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        links={links}
        categories={categories}
        setCategories={setCategories}
      />

      <div className="flex-1">

        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          profile={profile}
          setProfile={setProfile}
          setIsLoggedIn={setIsLoggedIn}
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

  )

}

export default App