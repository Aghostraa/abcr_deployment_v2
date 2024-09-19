import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUserRole } from '@/hooks/useUserRole'

interface Team {
  id: number
  name: string
  description: string
}

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userRole } = useUserRole()
  const supabase = createClientComponentClient()

  const fetchTeams = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('projects').select('*')
      if (error) throw error
      setTeams(data)
    } catch (err) {
      setError('Failed to fetch teams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeamName.trim() && userRole === 'Admin') {
      try {
        const { error } = await supabase
          .from('projects')
          .insert({ name: newTeamName, description: newTeamDescription })
        if (error) throw error
        setNewTeamName('')
        setNewTeamDescription('')
        fetchTeams()
      } catch (err) {
        setError('Failed to create team')
        console.error(err)
      }
    }
  }

  if (loading) return <div>Loading teams...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Teams</h2>
      {userRole === 'Admin' && (
        <form onSubmit={handleCreateTeam} className="mb-6">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name"
            className="mr-2 p-2 rounded"
          />
          <input
            type="text"
            value={newTeamDescription}
            onChange={(e) => setNewTeamDescription(e.target.value)}
            placeholder="Team description"
            className="mr-2 p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Create Team
          </button>
        </form>
      )}
      {teams.length === 0 ? (
        <p>No teams available.</p>
      ) : (
        <ul className="space-y-4">
          {teams.map(team => (
            <li key={team.id} className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <p>{team.description}</p>
              {/* Add join/leave team functionality here if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TeamList