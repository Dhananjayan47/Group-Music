import React from 'react';
import AppRoutes from './routes/appRoutes';
import  {AuthProvider, MusicProvider}  from './context/AuthProvider';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';
const App = () => {
  return ( 

  <BrowserRouter>
<AuthProvider>
  <MusicProvider>

  <AppRoutes/> 
  </MusicProvider>
</AuthProvider>
  </BrowserRouter>

  )
  ;
}
 
export default App;