import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { Login, Register, FindId, FindPw } from './features/auth' 
import { Main, MultiMain, SingleMain } from './features/mainpage';
import { PronsMain, PronsFirst, PronsSecond, PronsThird, PronsFirstPrac, PronsSecondPrac, PronsThirdPrac } from './features/pronunciation';
import { WordMain } from './features/wordgame';
import Conversation from "./features/conversation/Conversation";
import ConversationStart from "./features/conversation/ConversationStart";
import CookingGame from "./features/wordgame/CookingGame"; 


// 라우트 정의
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/find-id" element={<FindId />} />
      <Route path="/find-pw" element={<FindPw />} />
      <Route path="/main" element={<Main />} />
      <Route path="/single" element={<SingleMain />} />
      <Route path="/prons" element={<PronsMain />} />
      <Route path="/prons-first" element={<PronsFirst />} />
      <Route path="/first-prac" element={<PronsFirstPrac />} />
      <Route path="/prons-second" element={<PronsSecond />} />
      <Route path="/second-prac" element={<PronsSecondPrac />} />  
      <Route path="/prons-third" element={<PronsThird />} />
      <Route path="/third-prac" element={<PronsThirdPrac />} />  
      <Route path="/wgame" element={<WordMain />} />
      <Route path="/conversation" element={<Conversation />} />
      <Route path="/conversation/start" element={<ConversationStart />} />
      <Route path="/multi" element={<MultiMain />} />
      <Route path="/cooking-game" element={<CookingGame />} />
    </>
  )
);

// 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
