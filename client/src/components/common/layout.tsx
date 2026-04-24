import React from 'react'
import { Outlet } from 'react-router-dom'


const CommonLayout = () => {
  return (
    
    // <div className='relative mx-auto max-w-6xl min-h-full py-8 px-4'>
    <div className='relative mx-auto max-w-6xl '>
        SOME COMMON LAYOUT ... after this youll see the outlet which will render the child routes
        <Outlet/>
    </div>
    
  )
}

export default CommonLayout