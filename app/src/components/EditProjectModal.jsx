import React, { useState, useEffect } from "react"

export default function EditProjectModal({ isOpen, project, onSave, onCancel }) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")

  useEffect(() => {
    if (project) {
      setName(project.name || "")
      setBudget(project.budget || "")
    }
  }, [project])

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
        <div className="flex flex-col gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" className="input w-full" />
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Budget" className="input w-full" />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={() => onSave(name, Number(budget))} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
