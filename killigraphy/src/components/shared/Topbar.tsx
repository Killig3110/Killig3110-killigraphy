import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useUserContext } from '@/context/AuthContext'
import { useSignOutAccountMutation } from '@/lib/react-query/QueriesAndMutations'

const Topbar = () => {
    const navigate = useNavigate()
    const { user } = useUserContext()
    const { mutate: signOut, isSuccess } = useSignOutAccountMutation()

    useEffect(() => {
        if (isSuccess) {
            navigate(0)
        }
    }, [isSuccess])

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
                    <Button variant='ghost' className='shad-button_ghost' onClick={() => signOut}>
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
