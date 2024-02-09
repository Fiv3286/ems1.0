import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Link,
} from "@mui/material";
export default function WarningPage({
  message,
  linkForBackupPage = "/",
  buttonExplanationText,
}) {
  const navigator = useNavigate();
  return (
    <div>
      <Box
        display="flex"
        flexDirection={"column"}
        maxWidth={500}
        alignItems="center"
        justifyContent={"center"}
        margin="auto"
        marginTop={15}
        padding={5}
        borderRadius={10}
        boxShadow={"20px 20px 50px #ccc"}
        sx={{
          ":hover": {
            boxShadow: "40px 40px 60px #ccc",
          },
        }}
      >
        <Typography>{message}</Typography>
        <Link
          onClick={() => {
            navigator(linkForBackupPage);
          }}
        >
          {buttonExplanationText}
        </Link>
      </Box>
    </div>
  );
}
