import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnterUserDataForm from "./EnterUserDataForm";
import {
  Button,
  Container,
  Box,
  Paper,
  TextField,
  Grid,
  Stack,
  Typography,
  Modal,
} from "@mui/material";
export default function SocketComponent({ socket }) {
  const navigate = useNavigate();
  const [message, setMessage] = React.useState("");
  const [messageList, setMessageList] = React.useState([]);
  const [allUsers, setAllUsers] = React.useState([]);
  const [userName, setUserName] = React.useState("");
  const [openUserNameModal, setOpenUserNameModal] = React.useState(true);

  const handleSubmit = () => {
    console.log(socket);
    const sendObject = { success: "true", msg: message, userName: userName };
    console.log(sendObject);
    socket.emit("submit", sendObject);
  };
  useEffect(() => {
    const allUsersResponse = (data) => {
      setAllUsers((previousData) => data);
      console.log(`Updated userList: ${allUsers} with new user: ${data}`);
      console.log(
        `userdata length: ${allUsers.length}, newData length: ${data.length}`
      );
      allUsers.forEach((user) => {
        console.log(`UserName: ${user.userName}, id: ${user.id}`);
      });
    };
    socket.on("allClients", allUsersResponse);
  }, [socket]);

  useEffect(() => {
    console.log("useEffect called");
    const onSubmitRespose = (data) => {
      // fix bug here for multiple updates
      var newMessage = data.userName + ": " + data.msg;
      setMessageList((prevMessageList) => [...prevMessageList, newMessage]);
      console.log(
        `Updated MessageList: ${messageList} with new message: ${data.msg}`
      );
    };
    socket.on("submitresponse", onSubmitRespose);

    // socket.on("submitresponse", (data) => {
    //   // fix bug here for multiple updates
    //   setMessageList([...messageList, data.msg]);
    //   console.log(`Updated MessageList:  with new message: ${data.msg}`);
    // });
    return () => {
      socket.off("submitresponse", onSubmitRespose);
    };
  }, [messageList]);

  const isCurrentUser = () => {
    if (socket.id == "UvtgKys6PQD5KHo8AAAF") {
      return (
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          Current User
        </Typography>
      );
    } else {
      return (
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          Not Current User
        </Typography>
      );
    }
  };

  const getUserNameModal = () => {
    return (
      <Modal
        open={openUserNameModal}
        onClose={() => {
          setOpenUserNameModal(false);
          socket.emit("setUserData", userName);
          console.log(`userName Set: ${userName}`);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <>
          <EnterUserDataForm
            modalTitle="Set UserName"
            formData={userName}
            setFormData={setUserName}
            label="UserName"
          ></EnterUserDataForm>
          {/* <TextField
            margin="normal"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            sx={{ width: "80%", backgroundColor: "white" }}
          ></TextField> */}
        </>
      </Modal>
    );
  };

  return (
    <>
      {getUserNameModal()}
      <Button
        color="primary"
        onClick={() => {
          navigate(-1);
        }}
      >
        Go Back
      </Button>
      <Container sx={{ textAlign: "center" }}>
        <Paper elevation={3} sx={{ backgroundColor: "#f9f9f9" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              //   height: 700,
              //   width: 700,
              mt: 10,
            }}
          >
            {isCurrentUser()}
            {/* <Button>Click Me</Button> */}
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              Hi {userName}
            </Typography>
            <Button
              onClick={() => {
                setOpenUserNameModal(true);
              }}
            >
              {" "}
              Change User Name
            </Button>
            <Stack>
              {allUsers.map((user) => (
                <Typography>
                  userName: {user.userName}; id: {user.id}{" "}
                </Typography>
              ))}
            </Stack>

            <Stack>
              {messageList.map((message) => (
                <Typography>{message}</Typography>
              ))}
            </Stack>
            <Grid container>
              <Grid item md={9}>
                <TextField
                  margin="normal"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ width: "80%", backgroundColor: "white" }}
                ></TextField>
              </Grid>
              <Grid
                item
                md={3}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    // justifyContent: "center",
                    //   height: 700,
                    //   width: 700,
                    // mt: 10,
                  }}
                >
                  <Button variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
