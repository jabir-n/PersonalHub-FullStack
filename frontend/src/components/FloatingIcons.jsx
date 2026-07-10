import { motion } from "framer-motion"

import {
  FaGithub,
  FaGoogle,
  FaYoutube,
  FaDiscord,
  FaSpotify,
  FaInstagram,
  FaSteam,
  FaLinkedin,
  FaCode,
} from "react-icons/fa"

import {
  SiEpicgames,
  SiNotion,
  SiFigma,
  SiReddit,
  SiStackoverflow,
} from "react-icons/si"

const icons = [
  {
    icon: FaGithub,
    top: "8%",
    left: "12%",
    size: 50,
  },

  {
    icon: FaGoogle,
    top: "22%",
    right: "10%",
    size: 56,
  },

  {
    icon: FaYoutube,
    top: "12%",
    right: "22%",
    size: 54,
  },

  {
    icon: FaDiscord,
    bottom: "18%",
    right: "15%",
    size: 58,
  },

  {
    icon: FaSpotify,
    bottom: "8%",
    right: "32%",
    size: 52,
  },

  {
    icon: FaInstagram,
    bottom: "25%",
    left: "8%",
    size: 55,
  },

  {
    icon: FaSteam,
    top: "38%",
    left: "5%",
    size: 56,
  },

  {
    icon: SiEpicgames,
    bottom: "38%",
    left: "14%",
    size: 50,
  },

  {
    icon: FaCode,
    bottom: "10%",
    left: "28%",
    size: 52,
  },

  {
    icon: SiNotion,
    top: "10%",
    left: "30%",
    size: 50,
  },

  {
    icon: SiFigma,
    bottom: "12%",
    right: "8%",
    size: 52,
  },

  {
    icon: FaLinkedin,
    bottom: "6%",
    left: "45%",
    size: 50,
  },

  {
    icon: SiReddit,
    top: "48%",
    right: "6%",
    size: 50,
  },

  {
    icon: SiStackoverflow,
    top: "62%",
    left: "16%",
    size: 48,
  },
]

function FloatingIcons() {

  return (

    <>
      {icons.map((item, index) => {

        const Icon = item.icon

        return (

          <motion.div
            key={index}
            className="absolute text-white/20"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [-8, 8, -8],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={item.size} />
          </motion.div>

        )

      })}
    </>

  )

}

export default FloatingIcons