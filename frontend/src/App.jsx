import { useState, useEffect } from "react"
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

  useEffect(() => {

    const token = localStorage.getItem("access")

    if (token) {
      setIsLoggedIn(true)
    }

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

        const response = await fetch(
          "http://127.0.0.1:8000/api/categories/"
        )

        if (!response.ok) {
          console.log("Failed to load categories")
          return
        }

        const data = await response.json()

        setCategories(data)

      } catch (error) {

        console.log(error)

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
        />

      </div>

    </div>

  )

}

export default App