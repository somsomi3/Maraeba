import './index.css'; // ✅ CSS 경로 변경
import { Login } from './features/auth';

function App() {
  return (
    <div className="app-container"> {/* ✅ 중앙 정렬 추가 */}
      <Login />
    </div>
  );
}

export default App;
