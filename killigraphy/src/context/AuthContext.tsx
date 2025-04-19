// Context is used to manage user authentication state and provide user information throughout the application.
// It uses React's Context API to create a global state for user authentication.
// The context provides methods to check authentication status, set user information, and manage loading state.
// It also handles redirection based on authentication status.

import { getCurrentUser } from '@/lib/Appwrite/api'
import { account } from '@/lib/Appwrite/config'
import { IContextType, IUser } from '@/types'
import {
    createContext, // for creating a context to manage user authentication state
    // useContext is used to access the context in child components 
    useContext,  // for accessing the context in child components
    // useEffect is used to perform side effects in function components
    useEffect, // for performing side effects in function components
    // useState is used to manage state in function components
    useState // for managing state in function components
} from 'react'
import { useNavigate } from 'react-router-dom'

export const INITIAL_USER = {
    id: '',
    name: '',
    email: '',
    imageUrl: '',
    username: '',
    bio: '',
}

const INITIAL_STATE = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => { },
    setIsAuthenticated: () => { },
    checkAuthUser: async () => false as boolean
}

const AuthContext = createContext<IContextType>(INITIAL_STATE)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const navigate = useNavigate()

    const checkAuthUser = async () => {
        try {
            const session = await account.getSession("current");
            if (!session) throw new Error("No session available");

            const currentAccount = await getCurrentUser();
            if (currentAccount) {
                setUser({
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    email: currentAccount.email,
                    imageUrl: currentAccount.imageUrl,
                    username: currentAccount.username,
                    bio: currentAccount.bio,
                });
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking authentication status:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (
            localStorage.getItem('cookieFailback') === '[]' ||
            localStorage.getItem('cookieFailback') === null
        ) navigate('/sign-in')

        checkAuthUser()
    }, [])

    const value = {
        user,
        setUser,
        isLoading,
        setIsLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
export const useUserContext = () => useContext(AuthContext)