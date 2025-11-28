import React, { useState, useEffect, useRef } from "react"
import api from "@/services/api"
import ProjectList from "./Projects/ProjectList"
import ProjectForm from "./Projects/ProjectForm"
import ExpenseList from "./Expenses/ExpenseList"
import ExpenseForm from "./Expenses/ExpenseForm"
import ProjectUsers from "./Projects/ProjectUsers"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"

export default function Home() {
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [aiFeedback, setAiFeedback] = useState("")

  const overBudgetNotified = useRef({}) // Track which projects showed alert

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" })
  const showSnackbar = (message, severity = "info") => setSnackbar({ open: true, message, severity })
  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }))

  // Load all projects
  const loadProjects = async () => {
    const res = await api.get("/project")
    if (!res.ok) return console.error("Failed to load projects")
    setProjects(res.data)
  }

  // Load expenses for a project
  const loadExpenses = async projectId => {
    if (!projectId) return
    const res = await api.get(`/expense?projectId=${projectId}`)
    if (!res.ok) return console.error("Failed to load expenses")
    setExpenses(res.data)
  }

  // Compute AI feedback based on current expenses
  useEffect(() => {
    if (!selected || !expenses.length) return setAiFeedback("")

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const percentage = ((totalSpent / selected.budget) * 100).toFixed(2) // detailed
    const topExpense = expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])

    setAiFeedback(`It seems you are using ${percentage}% of your budget, mostly on '${topExpense?.title || "N/A"}'.`)
  }, [expenses, selected])

  // Initial load
  useEffect(() => loadProjects(), [])

  // Load expenses when a project is selected
  useEffect(() => {
    if (!selected) return
    loadExpenses(selected._id)
  }, [selected])

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budget Tracker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Projects */}
        <div className="col-span-1 space-y-6">
          <ProjectForm onCreated={loadProjects} />
          <ProjectList
            projects={projects}
            selected={selected}
            onSelect={setSelected}
            showSnackbar={showSnackbar}
            onDeleted={async deletedProjectId => {
              await loadProjects()
              if (selected?._id === deletedProjectId) setSelected(null)
              showSnackbar("Project deleted", "success")
            }}
            onUpdated={loadProjects}
          />
        </div>

        {/* Right panel: Selected project details */}
        {selected && (
          <div className="col-span-2 space-y-6">
            {aiFeedback && <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded transition-all duration-300">{aiFeedback}</div>}

            <ProjectUsers projectId={selected._id} onUpdated={loadProjects} />

            <ExpenseForm
              project={selected}
              onCreated={async () => {
                await loadExpenses(selected._id)
                const projRes = await api.get("/project")
                if (!projRes.ok) return
                setProjects(projRes.data)

                const proj = projRes.data.find(p => p._id === selected._id)
                if (proj?.totalSpent > proj.budget && !overBudgetNotified.current[proj._id]) {
                  showSnackbar(`Project "${proj.name}" is over budget!`, "error")
                  overBudgetNotified.current[proj._id] = true
                }
              }}
            />

            <ExpenseList
              expenses={expenses}
              onDeleted={async () => {
                await loadExpenses(selected._id)
                await loadProjects()
                showSnackbar("Expense deleted", "success")
              }}
              onUpdated={async () => {
                await loadExpenses(selected._id)
                await loadProjects()
                showSnackbar("Expense updated", "success")
              }}
            />
          </div>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
