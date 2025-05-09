import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
  Card,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CampaignIcon from "@mui/icons-material/Campaign";
import MessageComponent from "./MessageComponent";

export default function ChatComponent({ socket }) {
  const [chatList, setChatList] = React.useState([]);
  const [message, setMessage] = React.useState({ content: "" });
  function sendMessage() {
    setChatList((prevChatList) => [
      ...prevChatList,
      { fromSelf: true, content: message.content },
    ]);
    socket.emit("newMessage", { message: message.content });
    //clear current message
    onMessageChange("");
  }
  function onMessageChange(newContent) {
    setMessage((previousMessage) => {
      return { ...previousMessage, content: newContent };
    });
  }
  React.useEffect(() => {
    console.log(`useEffect called`);
    // to always show the last message
    const chatbox = document.getElementById("chatbox");
    chatbox.scrollTop = chatbox.scrollHeight + 1;

    const onNewMessage = (newMessage) => {
      console.log(`newMessage recieved: ${newMessage}`);
      setChatList((prevChatList) => [
        ...prevChatList,
        { fromSelf: false, content: newMessage.message },
      ]);
    };
    socket.on("newMessage", onNewMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [chatList]);

  return (
    <>
      <Card
        sx={{
          height: "100%",
          width: "100%",
          padding: 0.3,
          border: 1,
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          sx={{
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "center" }}
          >
            <ChatIcon fontSize="large" sx={{ mx: 1 }}></ChatIcon>
            <Typography variant="h4" sx={{ textAlign: "center", flexFlow: 1 }}>
              {" "}
              Chat{" "}
            </Typography>
          </Stack>
          <Box
            id="chatbox"
            sx={{
              height: "100%",
              overflowY: "scroll",
              alignContent: "end",
            }}
          >
            {chatList.map((message) => (
              <MessageComponent message={message}></MessageComponent>
            ))}
          </Box>
          <Stack
            direction="row"
            sx={{
              width: "100%",
            }}
          >
            <TextField
              value={message.content}
              onChange={(e) => {
                onMessageChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  sendMessage();
                }
              }}
              sx={{ flexGrow: 1 }}
            ></TextField>
            <Button
              variant="contained"
              onClick={() => {
                sendMessage();
              }}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Card>
    </>
  );
}
