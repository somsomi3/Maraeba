import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import "./index.css";
import App from "./App.jsx";
import ProtectedLayout from "./components/log/ProtectedLayout"; // ✅ 로그인 할 때만 접근가능하도록록
import {
    FindId,
    FindPw,
    Login,
    Register,
    KakaoCallback,
    NaverCallback,
} from "./features/auth";
import { Main, MultiMain, SingleMain } from "./features/mainpage";
import {
    PronsFirst,
    PronsSecond,
    PronsMain,
    PronsResult,
} from "./features/pronunciation";
import { WordMain } from "./features/wordgame";
import { Conversation, ConversationStart } from "./features/conversation";

import { ChatBox, Webrtc, RoomList } from "./features/room";

import CookingGame from "./features/wordgame/CookingGame";
import AnimalGame from "./features/wordgame/AnimalGame";
import {
    Profile,
    ProfileInfo,
    ChangePassword,
    ProfileDelete,
    ResetPassword,
} from "./features/user";
import AuthInitializer from "./AuthInitializer.jsx";

// 라우트 정의
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />} />
            <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
            <Route path="/auth/naver/callback" element={<NaverCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-pw" element={<FindPw />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedLayout />}>
                <Route path="/main" element={<Main />} />
                <Route path="/single" element={<SingleMain />} />
                <Route path="/prons" element={<PronsMain />} />
                <Route
                    path="/prons/class/:class_id/seq/:seq_id"
                    element={<PronsFirst />}
                />
                <Route
                    path="/prons/class/:class_id/seq/:seq_id/prac"
                    element={<PronsSecond />}
                />
                <Route path="/prons/result" element={<PronsResult />} />
                <Route path="/wgame" element={<WordMain />} />
                <Route path="/conversation" element={<Conversation />} />
                <Route
                    path="/conversation/start"
                    element={<ConversationStart />}
                />
                <Route path="/multi" element={<MultiMain />} />
                <Route path="/session" element={<ChatBox />} />{" "}
                {/* ✅ 채팅 페이지 추가 */}
                <Route path="/room/webrtc" element={<Webrtc />} />
                <Route path="/cooking-game" element={<CookingGame />} />
                <Route path="/room/:roomId" element={<Webrtc />} />{" "}
                {/* ✅ RoomPage 라우트 추가 */}
                <Route path="/room/RoomList" element={<RoomList />} />
                <Route
                    path="/animal-game/start-game"
                    element={<AnimalGame />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile-info" element={<ProfileInfo />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile-delete" element={<ProfileDelete />} />
                {/*<Route path="/room/waiting" element={<WaitingRoom />} />*/}
                {/*<Route path="/room/:roomId" element={<RoomPage />} />*/}

            </Route>
        </>
    )
);

// ✅ Redux Provider로 전체 앱 감싸기
ReactDOM.createRoot(document.getElementById("root")).render(
    //<React.StrictMode>
    <Provider store={store}>
        <AuthInitializer>
            <RouterProvider router={router} />
        </AuthInitializer>
    </Provider>
    //</React.StrictMode>
);
