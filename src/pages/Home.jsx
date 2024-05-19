import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created a new Room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code == "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homeLogo" src="/code-sync.png" alt="code-sync-logo" />
        <p className="mainLabel">Paste invitation Room Id</p>
        <div className="inputGroup">
          <input
            type="text"
            placeholder="ROOM ID"
            className="inputBox"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            placeholder="USERNAME"
            className="inputBox"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />
        </div>
        <button className="btn joinBtn" onClick={joinRoom}>
          Join
        </button>
        <span className="createInfo">
          If you don't have an invite then create &nbsp;{" "}
          <a href="" onClick={createNewRoom} className="createNewBtn">
            new room
          </a>
        </span>
      </div>
      <footer>
        <h4>
          Built with 💛 by &nbsp;
          <a href="https://github.com/singhabhay7781">@Singhabhay7781</a>
        </h4>
      </footer>
    </div>
  );
}

export default Home;
