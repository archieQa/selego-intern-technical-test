import toast from "react-hot-toast"
import api from "@/services/api"
import { useState } from "react"
import ExpenseModal from "@/components/ExpenseModal" // import your modal

export default function ExpenseList({ expenses, onDeleted, onUpdated }) {
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [modalMode, setModalMode] = useState(null) // "edit" or "delete"

  if (!expenses.length) return <p className="text-sm text-gray-500">No expenses yet.</p>

  const openEditModal = expense => {
    setSelectedExpense(expense)
    setModalMode("edit")
  }

  const openDeleteModal = expense => {
    setSelectedExpense(expense)
    setModalMode("delete")
  }

  const closeModal = () => {
    setSelectedExpense(null)
    setModalMode(null)
  }

  const handleSave = async (title, amount, category) => {
    const res = await api.put(`/expense/${selectedExpense._id}`, { title, amount, category })
    if (!res.ok) return toast.error("Error updating expense")
    closeModal()
    onUpdated?.()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/expense/${selectedExpense._id}`)
      toast.success("Expense deleted")
      closeModal()
      onDeleted?.()
    } catch (e) {
      toast.error("Failed to delete expense")
      console.error(e)
    }
  }

  return (
    <div className="space-y-2">
      {expenses.map(expense => (
        <div key={expense._id} className="p-3 border rounded-lg bg-white shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">{expense.title}</h3>
            <p className="text-sm text-gray-600">${expense.amount}</p>
            {expense.category && <p className="text-sm text-gray-400">{expense.category}</p>}
          </div>
          <div className="flex gap-2">
            <button className="text-blue-500 hover:underline text-sm" onClick={() => openEditModal(expense)}>
              Edit
            </button>
            <button className="text-red-500 hover:underline text-sm" onClick={() => openDeleteModal(expense)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Expense Modal */}
      <ExpenseModal isOpen={!!selectedExpense} mode={modalMode} expense={selectedExpense} onSave={handleSave} onDelete={handleDelete} onCancel={closeModal} />
    </div>
  )
}
