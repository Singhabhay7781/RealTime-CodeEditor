import React, { useEffect, useState, useRef } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../../socket";
import ACTIONS from "../Action";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [socketInitialized, setSocketInitialized] = useState(false); // Track socket initialization
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const recatNavigator = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.on("connect_error", handleErrors);
        socketRef.current.on("connect_failed", handleErrors);

        function handleErrors(e) {
          console.log("socket error", e);
          toast.error("Socket connection failed, try again later");
          recatNavigator("/");
        }

        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });

        // Listening for joined event
        socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, username, socketId }) => {
            if (username !== location.state?.username) {
              toast.success(`${username} joined the room.`);
              console.log(`${username} joined`);
            }
            setClients(clients);
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        );

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room`);
          setClients((prev) =>
            prev.filter((client) => client.socketId !== socketId)
          );
        });

        setSocketInitialized(true); // Indicate socket has been initialized
      } catch (error) {
        handleErrors(error);
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.disconnect();
      }
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied");
    } catch (error) {
      toast.error("Could not copy the Room ID");
    }
  }

  function leaveRoom() {
    recatNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrapper">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/code-sync.png" alt="logo" className="logoImage" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copybtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leavebtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        {socketInitialized && (
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        )}{" "}
        {/* Render Editor only after socket is initialized */}
      </div>
    </div>
  );
}

export default EditorPage;
