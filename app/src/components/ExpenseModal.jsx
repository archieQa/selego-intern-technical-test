import React, { useState, useEffect } from "react"

export default function ExpenseModal({ isOpen, mode, expense, onSave, onDelete, onCancel }) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    if (expense && mode === "edit") {
      setTitle(expense.title || "")
      setAmount(expense.amount || "")
      setCategory(expense.category || "")
    }
  }, [expense, mode])

  if (!isOpen || !expense) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-96">
        {mode === "edit" ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
            <div className="flex flex-col gap-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input w-full" />
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="input w-full" />
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="input w-full" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={() => onSave(title, Number(amount), category)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Delete Expense</h2>
            <p>Are you sure you want to delete this expense?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
