import React from 'react'
import ChatSection from '../components/ChatSection'
import RightSidebar from '../components/RightSidebar'
import SideBar from '../components/SideBar'

function HomePage() {
  const [userSelected, setUserSelected] = React.useState(false)
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-gray-100">
      <SideBar userSelected={userSelected} setUserSelected={setUserSelected} />
      <div className="flex-1 flex">
        {userSelected && (
          <>
            <ChatSection userSelected={userSelected} setUserSelected={setUserSelected} />
            <RightSidebar />
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
