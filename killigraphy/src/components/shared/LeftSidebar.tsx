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
        <nav className="flex flex-col justify-between h-screen p-4 w-60 lg:w-72">
            <div className='flex flex-col gap-11'>
                <Link to='/' className='flex gap-3 justify-center items-center'>
                    <img
                        src='/assets/images/logo_round.png'
                        alt='logo'
                        className='w-20 h-20 lg:w-24 lg:h-24 rounded-full'
                    />
                </Link>

                <Link to={`/profile/${user._id}`} className='flex gap-3 items-center'>
                    <img
                        src={user.imageUrl || 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg'}
                        alt='profile'
                        className='h-14 w-14 rounded-full'
                    />
                    <div className='flex flex-col'>
                        <p className='body-bold truncate max-w-[150px]'>
                            {user.name}
                        </p>

                        <p className='small-regular text-light-3 truncate max-w-[150px]'>
                            @{user.username}
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