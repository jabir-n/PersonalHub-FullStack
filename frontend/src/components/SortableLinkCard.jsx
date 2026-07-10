import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FaGripVertical } from "react-icons/fa"

function SortableLinkCard({ id, children }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (

    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >

      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white z-50"
      >
        <FaGripVertical />
      </div>

      {children}

    </div>

  )

}

export default SortableLinkCard