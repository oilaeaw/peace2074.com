// Shared in-memory user storage for local development
// In production, you'd use a real database

export const MOCK_USERS: any[] = [
    {
        id: 'waelio',
        username: 'waelio',
        password: '123456789',
        email: 'wael@peace2074.com',
        role: 'admin',
        first_name: 'Wael',
        last_name: 'Admin'
    }
]

export function findUserByUsername(username: string) {
    return MOCK_USERS.find(u => u.username === username)
}

export function findUserById(id: string) {
    return MOCK_USERS.find(u => u.id === id)
}

export function updateUserPassword(userId: string, newPassword: string) {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) {
        user.password = newPassword
        return true
    }
    return false
}

export function addUser(user: any) {
    MOCK_USERS.push(user)
}
