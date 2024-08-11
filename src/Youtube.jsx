import React, { useState, useRef, useEffect } from "react";
import { st } from "./Transcript";
import "./youtube.css";
import YouTube from "react-youtube";
import parseTranscript from "./TranscriptParser";
import { useQuery } from "@tanstack/react-query";

const transcript = parseTranscript(st);

function youtube_parser(url) {
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
}

function VideoPlayer({ videoUrl }) {
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [chats, setChats] = useState([]);
  const [inputValue, setInputValue] = useState(""); // State for input field
  const transcriptRef = useRef(null);
  const videoId = youtube_parser(videoUrl);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hey there I am your help desk", id: 1 },
  ]);
  useEffect(() => {
    const activeEntry = transcript.find(
      (entry, index) =>
        currentTime >= entry.time &&
        (index === transcript.length - 1 ||
          currentTime < transcript[index + 1].time)
    );

    if (activeEntry && transcriptRef.current) {
      const activeElement = transcriptRef.current.querySelector(".active");
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }
    }
  }, [currentTime]);

  const { isLoading, error, data } = useQuery({
    queryKey: `${videoId}-transcript`,
    queryFn: () =>
      fetch(`http://localhost:5000/api/data?vId=${videoId}`).then((res) =>
        res.json()
      ),
  });

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onStateChange = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      const interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 100);
      return () => clearInterval(interval);
    }
  };

  const handleTranscriptClick = (time) => {
    if (player) {
      player.seekTo(time);
    }
  };

  const handleChatSubmit = () => {
    if (inputValue.trim()) {
      setChats([...chats, { text: inputValue, id: chats.length }]);
      setInputValue(""); // Clear the input field after submission
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            flex: "2",
            marginRight: "40px",
          }}
        >
          <YouTube
            videoId={videoId}
            onReady={onReady}
            onStateChange={onStateChange}
            style={{ maxWidth: "700px" }}
          />
          <div
            className="transcript"
            ref={transcriptRef}
            style={{
              maxWidth: "700px",
              padding: "0 1rem",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "5px",
              overflow: "auto",
              height: "150px",
              marginTop: "1rem",
            }}
          >
            {data.map((entry, index) => (
              <p
                key={index}
                className={
                  currentTime >= entry.start &&
                  entry.start >= currentTime - 2.75
                    ? "active"
                    : ""
                }
                onClick={() => handleTranscriptClick(entry.start)}
              >
                {entry.text}
              </p>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: "1",
            maxWidth: "400px",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "300px", // Adjust the height as needed
              width: "100%",
              padding: "1rem",
              overflowY: "auto", // Allow vertical scrolling
              overflowX: "hidden", // Prevent horizontal scrolling
            }}
          >
            {chatMessages.map((dt, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: dt.id ? "#b7a3a3" : "#ddd",
                  float: dt.id ? "left" : "right",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  marginBottom: "0.5rem",
                  maxWidth: "80%", // Ensure chat message stays within the box
                  wordWrap: "break-word", // Break long words to prevent overflow
                  //  textAlign: dt.id % 2 === 0 ? "right" : "left", // Example alignment
                }}
              >
                {dt.text}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "1rem",
            }}
          >
            <textarea
              style={{
                flexGrow: 1,
                border: "2px solid grey",
                padding: "0.5rem",
                margin: "2px",
              }}
              id="txt" // Bind input field value to state
              // Update state on input change
            />
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                const data = document.getElementById("txt").value;
                document.getElementById("txt").value = "";
                setChatMessages([...chatMessages, { text: data, id: 0 }]);
              }}
            >
              {">>>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
// import { useState, useRef, useEffect } from "react";
// import { st } from "./Transcript";
// import "./youtube.css";
// import YouTube from "react-youtube";
// import parseTranscript from "./TranscriptParser";
// import { useQuery } from "@tanstack/react-query";

// const transcript = parseTranscript(st);

// const chats = [
//   { text: "dskjhgbksbakjbgks", id: 0 },
//   { text: "iodsyfius", id: 1 },
// ];

// function youtube_parser(url) {
//   var regExp =
//     /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//   var match = url.match(regExp);
//   console.log(url);
//   return match && match[7].length === 11 ? match[7] : false;
// }

// function VideoPlayer({ videoUrl }) {
//   const [player, setPlayer] = useState(null);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [chatMessages, setChatMessages] = useState([
//     { text: "Hey there I am your help desk", id: 1 },
//   ]); // State for chat messages
//   // const [newMessage, setNewMessage] = useState(["Hello I am your study budy"]); // State for new chat input
//   const transcriptRef = useRef(null);
//   const videoId = youtube_parser(videoUrl);

//   useEffect(() => {
//     const activeEntry = transcript.find(
//       (entry, index) =>
//         currentTime >= entry.time &&
//         (index === transcript.length - 1 ||
//           currentTime < transcript[index + 1].time)
//     );

//     if (activeEntry && transcriptRef.current) {
//       const activeElement = transcriptRef.current.querySelector(".active");
//       if (activeElement) {
//         activeElement.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//           inline: "start",
//         });
//       }
//     }
//   }, [currentTime]);

//   const { isLoading, error, data } = useQuery({
//     queryKey: `${videoId}-transcript`,
//     queryFn: () =>
//       fetch(`http://localhost:5000/api/data?vId=${videoId}`).then((res) =>
//         res.json()
//       ),
//   });

//   const onReady = (event) => {
//     setPlayer(event.target);
//   };

//   const onStateChange = (event) => {
//     if (event.data === YouTube.PlayerState.PLAYING) {
//       const interval = setInterval(() => {
//         setCurrentTime(player.getCurrentTime());
//       }, 100);
//       return () => clearInterval(interval);
//     }
//   };

//   const handleTranscriptClick = (time) => {
//     if (player) {
//       player.seekTo(time);
//     }
//   };

//   // const handleSubmit = async () => {
//   //   if (newMessage.trim() === "") return; // Do not submit if the message is empty

//   //   const newChat = { text: newMessage, id: 1 };

//   //   try {
//   //     // Post the new message to the backend
//   //     await fetch("http://localhost:5000/api/chat", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({ message: newMessage, videoId }),
//   //     });

//   //     // Update the chat messages state
//   //     setChatMessages([...chatMessages, newChat]);
//   //     setNewMessage(""); // Clear the input field
//   //   } catch (error) {
//   //     console.error("Error submitting message:", error);
//   //   }
//   // };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error loading transcript</div>;

//   return (
//     <div
//       style={{
//         backgroundColor: "#f0f0f0",
//         padding: "2rem",
//         maxWidth: "1200px",
//         margin: "0 auto",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           padding: "2rem",
//           border: "1px solid #ccc",
//           borderRadius: "5px",
//           backgroundColor: "#fff",
//         }}
//       >
//         <div
//           style={{
//             flex: "2",
//             marginRight: "40px",
//           }}
//         >
//           <YouTube
//             videoId={videoId}
//             onReady={onReady}
//             onStateChange={onStateChange}
//             style={{ maxWidth: "700px" }}
//           />
//           <div
//             className="transcript"
//             ref={transcriptRef}
//             style={{
//               maxWidth: "700px",
//               padding: "0 1rem",
//               backgroundColor: "#fff",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               overflow: "auto",
//               height: "150px",
//               marginTop: "1rem",
//             }}
//           >
//             {data.map((entry, index) => (
//               <p
//                 key={index}
//                 className={
//                   currentTime >= entry.start &&
//                   entry.start >= currentTime - 2.75
//                     ? "active"
//                     : ""
//                 }
//                 onClick={() => handleTranscriptClick(entry.start)}
//               >
//                 {entry.text}
//               </p>
//             ))}
//           </div>
//         </div>
//         <div
//           style={{
//             width: "300px",
//             padding: "1rem",
//             border: "1px solid #ccc",
//             borderRadius: "5px",
//             backgroundColor: "#fff",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               height: "30rem",
//               width: "80%",
//               padding: "1rem",
//               overflowY: "scroll",
//               margin: "1rem",
//             }}
//           >
//             {chatMessages.map((dt, i) => (
//               <div
//                 key={i}
//                 style={{
//                   backgroundColor: dt.id ? "#b7a3a3" : "#ddd",
//                   float: dt.id ? "left" : "right",
//                   padding: "0.5rem",
//                   borderRadius: "5px",
//                   marginBottom: "0.5rem",
//                   textWrap: "wrap",
//                   display: "flex",
//                   width: "10rem",
//                   //textAlign: dt.id ? "left" : "right",
//                 }}
//               >
//                 {dt.text}
//               </div>
//             ))}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               padding: "1rem",
//             }}
//           >
//             <textarea
//               style={{ flexGrow: 1 }}
//               // value={newMessage}
//               id="txt"
//               // Update the state on input change
//             />
//             <button
//               style={{
//                 padding: "0.5rem 1rem",
//                 backgroundColor: "#007bff",
//                 color: "#fff",
//                 borderRadius: "5px",
//                 cursor: "pointer",
//               }}
//               onClick={() =>
//                 setChatMessages([
//                   ...chatMessages,
//                   { text: document.getElementById("txt").value, id: 0 },
//                 ])
//               }
//             >
//               {">>>"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VideoPlayer;
