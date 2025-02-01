// import * as React from "react";
// import * as ReactDOM from "react-dom/client";
// import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
// import { Provider } from "react-redux"; // ✅ Redux Provider 추가
// import store from "./store/store"; // ✅ Redux Store 가져오기
// import "./index.css";
// import App from "./App.jsx";
// import { FindId, FindPw, Login, Register } from "./features/auth";
// import { Main, MultiMain, SingleMain } from "./features/mainpage";
// import {
//     PronsFirst,
//     PronsFirstPrac,
//     PronsMain,
//     PronsSecond,
//     PronsSecondPrac,
//     PronsThird,
//     PronsThirdPrac,
// } from "./features/pronunciation";
// import { WordMain } from "./features/wordgame";
// import Conversation from "./features/conversation/Conversation";
// import ConversationStart from "./features/conversation/ConversationStart";
// import ChatBox from "./features/session/ChatBox"; // ✅ ChatBox 컴포넌트 추가
// import Webrtc from "./features/session/Webrtc.jsx";
// import CookingGame from "./features/wordgame/CookingGame";

// // ✅ Redux 적용
// const router = createBrowserRouter(
//     createRoutesFromElements(
//         <>
//             <Route path="/" element={<App />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/find-id" element={<FindId />} />
//             <Route path="/find-pw" element={<FindPw />} />
//             <Route path="/main" element={<Main />} />
//             <Route path="/single" element={<SingleMain />} />
//             <Route path="/prons" element={<PronsMain />} />
//             <Route path="/prons/class/1/seq/:seq_id" element={<PronsFirst />} />
//             <Route path="/prons/class/1/seq/:seq_id/prac" element={<PronsFirstPrac />} />
//             <Route path="/prons/class/2/seq/:seq_id" element={<PronsSecond />} />
//             <Route path="/prons/class/2/seq/:seq_id/prac" element={<PronsSecondPrac />} />
//             <Route path="/prons/class/3/seq/:seq_id" element={<PronsThird />} />
//             <Route path="/prons/class/3/seq/:seq_id/prac" element={<PronsThirdPrac />} />
//             <Route path="/wgame" element={<WordMain />} />
//             <Route path="/conversation" element={<Conversation />} />
//             <Route path="/conversation/start" element={<ConversationStart />} />
//             <Route path="/multi" element={<MultiMain />} />
//             <Route path="/session" element={<ChatBox />} /> {/* ✅ 채팅 페이지 추가 */}
//             <Route path="/session/webrtc" element={<Webrtc />} />
//             <Route path="/cooking-game" element={<CookingGame />} />
//         </>
//     )
// );

// // Redux Provider로 전체 앱 감싸기
// ReactDOM.createRoot(document.getElementById("root")).render(
//     <React.StrictMode>
//         <Provider store={store}>
//             <RouterProvider router={router} />
//         </Provider>
//     </React.StrictMode>
// );


// 로그인 했을 때만 서비스 이용할 수 있도록 
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import "./index.css";
import App from "./App.jsx";
import ProtectedLayout from "./components/log/ProtectedLayout"; // ✅ 로그인 필수 레이아웃 추가
import { FindId, FindPw, Login, Register } from "./features/auth";
import { Main, MultiMain, SingleMain } from "./features/mainpage";
import {
    PronsFirst,
    PronsFirstPrac,
    PronsMain,
    PronsSecond,
    PronsSecondPrac,
    PronsThird,
    PronsThirdPrac,
} from "./features/pronunciation";
import { WordMain } from "./features/wordgame";
import Conversation from "./features/conversation/Conversation";
import ConversationStart from "./features/conversation/ConversationStart";
import ChatBox from "./features/session/ChatBox";
import Webrtc from "./features/session/Webrtc.jsx";
import CookingGame from "./features/wordgame/CookingGame";

// ✅ 로그인 필요 없는 페이지 설정 (로그인 페이지만 예외)
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* 로그인 페이지 (로그인 없이 접근 가능) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-pw" element={<FindPw />} />

            {/* ✅ 로그인해야 접근 가능한 페이지 (ProtectedLayout 적용) */}
            <Route element={<ProtectedLayout />}>
                <Route path="/" element={<App />} />
                <Route path="/main" element={<Main />} />
                <Route path="/single" element={<SingleMain />} />
                <Route path="/prons" element={<PronsMain />} />
                <Route path="/prons/class/1/seq/:seq_id" element={<PronsFirst />} />
                <Route path="/prons/class/1/seq/:seq_id/prac" element={<PronsFirstPrac />} />
                <Route path="/prons/class/2/seq/:seq_id" element={<PronsSecond />} />
                <Route path="/prons/class/2/seq/:seq_id/prac" element={<PronsSecondPrac />} />
                <Route path="/prons/class/3/seq/:seq_id" element={<PronsThird />} />
                <Route path="/prons/class/3/seq/:seq_id/prac" element={<PronsThirdPrac />} />
                <Route path="/wgame" element={<WordMain />} />
                <Route path="/conversation" element={<Conversation />} />
                <Route path="/conversation/start" element={<ConversationStart />} />
                <Route path="/multi" element={<MultiMain />} />
                <Route path="/session" element={<ChatBox />} />
                <Route path="/session/webrtc" element={<Webrtc />} />
                <Route path="/cooking-game" element={<CookingGame />} />
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
