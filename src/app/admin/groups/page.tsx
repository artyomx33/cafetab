'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useAllGroups, useCreateGroup } from '@/lib/supabase/hooks'
import { ListRow, ListAvatar } from '@/components/ui/list-row'
import { FilterPills } from '@/components/ui/filter-pills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Search, Plus, Users, Copy, DollarSign, X } from 'lucide-react'

export default function GroupsPage() {
  const router = useRouter()
  const { groups, loading, refresh } = useAllGroups()
  const { create: createGroup } = useCreateGroup()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return

    setIsSubmitting(true)
    try {
      await createGroup(groupName)
      setGroupName('')
      setShowDialog(false)
      refresh()
    } catch (err) {
      console.error('Failed to create group:', err)
      alert('Failed to create group. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGroupClick = (groupId: string) => {
    router.push(`/seller/groups/${groupId}`)
  }

  // Filter groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.client_code.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && group.status === 'active'
    if (filter === 'closed') return matchesSearch && group.status === 'closed'
    return matchesSearch
  })

  const filterOptions = [
    { id: 'all', label: 'All', count: groups.length },
    { id: 'active', label: 'Active', count: groups.filter(g => g.status === 'active').length },
    { id: 'closed', label: 'Closed', count: groups.filter(g => g.status === 'closed').length },
  ]

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Groups</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage golf groups and tabs</p>
        </div>
        <Button className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search groups or codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A2E] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 focus:shadow-[0_0_15px_rgba(201,169,98,0.1)] transition-all"
        />
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={setFilter}
        />
      </motion.div>

      {/* Groups List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted-foreground)]">Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted-foreground)]">No groups found</p>
          </div>
        ) : (
          filteredGroups.map((group, index) => (
            <ListRow
              key={group.id}
              index={index}
              onClick={() => handleGroupClick(group.id)}
              avatar={
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--teal-500)] to-[var(--teal-600)] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              }
              title={group.name}
              code={group.client_code}
              badges={[
                group.status === 'active'
                  ? { label: 'Active', variant: 'success' as const }
                  : { label: 'Closed', variant: 'muted' as const },
                ...(group.total > 0 ? [{ label: `$${group.total.toFixed(0)} tab`, variant: 'gold' as const }] : []),
              ]}
              subtitle={`Created ${new Date(group.created_at).toLocaleDateString()}`}
              stat={{
                icon: <DollarSign className="w-4 h-4" />,
                value: group.total ? `$${group.total.toFixed(2)}` : '$0.00',
                color: 'gold',
              }}
              rightContent={
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyCode(group.client_code)
                  }}
                  className="p-2 rounded-lg hover:bg-[var(--charcoal-700)] transition-colors text-[var(--muted-foreground)] hover:text-white"
                  title="Copy code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              }
            />
          ))
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create New Group</h2>
            <button
              onClick={() => setShowDialog(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Group Name
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Morning Foursome"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              A unique 6-digit code will be generated automatically.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateGroup}
              disabled={isSubmitting || !groupName.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
