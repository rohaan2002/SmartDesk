
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import CommonLayout from './components/common/layout'
import Login from './pages/login'

function App() {

  return (
    <Routes>
      <Route element={<CommonLayout/>}>
        
      <Route path='/' element={<Navigate to="/login" replace/>}  />
          
      <Route path='/login' element={<Login/>} />

      <Route path='*' element={<div>Page Not Found</div>}/>

    </Route>
    </Routes>
  )
}

export default App
