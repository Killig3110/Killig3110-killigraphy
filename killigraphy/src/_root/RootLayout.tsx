import BottomBar from '@/components/shared/Bottombar'
import LeftSideBar from '@/components/shared/LeftSidebar'
import Topbar from '@/components/shared/Topbar'
import { useUserContext } from '@/context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;

  return (
    <div className='w-full md:flex'>
      <Topbar />
      <LeftSideBar />

      <section className='flex flex-1 h-full'>
        <Outlet /> {/* This is where the child routes will be rendered. Outllet is a placeholder for the child routes. */}
      </section>

      <BottomBar />
    </div>
  )
}

export default RootLayout