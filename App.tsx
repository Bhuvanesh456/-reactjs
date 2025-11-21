import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { User } from './types';
import { fetchUsers } from './services/userService';
import { UserTable } from './components/UserTable';
import { UserModal } from './components/UserModal';
import { DeleteModal } from './components/DeleteModal';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load users. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    // Mock API call by creating a local ID
    const newUser: User = {
      ...userData,
      id: Date.now(), // Simple unique ID generation for local state
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsUserModalOpen(false);
  };

  const handleUpdateUser = (userData: Omit<User, 'id'>) => {
    if (!selectedUser) return;
    
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...userData, id: selectedUser.id } : u))
    );
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(undefined);
  };

  const openCreateModal = () => {
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2.5 rounded-lg shadow-lg shadow-primary-600/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
              <p className="text-sm text-gray-500">Manage your team members and their permissions</p>
            </div>
          </div>
          
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-600" />
              <p className="font-medium">Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-red-500">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-sm text-primary-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}
          
          {!loading && !error && filteredUsers.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 text-gray-400">
               <Users className="w-12 h-12 mb-3 opacity-10" />
               <p>No users found matching your search.</p>
             </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        initialData={selectedUser}
        title={selectedUser ? 'Edit User' : 'Create New User'}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.name || ''}
      />
    </div>
  );
}