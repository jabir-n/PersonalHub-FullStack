import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import SortableLinkCard from "./SortableLinkCard"
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import { Toaster } from "react-hot-toast"

function QuickLinks({
  selectedMenu,
  links,
  setLinks,
  searchTerm,
  categories
}) {

  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [category, setCategory] = useState("")
  const [editingId, setEditingId] = useState(null)

  const [editName, setEditName] = useState("")

  const [editUrl, setEditUrl] = useState("")

  const [editCategory, setEditCategory] = useState("")





  const addLink = async () => {

    if (!siteName || !siteUrl || !category) return

    try {

      const token = localStorage.getItem("access")

      const response = await fetch(
        "http://127.0.0.1:8000/api/links/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: siteName,
            url: siteUrl,
            category: category,
            favorite: false,
          }),
        }
      )

      if (!response.ok) {
        console.log("Failed to add link")
        return
      }

      const linksResponse = await fetch(
        "http://127.0.0.1:8000/api/links/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const updatedLinks = await linksResponse.json()

      setLinks(updatedLinks)

      setSiteName("")
      setSiteUrl("")
      setCategory("")

    } catch (error) {

      console.log(error)

    }

  }

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      addLink()
    }

  }


  const deleteLink = async (id) => {

    try {

      const token = localStorage.getItem("access")

      const response = await fetch(
        `http://127.0.0.1:8000/api/links/${id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        console.log("Failed to delete")
        return
      }

      setLinks(
        links.filter(link => link.id !== id)
      )

    } catch (error) {

      console.log(error)

    }

  }


  const toggleFavorite = async (link) => {

    try {

      const token = localStorage.getItem("access")

      const patchResponse = await fetch(
        `http://127.0.0.1:8000/api/links/${link.id}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            favorite: !link.favorite,
          }),
        }
      )

      if (!patchResponse.ok) {
        console.log("Failed to update favorite")
        return
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/links/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const updatedLinks = await response.json()

      setLinks(updatedLinks)

    } catch (error) {

      console.log(error)

    }

  }

  const startEdit = (link) => {

    setEditingId(link.id)

    setEditName(link.name)

    setEditUrl(link.url)

    setEditCategory(link.category.id)

  }

  const saveEdit = async () => {

    try {

      const token = localStorage.getItem("access")

      const patchResponse = await fetch(
        `http://127.0.0.1:8000/api/links/${editingId}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: editName,
            url: editUrl,
            category: editCategory,
          }),
        }
      )

      if (!patchResponse.ok) {
        console.log("Failed to save changes")
        return
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/links/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const updatedLinks = await response.json()

      setLinks(updatedLinks)

      setEditingId(null)

    } catch (error) {

      console.log(error)

    }

  }

  const handleDragEnd = async (event) => {

    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex(
      (link) => link.id === active.id
    )

    const newIndex = links.findIndex(
      (link) => link.id === over.id
    )

    const reorderedLinks = arrayMove(
      links,
      oldIndex,
      newIndex
    )

    setLinks(reorderedLinks)

    try {

      const token = localStorage.getItem("access")

      const orderData = reorderedLinks.map((link, index) => ({
        id: link.id,
        order: index,
      }))

      await fetch(
        "http://127.0.0.1:8000/api/links/reorder/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            links: orderData,
          }),
        }
      )

    } catch (error) {

      console.log(error)

    }

  }

  const filteredLinks = Array.isArray(links)
    ? links.filter((link) => {

      const matchesMenu = (() => {

        if (selectedMenu === "Favorites") {
          return link.favorite
        }

        if (selectedMenu === "Dashboard") {
          return true
        }

        return link.category.name === selectedMenu

      })()

      const matchesSearch =
        link.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      return matchesMenu && matchesSearch

    })
    : []




  const getLogo = (url) => {

    try {

      const domain = new URL(url).hostname

      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

    } catch {

      return "https://cdn-icons-png.flaticon.com/512/25/25231.png"

    }

  }


  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mt-8">

      <h2 className="text-white text-3xl font-bold mb-8">
        Quick Links
      </h2>


      {selectedMenu === "Dashboard" && (

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-8">

          <input
            type="text"
            placeholder="Website Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="bg-zinc-950/80 text-white px-4 py-3 rounded-2xl outline-none border border-zinc-800"
            onKeyDown={handleKeyDown}
          />


          <input
            type="text"
            placeholder="Website URL"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="bg-zinc-950/80 text-white px-4 py-3 rounded-2xl outline-none border border-zinc-800"
            onKeyDown={handleKeyDown}
          />


          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-zinc-950/80 text-white px-4 py-3 rounded-2xl outline-none border border-zinc-800"
          >

            <option value="">Select Category</option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>


          <button
            onClick={addLink}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:scale-105 transition-all"
          >
            Add Link
          </button>

        </div>

      )}


      {filteredLinks.length === 0 ? (

        <div className="bg-zinc-950/60 border border-dashed border-zinc-700 rounded-3xl p-16 text-center">

          <h3 className="text-2xl font-bold text-white mb-3">
            Nothing Here
          </h3>

          <p className="text-zinc-400">
            No links available in this section.
          </p>

        </div>

      ) : (

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={filteredLinks.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">

              {filteredLinks.map((link) => (

                <SortableLinkCard
                  key={link.id}
                  id={link.id}
                >

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-zinc-950/90 border border-white/10 rounded-3xl p-6"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex gap-5">

                        <div className="w-20 h-20 bg-white rounded-2xl p-3 flex items-center justify-center">

                          <img
                            src={getLogo(link.url)}
                            alt="logo"
                            className="w-full h-full object-contain"
                          />

                        </div>

                        <div>

                          {editingId === link.id ? (

                            <div className="space-y-3">

                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              />

                              <input
                                type="text"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              />

                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              >

                                {categories.map((category) => (

                                  <option
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </option>

                                ))}

                              </select>

                              <div className="flex gap-3">

                                <button
                                  onClick={saveEdit}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={() => setEditingId(null)}
                                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-xl"
                                >
                                  Cancel
                                </button>

                              </div>

                            </div>

                          ) : (

                            <>

                              <h3 className="text-white text-3xl font-bold mb-2">
                                {link.name}
                              </h3>

                              <p className="text-zinc-400 mb-4">
                                {link.category.name} Platform
                              </p>

                              <button
                                onClick={() => window.open(link.url)}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-2xl text-white font-semibold hover:scale-105 transition-all"
                              >
                                Open Link
                              </button>

                            </>

                          )}

                        </div>

                      </div>

                      <div className="flex gap-4">

                        <button
                          onClick={() => toggleFavorite(link)}
                          className={`text-3xl ${link.favorite
                              ? "text-yellow-400"
                              : "text-zinc-600"
                            }`}
                        >
                          ★
                        </button>

                        <button
                          onClick={() => startEdit(link)}
                          className="text-blue-400 hover:text-blue-500"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteLink(link.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </motion.div>

                </SortableLinkCard>

              ))}

            </div>

          </SortableContext>

        </DndContext>

      )}

    </div>

  )

}

export default QuickLinks