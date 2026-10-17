import StatsCards from "./StatsCards"
import QuickLinks from "./QuickLinks"
import { motion } from "framer-motion"

import {
  FaGamepad,
  FaGraduationCap,
  FaRocket,
  FaStar,
  FaHome
} from "react-icons/fa"

function Dashboard({
  selectedMenu,
  searchTerm,
  links,
  setLinks,
  categories,
  setCategories,
}) {

  const getHeading = () => {

    if (selectedMenu === "Dashboard") {
      return "Workspace Overview"
    }

    if (selectedMenu === "Favorites") {
      return "Favorite Links"
    }

    return `${selectedMenu} Workspace`
  }


  const getIcon = () => {

    if (selectedMenu === "Gaming") {
      return <FaGamepad />
    }

    if (selectedMenu === "Study") {
      return <FaGraduationCap />
    }

    if (selectedMenu === "Productivity") {
      return <FaRocket />
    }

    if (selectedMenu === "Favorites") {
      return <FaStar />
    }

    return <FaHome />
  }


  const getGlow = () => {

    if (selectedMenu === "Gaming") {
      return "from-purple-500/30 to-blue-500/20"
    }

    if (selectedMenu === "Study") {
      return "from-cyan-500/30 to-blue-500/20"
    }

    if (selectedMenu === "Productivity") {
      return "from-emerald-500/30 to-green-500/20"
    }

    if (selectedMenu === "Favorites") {
      return "from-yellow-500/30 to-orange-500/20"
    }

    return "from-purple-500/20 to-zinc-500/20"
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-8 min-w-0"
    >

      <StatsCards links={links} />


      <div className={`relative overflow-hidden mb-8 rounded-3xl md:rounded-[40px]
      bg-gradient-to-br ${getGlow()}
      border border-white/10 p-5 sm:p-7 md:p-10`}>

        <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl -top-20 -right-20 animate-pulse">
        </div>

        <div className="absolute w-52 h-52 bg-purple-500/10 rounded-full blur-3xl bottom-0 left-20 animate-pulse">
        </div>


        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">

          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl sm:text-4xl md:text-5xl text-white shadow-2xl">

            {getIcon()}

          </div>


          <div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 break-words">
              {getHeading()}
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl leading-6 sm:leading-8">
              Manage your shortcuts, organize platforms,
              and personalize your digital workspace experience.
            </p>

          </div>

        </div>

      </div>


      <QuickLinks
        selectedMenu={selectedMenu}
        links={links}
        setLinks={setLinks}
        searchTerm={searchTerm}
        categories={categories}
        setCategories={setCategories}
      />

    </motion.div >
  )
}

export default Dashboard