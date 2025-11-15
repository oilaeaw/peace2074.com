import { AbilityBuilder, createMongoAbility } from '@casl/ability'

interface User {
  id: string
  role: string
}

export function defineAbilitiesFor(user: User | undefined) {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  if (user) {
    // Logged-in user permissions
    if (user.role === 'admin') {
      // Admins can do anything
      can('manage', 'all')
    }
    else if (user.role === 'moderator') {
      // Moderators can do everything a regular user can
      can('read', 'all')
      can('create', 'Bookmark')
      can('manage', 'Bookmark', { userId: user.id })

      // In addition, they can manage all bookmarks and comments from any user.
      // This allows them to delete inappropriate content.
      can('manage', 'Bookmark')
      can('manage', 'Comment') // Assuming you have a 'Comment' subject
    }
    else {
      // Regular users
      can('read', 'all') // Can read public content
      can('create', 'Bookmark')
      can('manage', 'Bookmark', { userId: user.id }) // Can only manage their own bookmarks
    }
  }
  else {
    // Guest permissions (not logged in)
    can('read', 'Sura')
    can('read', 'Page', { public: true })
  }

  return build()
}