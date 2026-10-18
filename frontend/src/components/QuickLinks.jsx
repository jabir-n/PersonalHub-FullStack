import { useState } from "react"
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

import { toast } from "react-toastify"
import Swal from "sweetalert2"

const API_BASE = "https://personalhub-backend-ptlj.onrender.com/api"


const getLogo = (url) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return "https://cdn-icons-png.flaticon.com/512/25/25231.png"
  }
}


async function authFetch(path, options = {}) {
  const token = localStorage.getItem("access")

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  return response
}

function QuickLinks({
  selectedMenu,
  links,
  setLinks,
  searchTerm,
  categories,
  setCategories,
}) {
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [category, setCategory] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState(null)

  
  const [editForm, setEditForm] = useState({ name: "", url: "", category: "" })

  const addLink = async () => {
    if (!siteName || !siteUrl || !category) {
      toast.warning("Please fill all fields.")
      return
    }

    const alreadyExists = links.some(
      (link) => link.url.toLowerCase() === siteUrl.toLowerCase()
    )

    if (alreadyExists) {
      toast.warning("This link already exists.")
      return
    }

    try {
      const response = await authFetch("/links/", {
        method: "POST",
        body: JSON.stringify({
          name: siteName,
          url: siteUrl,
          category: category,
          favorite: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(
          data.url?.[0] ||
          data.name?.[0] ||
          data.category?.[0] ||
          data.detail ||
          "Failed to add link."
        )
        return
      }

      
      if (response.ok) {
        const selectedCategory = categories.find(
          (cat) => cat.id === Number(category)
        );

        const newLink = {
          ...data,
          category:
            data.category && typeof data.category === "object"
              ? data.category
              : selectedCategory,
        };

        setLinks((prev) => [...prev, newLink]);

        toast.success("Link added successfully!");

        setSiteName("");
        setSiteUrl("");
        setCategory("");
      }

      setSiteName("")
      setSiteUrl("")
      setCategory("")
    } catch (error) {
      console.error(error)
      toast.error("Unable to connect to the server.")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addLink()
  }

  const createCategory = async () => {
    const trimmed = newCategory.trim()

    if (!trimmed) {
      toast.warning("Please enter a category name.")
      return
    }

    const alreadyExists = categories.some(
      (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (alreadyExists) {
      toast.warning("Category already exists.")
      return
    }

    try {
      const response = await authFetch("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.name?.[0] || "Failed to create category.")
        return
      }

      setCategories((prev) => [...prev, data])
      toast.success("Category created successfully!")

      setShowCategoryModal(false)
      setNewCategory("")
    } catch (error) {
      console.error(error)
      toast.error("Unable to connect to the server.")
    }
  }

  const deleteLink = async (id) => {
    const result = await Swal.fire({
      title: "Delete Link?",
      text: "Are you sure you want to delete this link?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    })

    if (!result.isConfirmed) return

    try {
      const response = await authFetch(`/links/${id}/`, { method: "DELETE" })

      if (!response.ok) {
        toast.error("Failed to delete link.")
        return
      }

      setLinks((prev) => prev.filter((link) => link.id !== id))
      toast.success("Link deleted successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Unable to connect to the server.")
    }
  }

  const toggleFavorite = async (link) => {
    try {
      const response = await authFetch(`/links/${link.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          favorite: !link.favorite,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Failed to update favorite.");
        return;
      }

      setLinks((prev) =>
        prev.map((item) => {
          if (item.id !== data.id) return item;

          return {
            ...item,
            ...data,
            category:
              data.category && typeof data.category === "object"
                ? data.category
                : item.category,
          };
        })
      );

      toast.success(
        data.favorite ? "Added to favorites!" : "Removed from favorites!"
      );
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Unable to connect to the server.");
    }
  };

  const startEdit = (link) => {
    setEditingId(link.id)
    setEditForm({
      name: link.name,
      url: link.url,
      category: link.category.id,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await authFetch(`/links/${editingId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          url: editForm.url.trim(),
          category: Number(editForm.category),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.category?.[0] ||
          data.detail ||
          "Failed to save changes."
        );
        return;
      }

      
      setLinks((prev) =>
        prev.map((link) =>
          link.id === data.id
            ? {
              ...link,
              ...data,
              category:
                data.category &&
                  typeof data.category === "object"
                  ? data.category
                  : categories.find(
                    (cat) => cat.id === Number(editForm.category)
                  ) || link.category,
            }
            : link
        )
      );

      setEditingId(null);

      toast.success("Link updated successfully!");
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Unable to connect to the server.");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((link) => link.id === active.id)
    const newIndex = links.findIndex((link) => link.id === over.id)

    const reorderedLinks = arrayMove(links, oldIndex, newIndex)
    setLinks(reorderedLinks)

    try {
      const orderData = reorderedLinks.map((link, index) => ({
        id: link.id,
        order: index,
      }))

      await authFetch("/links/reorder/", {
        method: "POST",
        body: JSON.stringify({ links: orderData }),
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to save link order.")
    }
  }

  const filteredLinks = Array.isArray(links)
    ? links.filter((link) => {
      const matchesMenu =
        selectedMenu === "Favorites"
          ? link.favorite
          : selectedMenu === "Dashboard"
            ? true
            : link.category.name === selectedMenu

      const matchesSearch = link.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      return matchesMenu && matchesSearch
    })
    : []

  const CategoryOptions = () => (
    <>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </>
  )

  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 mt-5 sm:mt-8 min-w-0">
      <h2 className="text-white text-2xl sm:text-3xl font-bold mb-5 sm:mb-8">Quick Links</h2>

      {selectedMenu === "Dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

          <div className="flex gap-2 min-w-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-zinc-950/80 text-white px-4 py-3 rounded-2xl outline-none border border-zinc-800"
            >
              <option value="">Select Category</option>
              <CategoryOptions />
            </select>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 rounded-2xl bg-violet-600 hover:bg-violet-700 transition text-white font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={addLink}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold py-3 sm:py-0 hover:scale-105 transition-all"
          >
            Add Link
          </button>
        </div>
      )}

      {filteredLinks.length === 0 ? (
        <div className="bg-zinc-950/60 border border-dashed border-zinc-700 rounded-3xl p-8 sm:p-12 md:p-16 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Nothing Here</h3>
          <p className="text-zinc-400">No links available in this section.</p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredLinks.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
              {filteredLinks.map((link) => (
                <SortableLinkCard key={link.id} id={link.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-zinc-950/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex gap-3 sm:gap-5 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center">
                          <img
                            src={getLogo(link.url)}
                            alt="logo"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          {editingId === link.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, name: e.target.value }))
                                }
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              />

                              <input
                                type="text"
                                value={editForm.url}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, url: e.target.value }))
                                }
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              />

                              <select
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, category: e.target.value }))
                                }
                                className="bg-zinc-900 text-white px-3 py-2 rounded-xl w-full"
                              >
                                <CategoryOptions />
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
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">
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

                      <div className="flex flex-wrap items-center gap-4 sm:gap-5 justify-end">
                        <button
                          onClick={() => toggleFavorite(link)}
                          className={`text-3xl ${link.favorite ? "text-yellow-400" : "text-zinc-600"
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

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl w-[calc(100%-2rem)] max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Add Category</h2>

            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategory("")
                }}
                className="px-4 py-2 rounded-xl bg-zinc-700 text-white"
              >
                Cancel
              </button>

              <button
                onClick={createCategory}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickLinks