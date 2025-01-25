## Frontend

#### 기술 스택 

- react 18.3.1

- react-router-dom 6.28.2

- node.js 22.12.0

#### 컴포넌트 규칙

- 컴포넌트명은 PascalCase로 작성

- api명세에 기반하여 컴포넌트 작성

- router 사용법

    main.jsx

- index.js 사용법

    각 컴포넌트 상위 폴더에 index.js를 두면 유지보수하기에 편해진다.

    예를 들어, User 폴더에 Login, Signup 폴더가 있다고 하자.
    
     └─ User               
     ├─ FindId.jsx    
     ├─ FindPw.jsx      
     ├─ Login.jsx     
     └─ Signup.jsx 

    ```jsx
    
    ```

    
- 참고

    [리액트 폴더 구조 설계 참고](https://aierse.tistory.com/4)

#### 리액트  