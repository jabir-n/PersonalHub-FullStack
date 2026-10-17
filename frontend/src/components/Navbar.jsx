import { useState } from "react"
import { FaSearch, FaChevronDown } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import ProfileModal from "./ProfileModal"

function Navbar({
  searchTerm,
  setSearchTerm,
  profile,
  setProfile,
  setIsLoggedIn,
}) {

  console.log(profile)
  console.log(profile?.profile_image)

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const logout = () => {

    localStorage.removeItem("access")
    localStorage.removeItem("refresh")

    setIsLoggedIn(false)

  }

  return (

    <>
      <div className="app-navbar min-h-24 backdrop-blur-xl bg-zinc-950/90 md:bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 md:px-8 py-4 sticky top-0 z-40">

        <div>

          <h2 className="text-white text-2xl sm:text-3xl font-bold">
            Personal Hub
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            Organize your digital world
          </p>

        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6 min-w-0">

          <div className="relative flex-1 sm:flex-none min-w-0">

            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900/80 text-white px-4 py-3 pr-11 rounded-2xl outline-none w-full sm:w-56 md:w-80 border border-zinc-800"
            />

            <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500" />

          </div>

          <div className="relative">

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-full px-2 sm:px-3 py-2 hover:bg-white/10 transition max-w-full"
            >

              {profile?.profile_image ? (

                <img
                  src={profile.profile_image}
                  alt="profile"
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover"
                />

              ) : (

                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">

                  {profile?.display_name?.charAt(0).toUpperCase() || "U"}

                </div>

              )}

              <div className="text-left">

                <p className="text-white font-semibold max-w-28 sm:max-w-none truncate">
                  {profile?.display_name || "User"}
                </p>

                <p className="text-zinc-400 text-xs">
                  Online
                </p>

              </div>

              <FaChevronDown className="text-zinc-400" />

            </button>

            <AnimatePresence>

              {showMenu && (

                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute right-0 mt-4 w-64 rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl"
                >

                  <div className="p-5 border-b border-white/10">

                    <p className="text-white font-bold">
                      {profile?.display_name || "User"}
                    </p>

                    <p className="text-zinc-400 text-sm">
                      Personal Hub
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      setShowProfileModal(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-white/5 text-white"
                  >
                    👤 Edit Profile
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-5 py-4 hover:bg-red-500/20 text-red-400"
                  >
                    🚪 Logout
                  </button>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        setProfile={setProfile}
      />

    </>

  )

}

export default Navbar