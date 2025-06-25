import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/signUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import Sidebar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './components/notification/NotificationPage';
import ProfilePage from './components/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

const App = () => {
  const { data: authUser, isLoading, error, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch ("/api/auth/me")
        const data = await res.json()
        if (data.error) return null
        if (!res.ok) throw new Error(data.message || "Something went wrong")
        
        console.log("Auth User is here: ", data);
        return data;
      } catch (error) {
        throw new Error(error)
      }
    }
  })
  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center' >
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar />}
      <div className='flex-1 px-4'>
        <Routes>
          <Route path='/' element={authUser? <HomePage /> : <Navigate to='/login' />} />
          <Route path='/signup' element={!authUser? <SignUpPage /> : <Navigate to='/' />} />
          <Route path='/login' element={!authUser? <LoginPage /> : <Navigate to='/' />} />
          <Route path='/notifications' element={authUser? <NotificationPage /> : <Navigate to='/login' />} />
          <Route path='/profile/:username' element={authUser? <ProfilePage /> : <Navigate to='/login' />} />
        </Routes>
      </div>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
};

export default App;
