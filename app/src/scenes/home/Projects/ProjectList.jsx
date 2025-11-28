import api from "@/services/api"
import { useState } from "react"
import ConfirmModal from "@/components/ConfirmModal"
import EditProjectModal from "@/components/EditProjectModal"

export default function ProjectList({ projects, selected, onSelect, onDeleted, onUpdated, showSnackbar }) {
  const [editingProject, setEditingProject] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const handleSave = async (name, budget) => {
    if (!editingProject) return
    const res = await api.put(`/project/${editingProject._id}`, { name, budget })
    if (!res.ok) return showSnackbar(res.message || "Error updating project", "error")

    setEditingProject(null)
    onUpdated?.()
    showSnackbar("Project updated", "success")
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/project/${deleteId}`)
      showSnackbar("Project deleted", "success")
      // Tell parent which project was deleted
      onDeleted?.(deleteId)
    } catch (err) {
      console.error(err)
      showSnackbar("Failed to delete project", "error")
    } finally {
      setDeleteId(null)
    }
  }

  if (!projects || projects.length === 0) {
    return <p className="text-sm text-gray-500">No projects yet.</p>
  }

  return (
    <>
      <div className="space-y-3">
        {projects.map(p => {
          const progress = Math.min((p.totalSpent / p.budget) * 100, 100)

          return (
            <div
              key={p._id}
              className={`p-4 border rounded-lg flex flex-col gap-2 cursor-pointer transition-all duration-150
                ${selected?._id === p._id ? "border-blue-500" : "border-gray-200"}
                ${p.overBudget ? "bg-red-50 border-red-400" : "bg-white hover:bg-gray-50"}`}
            >
              <div className="flex justify-between items-center w-full" onClick={() => onSelect(p)}>
                <span className="font-medium text-gray-700">
                  {p.name} - ${p.budget.toLocaleString()} (Spent: ${p.totalSpent.toLocaleString()})
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={e => {
                      e.stopPropagation()
                      setEditingProject(p)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={e => {
                      e.stopPropagation()
                      setDeleteId(p._id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                <div className={`h-2 rounded ${p.overBudget ? "bg-red-500" : "bg-green-500"} transition-all duration-300`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        message="Are you sure you want to delete this project and all its expenses?"
      />

      {/* Edit Modal */}
      <EditProjectModal isOpen={!!editingProject} project={editingProject} onSave={handleSave} onCancel={() => setEditingProject(null)} />
    </>
  )
}
