import { getCurrentUser, User } from '@/lib/api';
import { IContextType } from '@/types';
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

export const INITIAL_USER = {
    _id: '',
    name: '',
    username: '',
    email: '',
    accountId: '',
    bio: '',
    imageUrl: '',
    createdAt: '',
    updatedAt: '',
};

const INITIAL_STATE: IContextType = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => { },
    setIsAuthenticated: () => { },
    checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthUser = async () => {
        try {
            setIsLoading(true);

            const currentUser = await getCurrentUser();

            if (currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (error) {
            console.error('checkAuthUser failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Kiểm tra auth khi load lại trang
    useEffect(() => {
        checkAuthUser();
    }, []);

    const value: IContextType = {
        user,
        isLoading,
        isAuthenticated,
        setUser,
        setIsAuthenticated,
        checkAuthUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useUserContext = () => useContext(AuthContext);
