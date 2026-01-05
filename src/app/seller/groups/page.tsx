"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GroupCard } from "@/components/ui/group-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useSellerStore } from "@/stores/seller-store";
import { useActiveGroups, useCreateGroup } from "@/lib/supabase/hooks";
import { Plus } from "lucide-react";

export default function SellerGroupsPage() {
  const router = useRouter();
  const { seller, isLoggedIn } = useSellerStore();
  const { groups, loading: isLoading, refresh } = useActiveGroups();
  const { create, loading: isCreating } = useCreateGroup();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/seller");
    }
  }, [isLoggedIn, isLoading, router]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Group name is required");
      return;
    }

    setError("");

    try {
      await create(newGroupName, seller?.id);

      // Refresh groups list
      refresh();

      // Close dialog and reset form
      setIsDialogOpen(false);
      setNewGroupName("");
    } catch (err) {
      setError("Failed to create group. Please try again.");
    }
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/seller/groups/${groupId}`);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Active Groups
          </h2>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="large"
            className="w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Group
          </Button>
        </motion.div>
      </motion.div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[var(--muted-foreground)]">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          className="flex items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[var(--muted-foreground)]">
            No active groups. Create one to get started!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GroupCard
                groupName={group.name}
                groupCode={group.id.slice(0, 6).toUpperCase()}
                status={group.status}
                itemCount={group.itemCount}
                total={group.tab?.total || 0}
                onClick={() => handleGroupClick(group.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          title="Create New Group"
          description="Enter a name for your new group"
        >
          <DialogClose onClick={() => setIsDialogOpen(false)} />

          <div className="space-y-4">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateGroup();
                }
              }}
            />

            {error && (
              <motion.div
                className="badge-error rounded-lg px-4 py-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewGroupName("");
                  setError("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={isCreating || !newGroupName.trim()}
                className="flex-1"
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
