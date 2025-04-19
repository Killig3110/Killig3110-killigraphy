import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { INITIAL_USER, useUserContext } from '@/context/AuthContext'
import { useSignOutAccountMutation } from '@/lib/react-query/QueriesAndMutations'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'

const LeftSideBar = () => {
    const { pathname } = useLocation()
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
        <nav className='leftsidebar'>
            <div className='flex flex-col gap-11'>
                <Link to='/' className='flex gap-3 justify-center items-center'>
                    <img
                        src='/assets/images/logo_round.png'
                        alt='logo'
                        className='w-24 h-24 rounded-full'
                    />
                </Link>

                <Link to={'/profile/${user.id}'} className='flex gap-3 items-center'>
                    <img
                        src={user.imageUrl || '/assets/images/profile-placeholder.svg'}
                        alt='profile'
                        className='h-14 w-14 rounded-full'
                    />
                    <div className='flex flex-col'>
                        <p className='body-bold'>
                            {user.name}
                        </p>

                        <p className='small-regular text-light-3'>
                            @${user.username}
                        </p>
                    </div>
                </Link>

                <ul className='flex flex-col gap-6'>
                    {sidebarLinks.map((link: INavLink) => {
                        const isActive = pathname === link.route

                        return (
                            <li
                                key={link.label}
                                className={`leftsidebar-link group ${isActive ? 'bg-primary-500' : ''}`}
                            >
                                <NavLink to={link.route} className='flex gap-4 items-center p-4'>
                                    <img
                                        src={link.imgURL}
                                        alt={link.label}
                                        className={`group-hover:invert-white ${isActive ? 'invert-white' : ''}`}
                                    />
                                    {link.label}
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <Button variant='ghost' className='shad-button_ghost' onClick={handleSignOut}>
                <img src='/assets/icons/logout.svg' alt='logout' />
                <p className='small-medium lg:base-medium'>Logout</p>
            </Button>
        </nav>
    )
}

export default LeftSideBar