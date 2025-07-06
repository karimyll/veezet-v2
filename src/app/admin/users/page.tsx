"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCachedAPI } from '@/lib/api-cache'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Use cached API hook instead of manual state management
  const { data: usersData, loading } = useCachedAPI<{ users: User[] }>(
    '/api/admin/users',
    [session, refreshKey], // Refetch when session changes or refresh key changes
    10 // Cache for 10 minutes
  )

  const users = usersData?.users || []

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    if ((session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        const data = await response.json()
        // Trigger refresh by incrementing the refresh key
        setRefreshKey(prev => prev + 1)
        console.log('Role updated successfully:', data)
      } else {
        const error = await response.json()
        console.error('Failed to update role:', error)
        alert('Rol dəyişdirilərkən xəta baş verdi: ' + error.error)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Rol dəyişdirilərkən xəta baş verdi')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 via-blue-100/10 to-purple-100/10"></div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  İstifadəçi İdarəsi
                </h1>
                <p className="text-xl text-gray-600">
                  İstifadəçiləri və rolları idarə edin
                </p>
              </div>
              <Link href="/admin">
                <button className="px-6 py-3 backdrop-blur-xl bg-white/30 border border-white/50 text-gray-800 font-medium rounded-2xl hover:bg-white/40 transition-all duration-300">
                  ← Admin Panel
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                  </div>
                  Bütün İstifadəçilər
                </h2>
                <div className="text-sm text-gray-600">
                  Ümumi: {users.length} istifadəçi
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-4 font-semibold text-gray-800">Ad</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800">Rol</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800">Qeydiyyat tarixi</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-800">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name || 'Ad məlum deyil'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'İstifadəçi'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-2 backdrop-blur-xl bg-white/30 border border-white/50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USER">İstifadəçi</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    {users.filter(u => u.role === 'USER').length}
                  </div>
                  <div className="text-gray-600">İstifadəçilər</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ background: 'linear-gradient(to right, #f59e0b, #dc2626)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    {users.filter(u => u.role === 'ADMIN').length}
                  </div>
                  <div className="text-gray-600">Adminlər</div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ background: 'linear-gradient(to right, #10b981, #059669)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    {users.length}
                  </div>
                  <div className="text-gray-600">Ümumi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
