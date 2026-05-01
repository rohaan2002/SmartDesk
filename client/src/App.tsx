
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import CommonLayout from './components/common/layout'
import Login from './pages/login'
import Support from './pages/support'
import { AuthGate } from './context/auth'

function App() {

  return (
    <Routes>
      <Route element={<CommonLayout/>}>
        
      <Route path='/' element={<Navigate to="/login" replace/>}  />
          
      <Route path='/login' element={<Login/>} />
      <Route path='/support' element={
        <AuthGate>
        <Support/>
        </AuthGate>
        } />

      <Route path='*' element={<div>Page Not Found</div>}/>

    </Route>
    </Routes>
  )
}

export default App
