export default function ProjectCard({ project, active, onSelect }) {
  if (!project) return null

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-lg shadow-md font-medium text-white transition-all duration-200
        ${active ? "bg-blue-600 hover:bg-blue-700 shadow-lg" : "bg-gray-600 hover:bg-gray-700"}
      `}
    >
      <h2 className="text-lg">{project.name}</h2>
      <p className="text-sm mt-1">
        Budget: <span className="font-semibold">${project.budget.toLocaleString()}</span>
      </p>
    </button>
  )
}
