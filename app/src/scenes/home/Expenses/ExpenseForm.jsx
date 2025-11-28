import { useState } from "react"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function ExpenseForm({ project, onCreated }) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()
    if (!title || !amount) return toast.error("Please fill in all fields")

    const res = await api.post("/expense", {
      projectId: project._id,
      title,
      amount: Number(amount)
    })

    if (!res.ok) return toast.error(res.message)

    toast.success("Expense added")
    setTitle("")
    setAmount("")
    onCreated?.()
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h2 className="font-semibold text-gray-800">Add Expense for {project.name}</h2>

      <input className="input w-full" placeholder="Expense name" value={title} onChange={e => setTitle(e.target.value)} />

      <input className="input w-full" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} min={0} />

      <button type="submit" className="text-white btn-primary rounded-md bg-blue-600 w-full p-2">
        Add Expense
      </button>
    </form>
  )
}
