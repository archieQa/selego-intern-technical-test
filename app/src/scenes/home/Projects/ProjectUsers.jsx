import { useState, useEffect } from "react"
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material"
import api from "@/services/api"

export default function ProjectUsers({ projectId, onUpdated }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [projectUsers, setProjectUsers] = useState([])
  const [budgetFeedback, setBudgetFeedback] = useState("")

  useEffect(() => {
    if (!projectId) return

    const fetchProject = async () => {
      try {
        const res = await api.get(`/project/${projectId}`)
        if (!res.ok) return
        setProjectUsers(res.data.users || [])
        setBudgetFeedback(res.data.budgetFeedback || "")
      } catch (err) {
        console.error("Failed to fetch project users:", err)
      }
    }

    fetchProject()
  }, [projectId])

  const sendInvite = async () => {
    if (!name || !email) return
    try {
      const res = await api.put(`/invite/${projectId}`, { name, email })
      if (!res.ok) return console.warn(res.error)

      // Correct: use full users list returned from backend
      setProjectUsers(res.data.users || [])

      onUpdated?.()
      setName("")
      setEmail("")
    } catch (err) {
      console.error("Invite failed:", err)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white space-y-3 shadow-sm">
      <h3 className="font-semibold text-gray-800">Manage Users</h3>

      <div className="flex gap-2 items-center">
        <TextField size="small" label="Name" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
        <TextField size="small" label="Email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
        <Button variant="contained" color="primary" onClick={sendInvite}>
          Send Invite
        </Button>
      </div>

      <List dense className="bg-gray-50 rounded p-1 max-h-48 overflow-auto">
        {projectUsers.map(u => (
          <ListItem key={u._id} className="hover:bg-gray-100 rounded">
            <ListItemText primary={u.name || u.email} secondary={u.email} />
          </ListItem>
        ))}
      </List>
    </div>
  )
}
