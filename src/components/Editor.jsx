import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Action";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef();
  useEffect(() => {
    async function init() {
      const textarea = document.getElementById("realTimeEditor");
      editorRef.current = CodeMirror.fromTextArea(textarea, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseBrackets: true,
        autoCloseTags: true,
        lineNumbers: true,
      });

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        console.log("server -> client");
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    init();
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, []);

  return <textarea id="realTimeEditor"></textarea>;
}

export default Editor;
