import React from 'react'
import { Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import { ChatProvider } from '../context/ChatContext'
import { useContext } from 'react'
function App() {
  const {authUser} = useContext(AuthContext);
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to={"/"}/>}/>
      <Route 
        path='/' 
        element={
          authUser ? (
            <ChatProvider>
              <HomePage/>
            </ChatProvider>
          ) : (
            <Navigate to={"/login"}/>
          )
        }
      />
      <Route 
        path='/profile' 
        element={
          authUser ? (
            <ChatProvider>
              <ProfilePage/>
            </ChatProvider>
          ) : (
            <Navigate to={"/login"}/>
          )
        }
      />
    </Routes>
    </>
  ) 
}

export default App