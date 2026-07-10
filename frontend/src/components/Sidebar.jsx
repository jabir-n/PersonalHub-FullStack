import { useState } from "react"

import {
  FaGamepad,
  FaStar,
  FaRocket,
  FaHome,
  FaGraduationCap
} from "react-icons/fa"

function Sidebar({
  selectedMenu,
  setSelectedMenu,
  links
}) {

  const [showPlans, setShowPlans] = useState(false)


  const getCount = (category) => {

    if (category === "Favorites") {
      return links.filter(link => link.favorite).length
    }

    if (category === "Dashboard") {
      return links.length
    }

    return links.filter(
      link => link.category.name === category
    ).length
  }


  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaHome />
    },

    {
      name: "Gaming",
      icon: <FaGamepad />
    },

    {
      name: "Study",
      icon: <FaGraduationCap />
    },

    {
      name: "Productivity",
      icon: <FaRocket />
    },

    {
      name: "Favorites",
      icon: <FaStar />
    },
  ]


  return (
    <>

      <div className="w-64 min-h-screen backdrop-blur-xl bg-white/5 border-r border-white/10 p-6">

        <h1 className="text-5xl font-black text-white mb-14 tracking-wide">
          HUB
        </h1>


        <ul className="space-y-4">

          {menuItems.map((item, index) => (

            <li
              key={index}
              onClick={() => setSelectedMenu(item.name)}
              className={`flex items-center justify-between px-5 py-4 rounded-3xl cursor-pointer transition-all duration-300 border

              ${
                selectedMenu === item.name
                  ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                  : "border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >

              <div className="flex items-center gap-4">

                <span className="text-2xl">
                  {item.icon}
                </span>

                <span className="text-lg font-medium">
                  {item.name}
                </span>

              </div>


              <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                {getCount(item.name)}
              </span>

            </li>

          ))}

        </ul>


        <div className="mt-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl p-6 border border-white/10">

          <h3 className="text-white text-2xl font-bold mb-3">
            Upgrade Workspace
          </h3>

          <p className="text-zinc-300 text-sm mb-5 leading-6">
            Unlock more customization and premium widgets.
          </p>

          <button
            onClick={() => setShowPlans(true)}
            className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition-all"
          >
            Upgrade
          </button>

        </div>

      </div>


      {showPlans && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-[900px]">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-4xl font-bold text-white">
                Choose Your Plan
              </h2>

              <button
                onClick={() => setShowPlans(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ✕
              </button>

            </div>


            <div className="grid grid-cols-3 gap-6">

              <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6">

                <h3 className="text-white text-2xl font-bold mb-3">
                  Free
                </h3>

                <p className="text-zinc-400 mb-6">
                  Basic dashboard experience.
                </p>

                <h4 className="text-4xl font-bold text-white mb-6">
                  $0
                </h4>

                <button className="w-full bg-white text-black py-3 rounded-2xl font-semibold">
                  Current Plan
                </button>

              </div>


              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500 rounded-3xl p-6">

                <h3 className="text-white text-2xl font-bold mb-3">
                  Pro
                </h3>

                <p className="text-zinc-300 mb-6">
                  Advanced widgets and themes.
                </p>

                <h4 className="text-4xl font-bold text-white mb-6">
                  $9
                </h4>

                <button className="w-full bg-white text-black py-3 rounded-2xl font-semibold">
                  Upgrade Now
                </button>

              </div>


              <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6">

                <h3 className="text-white text-2xl font-bold mb-3">
                  Enterprise
                </h3>

                <p className="text-zinc-400 mb-6">
                  Team collaboration tools.
                </p>

                <h4 className="text-4xl font-bold text-white mb-6">
                  $29
                </h4>

                <button className="w-full bg-white text-black py-3 rounded-2xl font-semibold">
                  Contact Sales
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  )
}

export default Sidebar