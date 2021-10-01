import React from "react";
import { Typography, AppBar, createTheme, ThemeProvider } from "@mui/material";

import Notifications from "./components/Notifications";
import Options from "./components/Options";
import VideoPlayer from "./components/VideoPlayer";

const theme = createTheme();

const App = () => {
  return (
      <ThemeProvider theme={theme}>
    <div>
      <AppBar position="static" color="inherit">
        <Typography variant="h2" align="center">
          Video Chat
        </Typography>
      </AppBar>
      <VideoPlayer />
      <Options>
        <Notifications />
      </Options>
    </div>
    </ThemeProvider>
  );
};

export default App;
