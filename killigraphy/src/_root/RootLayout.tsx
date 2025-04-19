import BottomBar from '@/components/shared/Bottombar'
import LeftSideBar from '@/components/shared/LeftSidebar'
import Topbar from '@/components/shared/Topbar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
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