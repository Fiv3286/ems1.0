import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useEffect } from "react";
export default function AlertWindow({ size, message, severity, rows}) {
  const [open, setOpen] = useState(true);
 
  // Always open the alert window when there is not valid data
  useEffect(() =>{
    setOpen(true)
  }, [rows, message])
  return (
    <Box sx={{ width: "80%" }}>
      <Collapse in={open}>
        <Alert
          severity={severity}
          variant="outlined"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size={size}
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
