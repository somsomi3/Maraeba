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
src                        
├─ assets                  
│  ├─ logo.png             
│  └─ react.svg            
├─ components              
│  └─ button               
│     ├─ CustomButton.css  
│     └─ CustomButton.jsx  
├─ features                
│  ├─ auth                 
│  │  ├─ FindId.jsx        
│  │  ├─ FindPw.jsx        
│  │  ├─ index.css         
│  │  ├─ index.js          
│  │  ├─ Login.jsx         
│  │  └─ Register.jsx      
│  ├─ conversation         
│  │  ├─ Conversation.css  
│  │  ├─ Conversation.jsx  
│  │  └─ index.js          
│  ├─ mainpage             
│  │  ├─ index.js          
│  │  ├─ Main.css          
│  │  ├─ Main.jsx          
│  │  ├─ MultiMain.css     
│  │  ├─ MultiMain.jsx     
│  │  ├─ SingleMain.css    
│  │  └─ SingleMain.jsx    
│  ├─ pronunciation        
│  │  ├─ index.js          
│  │  ├─ PronsMain.css     
│  │  └─ PronsMain.jsx     
│  ├─ session              
│  └─ wordgame             
│     ├─ index.js          
│     ├─ WordMain.css      
│     └─ WordMain.jsx      
├─ utils                   
│  └─ api.js               
├─ App.css                 
├─ App.jsx                 
├─ index.css               
└─ main.jsx                
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
        