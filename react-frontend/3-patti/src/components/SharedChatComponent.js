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

export default function SharedChatComponent({
  socket,
  chatList,
  setChatList,
  currentUserName,
}) {
  const [message, setMessage] = React.useState({
    content: "",
    userName: currentUserName,
  });
  function sendMessage() {
    if (message.content.length == 0) return;
    setChatList((prevChatList) => [
      ...prevChatList,
      { fromSelf: true, content: message.content, userName: currentUserName },
    ]);
    socket.emit("newMessage", {
      content: message.content,
      userName: currentUserName,
    });
    //clear current message
    onMessageChange("");
  }
  function onMessageChange(newMessage) {
    setMessage((previousMessage) => {
      return {
        ...previousMessage,
        content: newMessage,
      };
    });
  }
  React.useEffect(() => {
    console.log(`useEffect called`);
    // to always show the last message
    const chatbox = document.getElementById("chatbox");
    chatbox.scrollTop = chatbox.scrollHeight + 1;
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
              disabled={message.content.length == 0}
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
