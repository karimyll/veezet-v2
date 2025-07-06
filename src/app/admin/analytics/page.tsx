'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCachedAPI } from '@/lib/api-cache';

interface ProfileAnalytics {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  views: number;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface AnalyticsResponse {
  profiles: ProfileAnalytics[];
  totalProfiles: number;
  totalViews: number;
}

export default function ProfileAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortBy, setSortBy] = useState<'views' | 'name' | 'date'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Check admin status
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const userIsAdmin = (session.user as any)?.role === 'ADMIN';
    setIsAdmin(userIsAdmin);
    
    if (!userIsAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch analytics data with caching
  const { data: analytics, loading, error, refetch } = useCachedAPI<AnalyticsResponse>(
    '/api/admin/analytics/profiles',
    [session],
    5 // Cache for 5 minutes
  );

  // Filter and sort profiles
  const filteredAndSortedProfiles = analytics?.profiles
    ?.filter(profile => 
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    }) || [];

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Analytics</h1>
              <p className="text-gray-600 mt-2">
                View performance metrics for all business card profiles
              </p>
            </div>
            <Link 
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalProfiles}
              </div>
              <div className="text-gray-600">Total Profiles</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">
                {formatViews(analytics.totalViews)}
              </div>
              <div className="text-gray-600">Total Views</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.totalProfiles > 0 ? Math.round(analytics.totalViews / analytics.totalProfiles) : 0}
              </div>
              <div className="text-gray-600">Avg Views per Profile</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full sm:w-auto flex-1">
              <input
                type="text"
                placeholder="Search profiles by name, slug, or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'views' | 'name' | 'date')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="views">Sort by Views</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Profiles List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading profile analytics...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500">Error: {error}</div>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredAndSortedProfiles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                {searchTerm ? 'No profiles found matching your search.' : 'No profiles found.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedProfiles.map((profile, index) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {sortBy === 'views' && sortOrder === 'desc' && (
                            <div className="text-lg font-bold text-gray-900">
                              #{index + 1}
                            </div>
                          )}
                          {sortBy === 'views' && sortOrder === 'desc' && index === 0 && (
                            <div className="ml-2 text-yellow-500">👑</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.title}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            card.veezet.com/{profile.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatViews(profile.views)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {profile.views.toLocaleString()} total
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.owner.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.owner.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(profile.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <a
                            href={`https://card.veezet.com/${profile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View
                          </a>
                          <Link
                            href={`/admin/users?search=${profile.owner.email}`}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Owner
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {analytics && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredAndSortedProfiles.length} of {analytics.totalProfiles} profiles
          </div>
        )}
      </div>
    </div>
  );
}
