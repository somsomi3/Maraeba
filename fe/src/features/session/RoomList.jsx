import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RoomList = () => {
  const [rooms, setRooms] = useState([]); // ✅ 초기값 설정
  const forceUpdate = React.useReducer(() => ({}), {})[1]; // ✅ 강제 리렌더링

  useEffect(() => {
    fetch("http://localhost:8081/rooms/list") // ✅ 백엔드에서 방 목록 가져오기
      .then(response => response.json())
      .then(data => {
        console.log("📌 받아온 방 목록 데이터:", data); // ✅ 데이터 확인
        setRooms(data);
        forceUpdate(); // ✅ 강제로 리렌더링
      })
      .catch(error => console.error("❌ 방 목록 불러오기 실패:", error));
  }, []);

  useEffect(() => {
    console.log("📌 업데이트된 rooms 상태:", rooms);
  }, [rooms]); // ✅ rooms 상태 변경 감지

  return (
    <div>
      <h1>방 목록</h1>
      <ul>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <li key={room.id}>
              {/* ✅ 클릭하면 URL에 roomId 포함 */}
              <Link to={`/room/${room.id}`}>{room.title} (ID: {room.id})</Link>
            </li>
          ))
        ) : (
          <p>❌ 방 목록이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default RoomList;
