import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import "./index.css";
import App from "./App.jsx";
import ProtectedLayout from "./components/log/ProtectedLayout"; // ✅ 로그인 할 때만 접근가능하도록록
import { FindId, FindPw, Login, Register } from "./features/auth";
import { Main, MultiMain, SingleMain } from "./features/mainpage";
import {
    PronsFirst,
    PronsSecond,
    PronsMain,
    PronsResult,
} from "./features/pronunciation";
import { WordMain } from "./features/wordgame";
import { Conversation,ConversationStart } from "./features/conversation";
import {ChatBox,Webrtc, WaitingRoom, CreateRoom, RoomPage,RoomList  } from "./features/room"
import CookingGame from "./features/wordgame/CookingGame";
import AnimalGameTheme from "./features/wordgame/AnimalGameTheme";
import AnimalGame from "./features/wordgame/AnimalGame";
import Profile from "./features/user/Profile";



// 라우트 정의
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-pw" element={<FindPw />} />

            <Route element={<ProtectedLayout />}>
                <Route path="/main" element={<Main />} />
                <Route path="/single" element={<SingleMain />} />
                <Route path="/prons" element={<PronsMain />} />
                <Route path="/prons/class/:class_id/seq/:seq_id" element={<PronsFirst />} />
                <Route path="/prons/class/:class_id/seq/:seq_id/prac" element={<PronsSecond />} />
                <Route path='/prons/result' element={<PronsResult/>} />
                <Route path="/wgame" element={<WordMain/>}/>
                <Route path="/conversation" element={<Conversation/>}/>
                <Route path="/conversation/start" element={<ConversationStart/>}/>
                <Route path="/multi" element={<MultiMain/>}/>
                <Route path="/session" element={<ChatBox/>}/> {/* ✅ 채팅 페이지 추가 */}
                <Route path="/room/webrtc" element={<Webrtc/>}/>
                <Route path="/room/waiting" element={<WaitingRoom />} />
                <Route path="/room/create" element={<CreateRoom />} />
                <Route path="/cooking-game" element={<CookingGame />} />
                <Route path="/room/:roomId" element={<RoomPage />} /> {/* ✅ RoomPage 라우트 추가 */}
                <Route path="/room/RoomList" element={<RoomList/>}/>

                <Route path="/animal-game-theme" element={<AnimalGameTheme />} />
                <Route path="/animal-game/:themeName" element={<AnimalGame />} />
                <Route path="/profile" element={<Profile />} />

            </Route>

        </>
    )
);

// ✅ Redux Provider로 전체 앱 감싸기
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
);
