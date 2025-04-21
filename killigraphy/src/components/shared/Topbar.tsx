import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { INITIAL_USER, useUserContext } from '@/context/AuthContext'
import { useSignOutAccountMutation } from '@/lib/react-query/QueriesAndMutations'

const Topbar = () => {
    const navigate = useNavigate()
    const { user, setUser, setIsAuthenticated } = useUserContext();
    const { mutate: signOut } = useSignOutAccountMutation()

    const handleSignOut = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        signOut();
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
        navigate("/sign-in");
    };

    return (
        <section className='topbar'>
            <div className='flex-between py-4 px-5'>
                <Link to='/' className='flex gap-3 items-center'>
                    <img
                        src='/assets/images/logo_round.png'
                        alt='logo'
                        className='w-16 h-16'
                    />
                </Link>

                <div className='flex gap-4'>
                    <Button variant='ghost' className='shad-button_ghost' onClick={handleSignOut}>
                        <img src='/assets/icons/logout.svg' alt='logout' />
                    </Button>

                    <Link to={'/profile/${user.id}'} className='flex-center gap-3'>
                        <img
                            src={user.imageUrl || '/assets/images/profile-placeholder.svg'}
                            alt='profile'
                            className='h-8 w-8 rounded-full'
                        />
                        <span className='text-sm font-semibold'>{user.name}</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Topbar
