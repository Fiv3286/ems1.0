import { Box, Typography, Button } from "@mui/material";
import React from "react";
export default function StatusErrorPage({ message, statusCode }) {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Typography variant="h1" sx={{ fontWeight: "bold" }}>
        {statusCode}
      </Typography>
      <Typography variant="h4">{message}</Typography>
      {/* Add route to the previous page */}
      <Button> Go Back</Button>
    </Box>
  );
}
