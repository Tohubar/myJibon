import React from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/signUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import Sidebar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './components/notification/NotificationPage';
import ProfilePage from './components/profile/ProfilePage';

const App = () => {
  return (
   <div className='flex max-w-6xl mx-auto'>
    {/* //Common components bc these will showed always */}   
      <Sidebar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/notifications' element={<NotificationPage />} />
				<Route path='/profile/:username' element={<ProfilePage />} />
			</Routes>
      <RightPanel />
		</div>
  )
}

export default App