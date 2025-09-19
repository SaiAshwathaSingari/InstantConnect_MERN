import React from 'react'
import ChatSection from '../components/ChatSection'
import RightSidebar from '../components/RightSidebar'
import SideBar from '../components/SideBar'

function HomePage() {
  const [userSelected, setUserSelected] = React.useState(false)
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-gray-100">
      <SideBar />
      <div className="flex-1 flex">
        <ChatSection />
        <RightSidebar />
      </div>
    </div>
  )
}

export default HomePage
