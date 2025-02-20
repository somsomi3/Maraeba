## Frontend

참고용 

#### 기술 스택 

- react 18.3.1

- react-router-dom 6.28.2

- node.js 22.12.0


### 디렉토리 구조

- 컴포넌트명은 PascalCase로 작성

- api 명세에 기반하여 컴포넌트 구조 설정

- **router** 사용법

    [react router 6.28.2ver 공식문서](https://reactrouter.com/en/6.28.2/start/tutorial)

    main.jsx는 진입점이다. 

    여기에 React Router를 작성하자. 공식 문서 예시는 다음과 같다. 

    ```jsx
    import * as React from "react";
    import * as ReactDOM from "react-dom/client";
    import {
    createBrowserRouter,
    RouterProvider,
    } from "react-router-dom";
    import "./index.css";

    const router = createBrowserRouter([
    {
        path: "/",
        element: <div>Hello world!</div>,
    },
    ]);

    ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
    );
    ```


- **index.js** 사용법

    각 기능별 폴더에 index.js를 두면 유지보수하기 편해진다.

    예를 들어, User 폴더가 다음과 같이 구성되어 있다고 하자.
    
     └─ User               
     ├─ FindId.jsx    
     ├─ FindPw.jsx      
     ├─ Login.jsx     
     └─ Signup.jsx 

    1. index.js를 사용하지 않았을 경우

        ```jsx
        import FindId from './components/User/FindId';
        import FindPw from './components/User/FindPw';
        import Login from './components/User/Login';
        import Signup from './components/User/Signup';
        ```
        와 같이 각 컴포넌트를 하나씩 import 해야 한다.
    
    2. index.js를 사용할 경우,

        ```jsx
        // index.js

        export { default as FindId } from './FindId';
        export { default as FindPw } from './FindPw';
        export { default as Login } from './Login';
        export { default as Signup } from './Signup';
        ```

        ```jsx
        // App.jsx

        import { FindId, FindPw, Login, Signup } from './components/User';
        ```

        위와 같이 User 폴더를 디렉토리 이름만을 이용해 import 할 수 있다.

        컴포넌트가 추가되거나 이름이 변경될 때, 변경 사항을 index.js에만 반영하면 된다.

        여러 곳에서 import를 수정할 필요가 없으므로 유지보수가 용이하다.
        
        각 폴더에 여러 개의 컴포넌트를 넣어 관리하기로 했으므로, 이 방법을 사용하기로 했다.
    
- 참고

    [리액트 폴더 구조 설계 참고](https://aierse.tistory.com/4)

    [리액트 폴더 구조 설계 참고 2](https://dev.to/fpaghar/folder-structuring-techniques-for-beginner-to-advanced-react-projects-30d7)
    

#### 폴더 구조 및 설명

```
│── src/
│   │── assets/
│   │   │── background/
│   │   │── fonts/
│   │   │── icons/
│   │   │── images/
│   │   │── profiles/
│   │   │── logo.png
│   │   │── react.svg
│   │
│   │── components/
│   │   │── button/
│   │   │   │── ConversationButton.jsx
│   │   │   │── GoBackButton.css
│   │   │   │── GoBackButton.jsx
│   │   │   │── HomeButton.css
│   │   │   │── HomeButton.jsx
│   │   │   │── LogoutButton.jsx
│   │   │   │── RecordButton.css
│   │   │   │── RecordButton.jsx
│   │
│   │   │── loading/
│   │   │   │── CuteLoading.css
│   │   │   │── CuteLoading.jsx
│   │
│   │   │── log/
│   │   │   │── ProtectedLayout.jsx
│   │
│   │   │── popup/
│   │   │   │── ConversationStopPopup.jsx
│   │   │   │── CorrectPopup.css
│   │   │   │── CorrectPopup.jsx
│   │   │   │── PausePopup.css
│   │   │   │── PausePopup.jsx
│   │
│   │── features/
│   │   │── auth/
│   │   │   │── FindId.jsx
│   │   │   │── FindPw.jsx
│   │   │   │── index.css
│   │   │   │── index.js
│   │   │   │── KakaoCallback.jsx
│   │   │   │── KakaoLogin.jsx
│   │   │   │── Login.jsx
│   │   │   │── NaverCallback.jsx
│   │   │   │── NaverLogin.jsx
│   │   │   │── Register.jsx
│   │
│   │   │── conversation/
│   │   │   │── Conversation.css
│   │   │   │── Conversation.jsx
│   │   │   │── ConversationStart.css
│   │   │   │── ConversationStart.jsx
│   │   │   │── DarongSpeech.css
│   │   │   │── DarongSpeech.jsx
│   │   │   │── index.js
│   │
│   │   │── mainpage/
│   │   │   │── index.js
│   │   │   │── Main.css
│   │   │   │── Main.jsx
│   │   │   │── MultiMain.css
│   │   │   │── MultiMain.jsx
│   │   │   │── SingleMain.css
│   │   │   │── SingleMain.jsx
│   │
│   │   │── pronunciation/
│   │   │   │── index.js
│   │   │   │── PronsCompletePopup.css
│   │   │   │── PronsCompletePopup.jsx
│   │   │   │── PronsFirst.css
│   │   │   │── PronsFirst.jsx
│   │   │   │── PronsMain.css
│   │   │   │── PronsMain.jsx
│   │   │   │── PronsResult.css
│   │   │   │── PronsResult.jsx
│   │   │   │── PronsSecond.jsx
│   │
│   │   │── room/
│   │   │   │── ChatBox.jsx
│   │   │   │── CreatePopup.css
│   │   │   │── CreatePopup.jsx
│   │   │   │── index.js
│   │   │   │── RoomList.css
│   │   │   │── RoomList.jsx
│   │   │   │── Webrtc.css
│   │   │   │── Webrtc.jsx
│   │
│   │   │── user/
│   │   │   │── ChangePassword.jsx
│   │   │   │── index.js
│   │   │   │── Profile.css
│   │   │   │── Profile.jsx
│   │   │   │── ProfileDelete.jsx
│   │   │   │── ProfileInfo.css
│   │   │   │── ProfileInfo.jsx
│   │
│   │   │── wordgame/
│   │   │   │── AnimalGame.css
│   │   │   │── AnimalGame.jsx
│   │   │   │── CookingGame.css
│   │   │   │── CookingGame.jsx
│   │   │   │── index.js
│   │   │   │── WordMain.css
│   │   │   │── WordMain.jsx
│   │
│   │── store/
│   │   │── authSlice.js
│   │   │── browserSlice.js
│   │   │── cameraSlice.js
│   │   │── store.js
│   │
│   │── utils/
│   │   │── api.js
│   │
│   │── .editorconfig
│   │── App.css
│   │── App.jsx
│   │── AuthInitializer.jsx
│   │── index.css
│   │── main.jsx
```


- main.jsx

    진입점. 라우터 정의

- App.jsx

    최상위 App 컴포넌트

- index.css

    전역 스타일(특정 컴포넌트, 페이지 스타일은 개별 css 파일로 분리)

- assets

    정적 자산 -> 이미지, 폰트 등

- components

    재사용한 가능한 컴포넌트(버튼, 카드, 헤더)

- features

    기능별 컴포넌트(auth, mainpage ...)

- utils 

    유틸리티 함수(api.js ...)

---

#### font 사용법

    1. src/fonts 폴더에 font.ttf 파일 업로드

    2. css 파일에 
    
        ```css
        @font-face {
        font-family: 'Dovemayo_gothic';
        src: url('./assets/fonts/Dovemayo_wild.ttf') format('woff2');
        font-weight: normal;
        font-style: normal;
        }
        ```
        와 같이 url에 폰트 파일 경로를 넣는다. 

    3. 각 css 파일에서 불러와서 사용한다. 

        ```
        .card{
        font-family: Dovemayo_gothic;
        font-size: 1.5rem;
        }
        ```
        기본이 되는 폰트는 가장 바깥에 있는 index.css 에 정의하면, 모든 컴포넌트에서 사용가능하다 😇


#### components/button 에 있는 뒤로가기, 홈버튼 사용법

- 각 경로(ex. ../../assets/components/button/GobackButton)에 있는 button을 import 해와서, 각 컴포넌트 return에 <GoBackButton /> 와 같이 사용하면 된다.


---


### React 프로젝트 생성하는 법(react v.18, router v.6)

- React 프로젝트를 Vite CLI로 생성하고, PWA 기능추가 하기 위해 vite-plugin-pwa 설정

1. React 프로젝트 생성 

    `npm create vite@latest my-pwa-app --template react`

    (React 프로젝트를 Vite CLI로 생성한 후 React 18을 사용하려면 프로젝트 생성 후 수동으로 React와 React DOM 버전을 설치해야 한다.)

    React, React DOM의 버전을 18로 변경(기존 버전 제거후 react 18 설치)

    `npm uninstall react react-dom`

    `npm install react@18 react-dom@18`

    react 버전 확인

    `npm list react react-dom`

2. 프로젝트로 이동

    `cd my-pwa-app`

3. 필수 패키지 설치(PWA 기능 추가)

    `npm install vite-plugin-pwa --save-dev`

4. `vite.config.js` 설정 

    PWA를 구성하기 위해 vite.config.js 파일에 vite-plugin-pwa 설정

    - vite.config.js

        ```js
        import { defineConfig } from 'vite';
        import react from '@vitejs/plugin-react';
        import { VitePWA } from 'vite-plugin-pwa';

        export default defineConfig({
        plugins: [
            react(),
            VitePWA({
            registerType: 'autoUpdate', // 서비스 워커 자동 업데이트 설정
            manifest: {
                name: 'My PWA App', // 앱의 전체 이름
                short_name: 'PWA App', // 앱의 짧은 이름
                start_url: '/', // 시작 URL
                display: 'standalone', // PWA의 표시 모드
                background_color: '#ffffff', // 배경 색상
                theme_color: '#000000', // 테마 색상
                icons: [
                {
                    src: 'icon-192x192.png', // 192x192 아이콘 경로
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'icon-512x512.png', // 512x512 아이콘 경로
                    sizes: '512x512',
                    type: 'image/png',
                },
                ],
            },
            }),
        ],
        });`
        ```
5. PWA 아이콘 추가

    `vite.config.js` 의
    `manifest.json` 에 설정된 아이콘 경로에 맞게 아이콘 파일 준비 

    - 파일 위치

        프로젝트의 public/ 디렉토리에 아이콘 파일 저장

        파일 이름: icon-192x192.png, icon-512x512.png (이름은 자유롭게 변경 가능, 설정과 일치해야 함).
    
    - 아이콘 크기

        192x192, 512x512

6. 로컬 서버 실행

    개발 중인 PWA 확인하기 위해 로컬 서버 실행

    `npm run dev`

    브라우저에서 http://localhost:5173로 접속

7. PWA 테스트 

    로컬 개발 환경에서는 HTTPS가 기본적으로 활성화되지 않아 PWA 기능(예: 서비스 워커, 설치 가능 여부)이 제한될 수 있다. 

    - vite.config.js에서 HTTPS 서버를 설정하거나

        ```js
        server: {
        https: true,
        },
        ```
    
    - 빌드 후 배포된 환경에서 테스트 한다. 

8. 프로덕션 빌드

    PWA는 정적 파일로 배포되므로 빌드하여 결과물을 생성한다. 

    `npm run build`

    dist/ 디렉토리에 빌드된 파일이 생성된다.

9. 정적 서버에서 실행

    - serve로 실행 

        `npm install -g serve`
        `serve -s dist`

    - url 확인

        브라우저에서 http://localhost:3000으로 접속하여 PWA가 정상적으로 동작하는지 확인

10. PWA 배포 

    PWA는 HTTPS에서 완전한 기능을 제공한다. 

    현재는 nginx 를 이용해서 배포할 예정

11. PWA 테스트 하기

    - 배포 후 브라우저에서 PWA 기능을 확인:

        Chrome DevTools → Application 탭 → Manifest 및 Service Worker 확인.

    - "Install" 버튼 확인:
    
        URL 입력창 옆에 PWA 설치 버튼이 표시되면 성공적으로 설정된 것



### React Router v6

- React router v6 설치 

    `npm install react-router-dom@6`

    버전 확인

    `npm list react-router-dom`


---
#### API 호출

- flask API 요청

    ```js
    import { flaskApi } from './api';

    flaskApi.get('/some-flask-endpoint')
    .then((response) => {
        console.log('Flask API response:', response.data);
    })
    .catch((error) => {
        console.error('Flask API error:', error);
    });
    ```

- spring API 요청

    ```js
    import { springApi } from './api';

    springApi.get('/some-spring-endpoint')
    .then((response) => {
        console.log('Spring API response:', response.data);
    })
    .catch((error) => {
        console.error('Spring API error:', error);
    });
    ```

    