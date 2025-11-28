import { useState } from "react"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function ProjectForm({ onCreated }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()

    if (!name || !budget) return toast.error("Name and budget are required")

    const res = await api.post("/project", { name, description, budget: Number(budget) })
    if (!res.ok) return toast.error(res.message || "Failed to create project")

    toast.success("Project created successfully")
    setName("")
    setDescription("")
    setBudget("")
    onCreated?.()
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 border rounded-lg bg-white shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Create Project</h2>

      <input
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        placeholder="Project name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        type="number"
        min="0"
        placeholder="Budget"
        value={budget}
        onChange={e => setBudget(e.target.value)}
      />

      <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors duration-200">
        Create Project
      </button>
    </form>
  )
}
