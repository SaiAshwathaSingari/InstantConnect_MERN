import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Router } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <>
    
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/profile' element={<ProfilePage/>}/>
      
    </Routes>
    </>
  ) 
}

export default App