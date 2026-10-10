import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify";


function ProfileModal({
  isOpen,
  onClose,
  profile,
  setProfile,
}) {

  const [displayName, setDisplayName] = useState(
    profile?.display_name || ""
  )

  const [image, setImage] = useState(null)

  const saveProfile = async () => {

    try {

      const token = localStorage.getItem("access")

      const formData = new FormData()

      formData.append(
        "display_name",
        displayName
      )

      if (image) {

        formData.append(
          "profile_image",
          image
        )

      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/profile/",
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      )

      if (!response.ok) {

        toast.error("Failed to update profile.");

        return;

      }

      const data = await response.json()

      setProfile(data)

      toast.success("Profile updated successfully!");

      onClose()

    } catch (error) {

      console.error(error);

      toast.error("Unable to connect to the server.");

    }

  }

  return (

    <AnimatePresence>

      {isOpen && (

        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
            }}
            className="bg-zinc-900 rounded-3xl border border-white/10 p-8 w-[450px]"
          >

            <h2 className="text-3xl text-white font-bold mb-6">

              Edit Profile

            </h2>

            <input
              type="text"
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value)
              }
              placeholder="Display Name"
              className="w-full bg-zinc-800 rounded-2xl p-4 text-white mb-5"
            />

            <input
              type="file"
              onChange={(e) =>
                setImage(e.target.files[0])
              }
              className="text-white mb-8"
            />

            <div className="flex gap-4">

              <button
                onClick={saveProfile}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3"
              >
                Save
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-2xl py-3"
              >
                Cancel
              </button>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  )

}

export default ProfileModal