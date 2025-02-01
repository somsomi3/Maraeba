import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import {FindId, FindPw, Login, Register} from './features/auth'
import {Main, MultiMain, SingleMain} from './features/mainpage';
import {
    PronsFirst,
    PronsFirstPrac,
    PronsMain,
    PronsSecond,
    PronsSecondPrac,
    PronsThird,
    PronsThirdPrac
} from './features/pronunciation';
import {WordMain} from './features/wordgame';
import Conversation from "./features/conversation/Conversation";
import ConversationStart from "./features/conversation/ConversationStart";
import ChatBox from "./features/session/ChatBox"; // ✅ ChatBox 컴포넌트 추가
import Webrtc from "./features/session/Webrtc.jsx";
import CookingGame from "./features/wordgame/CookingGame"; 
import AnimalGameTheme from "./features/wordgame/AnimalGameTheme"; 
import AnimalGame from "./features/wordgame/AnimalGame";

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
      <Route path="/prons/class/:class_id/seq/:seq_id" element={<PronsFirst />} />
      <Route path="/prons/class/:class_id/seq/:seq_id/prac" element={<PronsFirstPrac />} />
      <Route path="/prons/class/:class_id/seq/:seq_id" element={<PronsSecond />} />
      <Route path="/prons/class/:class_id/seq/:seq_id/prac" element={<PronsSecondPrac />} />
      <Route path="/prons/class/:class_id/seq/:seq_id" element={<PronsThird />} />
      <Route path="/prons/class/:class_id/seq/:seq_id/prac" element={<PronsThirdPrac />} />
      <Route path="/wgame" element={<WordMain/>}/>
      <Route path="/conversation" element={<Conversation/>}/>
      <Route path="/conversation/start" element={<ConversationStart/>}/>
      <Route path="/multi" element={<MultiMain/>}/>
      <Route path="/session" element={<ChatBox/>}/> {/* ✅ 채팅 페이지 추가 */}
      <Route path="/session/webrtc" element={<Webrtc/>}/>
      <Route path="/cooking-game" element={<CookingGame />} />
      <Route path="/animal-game-theme" element={<AnimalGameTheme />} />
      <Route path="/animal-game/:themeName" element={<AnimalGame />} />
        </>
    )
);

// 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);