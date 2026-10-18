import { useState } from "react";
import {
  FaTrash,
  FaGamepad,
  FaStar,
  FaRocket,
  FaHome,
  FaGraduationCap,
  FaFolder,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

function Sidebar({
  selectedMenu,
  setSelectedMenu,
  links,
  categories,
  setCategories,
}) {
  const [showPlans, setShowPlans] = useState(false);

  const getCount = (category) => {
    if (category === "Favorites") {
      return links.filter((link) => link.favorite).length;
    }

    if (category === "Dashboard") {
      return links.length;
    }

    return links.filter(
      (link) => link.category?.name === category
    ).length;
  };

  const deleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "Links inside this category will remain, but this category will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        `https://personalhub-backend-ptlj.onrender.com/api/categories/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Failed to delete category.");
        return;
      }

      setCategories((previousCategories) =>
        previousCategories.filter(
          (category) => category.id !== id
        )
      );

      toast.success("Category deleted!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Unable to connect to the server.");
    }
  };

  
  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case "gaming":
        return <FaGamepad />;

      case "study":
        return <FaGraduationCap />;

      case "productivity":
        return <FaRocket />;

      default:
        return <FaFolder />;
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaHome />,
    },

    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      user: category.user,
      icon: getCategoryIcon(category.name),
    })),

    {
      name: "Favorites",
      icon: <FaStar />,
    },
  ];

  return (
    <>
      <div className="app-sidebar w-full md:w-64 md:min-h-screen min-h-0 shrink-0 backdrop-blur-xl bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 md:p-6">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-14 tracking-wide">
          HUB
        </h1>

        <ul className="app-sidebar-menu flex md:block gap-2 md:space-y-4 overflow-x-auto pb-2 md:pb-0">
          {menuItems.map((item, index) => (
            <li
              key={item.id ?? item.name ?? index}
              onClick={() => setSelectedMenu(item.name)}
              className={`app-sidebar-item flex items-center justify-between gap-3 min-w-max md:min-w-0 px-3 md:px-5 py-3 md:py-4 rounded-2xl md:rounded-3xl cursor-pointer transition-all duration-300 border ${
                selectedMenu === item.name
                  ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                  : "border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xl leading-none">
                  {item.icon}
                </span>

                <span className="text-lg font-medium">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {getCount(item.name)}
                </span>

                {item.user && (
                  <button
                    type="button"
                    aria-label={`Delete ${item.name} category`}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteCategory(item.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="app-upgrade-card mt-8 md:mt-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl p-5 md:p-6 border border-white/10">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Choose Your Plan
              </h2>

              <button
                onClick={() => setShowPlans(false)}
                className="text-zinc-400 hover:text-white text-2xl"
                aria-label="Close plans"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
  );
}

export default Sidebar;