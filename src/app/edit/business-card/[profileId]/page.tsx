"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

interface ContactInfo {
  type: string
  value: string
}

interface SocialLink {
  name: string
  icon?: string
  url: string
}

interface AdditionalLink {
  title: string
  icon?: string
  url: string
}

interface ProfileData {
  id: string
  title: string
  profilePictureUrl: string
  notes: string
  contacts: ContactInfo[]
  socialLinks: SocialLink[]
  additionalLinks: AdditionalLink[]
}

export default function EditBusinessCardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const profileId = params.profileId as string

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [profilePictureUrl, setProfilePictureUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLink[]>([])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (profileId) {
      fetchProfileData()
    }
  }, [session, status, profileId])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/me/products')
      if (response.ok) {
        const products = await response.json()
        const product = products.find((p: any) => p.profile?.id === profileId)
        
        if (!product || !product.profile) {
          setError("Profile not found")
          return
        }

        const profile = product.profile
        setProfileData(profile)
        setTitle(profile.title || "")
        setProfilePictureUrl(profile.profilePictureUrl || "")
        setNotes(profile.notes || "")
        
        // Load existing data for contacts, social links, and additional links
        setContacts(profile.contacts || [])
        setSocialLinks(profile.socialLinks || [])
        setAdditionalLinks(profile.additionalLinks || [])
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/profiles/business-card/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          profilePictureUrl: profilePictureUrl.trim() || null,
          notes: notes.trim() || null,
          contacts,
          socialLinks,
          additionalLinks
        })
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const addContact = () => {
    setContacts([...contacts, { type: 'PHONE', value: '' }])
  }

  const updateContact = (index: number, field: keyof ContactInfo, value: string) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    setContacts(updated)
  }

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { name: '', url: '' }])
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    setSocialLinks(updated)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const addAdditionalLink = () => {
    setAdditionalLinks([...additionalLinks, { title: '', url: '' }])
  }

  const updateAdditionalLink = (index: number, field: keyof AdditionalLink, value: string) => {
    const updated = [...additionalLinks]
    updated[index] = { ...updated[index], [field]: value }
    setAdditionalLinks(updated)
  }

  const removeAdditionalLink = (index: number) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index))
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Business Card</h1>
                <p className="text-sm text-gray-600">Update your digital business card information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="secondary" size="sm" className="text-gray-700">Cancel</Button>
              </Link>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
          <div className="px-8 py-10">
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl flex items-center">
                <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-600">Your public profile details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Profile Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Senior Software Engineer at TechCorp"
                  />
                  <p className="text-xs text-gray-500">This appears as your main headline</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="text-xs text-gray-500">Direct link to your profile photo</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  About / Bio
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Passionate software engineer with 5+ years of experience in full-stack development. Love building scalable applications and mentoring junior developers..."
                />
                <p className="text-xs text-gray-500">Tell visitors about yourself and what you do</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                    <p className="text-sm text-gray-600">How people can reach you</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={addContact}
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Contact
                </Button>
              </div>
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="space-y-2 min-w-[120px]">
                      <label className="block text-xs font-medium text-gray-700">Type</label>
                      <select
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PHONE">📞 Phone</option>
                        <option value="EMAIL">✉️ Email</option>
                        <option value="ADDRESS">📍 Address</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Contact Value</label>
                      <input
                        type="text"
                        value={contact.value}
                        onChange={(e) => updateContact(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={
                          contact.type === 'PHONE' ? '+1 (555) 123-4567' :
                          contact.type === 'EMAIL' ? 'john.doe@company.com' :
                          'San Francisco, CA'
                        }
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p>No contact information added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Social Media</h3>
                    <p className="text-sm text-gray-600">Your social media profiles</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={addSocialLink}
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Social Link
                </Button>
              </div>
              <div className="space-y-4">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Platform Name</label>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="LinkedIn, Twitter, Instagram..."
                      />
                    </div>
                    <div className="flex-[2] space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Profile URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => removeSocialLink(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))}
                {socialLinks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p>No social media links added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Links */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Additional Links</h3>
                    <p className="text-sm text-gray-600">Portfolio, website, or other important links</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={addAdditionalLink}
                  className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Link
                </Button>
              </div>
              <div className="space-y-4">
                {additionalLinks.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Link Title</label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateAdditionalLink(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Portfolio, Resume, Company Website..."
                      />
                    </div>
                    <div className="flex-[2] space-y-2">
                      <label className="block text-xs font-medium text-gray-700">URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateAdditionalLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => removeAdditionalLink(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                ))}
                {additionalLinks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <p>No additional links added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <Link href="/dashboard">
                <Button variant="secondary" className="px-6 py-3 text-gray-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
