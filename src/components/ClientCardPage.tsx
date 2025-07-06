'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ContactInfo {
  id: string
  type: string
  value: string
}

interface SocialLink {
  id: string
  name: string
  icon: string | null
  url: string
}

interface AdditionalLink {
  id: string
  title: string
  icon: string | null
  url: string
}

interface PublicCardData {
  slug: string
  title: string | null
  profilePictureUrl: string | null
  notes: string | null
  plan: string
  owner: {
    name: string | null
    email: string
  }
  contacts: ContactInfo[]
  socialLinks: SocialLink[]
  additionalLinks: AdditionalLink[]
  productName: string
}

interface ClientCardPageProps {
  initialCardData: PublicCardData
}

export default function ClientCardPage({ initialCardData }: ClientCardPageProps) {
  const cardData = initialCardData

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'PHONE':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
        )
      case 'EMAIL':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
        )
      case 'ADDRESS':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        )
    }
  }

  const getPlanBadge = (plan: string) => {
    const planStyles = {
      'STARTER': 'bg-green-100 text-green-800',
      'PROFESSIONAL': 'bg-blue-100 text-blue-800',
      'BUSINESS': 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planStyles[plan as keyof typeof planStyles] || planStyles.STARTER}`}>
        {plan}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Veezet</h1>
              <span className="ml-2 text-sm text-gray-500">2.0</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full" title="Pre-generated for fast performance">
                ⚡ Static
              </span>
              <Link href="/">
                <Button variant="secondary" size="sm">Marketplace</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="primary" size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                {cardData.profilePictureUrl ? (
                  <img
                    src={cardData.profilePictureUrl}
                    alt="Profile Picture"
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-white bg-opacity-20 flex items-center justify-center">
                    <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold">
                  {cardData.title || cardData.owner.name || 'Digital Business Card'}
                </h1>
                <p className="text-blue-100 mt-2">{cardData.productName}</p>
                <div className="mt-3">
                  {getPlanBadge(cardData.plan)}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Notes Section */}
            {cardData.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{cardData.notes}</p>
              </div>
            )}

            {/* Contact Information */}
            {cardData.contacts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardData.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 text-gray-500">
                        {getContactIcon(contact.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {contact.type.toLowerCase()}
                        </p>
                        <p className="text-sm text-gray-600">{contact.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {cardData.socialLinks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cardData.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 text-gray-500">
                        {link.icon ? (
                          <span>{link.icon}</span>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Links */}
            {cardData.additionalLinks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cardData.additionalLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 text-gray-500">
                          {link.icon ? (
                            <span>{link.icon}</span>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{link.title}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Powered by <span className="font-medium text-gray-900">Veezet 2.0</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Get your own digital business card at veezet.com
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
