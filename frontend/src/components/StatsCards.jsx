import {
  FaLink,
  FaStar,
  FaLayerGroup,
} from "react-icons/fa"

import { motion } from "framer-motion"

function StatsCards({ links }) {

  const totalLinks = links.length

  const favoriteLinks = links.filter(
    (link) => link.favorite
  ).length

  const categories = new Set(
    links.map((link) => link.category.name)
  ).size

  const stats = [
    {
      title: "Total Links",
      value: totalLinks,
      icon: <FaLink />,
      color: "from-purple-500/20 to-blue-500/20",
    },
    {
      title: "Favorites",
      value: favoriteLinks,
      icon: <FaStar />,
      color: "from-yellow-500/20 to-orange-500/20",
    },
    {
      title: "Categories",
      value: categories,
      icon: <FaLayerGroup />,
      color: "from-emerald-500/20 to-green-500/20",
    },
  ]

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">

      {stats.map((stat, index) => (

        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.1,
            duration: 0.4,
          }}
          whileHover={{
            y: -8,
            scale: 1.03,
          }}
          className={`bg-gradient-to-br ${stat.color}
          border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6
          backdrop-blur-xl
          transition-all duration-300
          hover:shadow-2xl hover:shadow-purple-500/20`}
        >

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-zinc-300 text-sm mb-2">
                {stat.title}
              </h3>

              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {stat.value}
              </p>

            </div>

            <motion.div
              whileHover={{
                rotate: 15,
                scale: 1.1,
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-white/10 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl text-white"
            >
              {stat.icon}
            </motion.div>

          </div>

        </motion.div>

      ))}

    </div>

  )

}

export default StatsCards