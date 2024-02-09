import { Button, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import { useEffect, useState } from "react";

const types = ["CONFERENCE", "BREAK", "SPEAKER", "PLENARY", "TUTORIAL", "MISC"]
const typeStrings = {
  "BREAK": "Break",
  "CONFERENCE": "Conference",
  "SPEAKER": "Invited Speaker",
  "PLENARY": "Plenary session",
  "MISC": "Miscellaneous",
  "TUTORIAL": "Tutorial"
}

export default function ActivityInputBox({ value, onChange, slotsAvaialble, committees, onRemove, isSingle }) {
  // set the default duration
  useEffect(() => {
    if (slotsAvaialble) {
      onChange("duration", slotsAvaialble * 15)
    }
    else {
      onChange("duration", "")
    }
  }, [slotsAvaialble])

  return (
    <Stack
      spacing={1}
    >
      <Typography variant="h6" component="h2">
        Type of activity
      </Typography>
      <Select
        size="small"
        value={value.type}
        onChange={(e) => onChange("type", e.target.value)}
        sx={{ width: "160px" }}
      >
        {types.map((type) => (
          <MenuItem value={type} key={type}>
            {typeStrings[type]}
          </MenuItem>
        ))}
      </Select>
      {value.type === 'BREAK' &&
        <>
          <Typography variant="h6" component="h2">
            Description
          </Typography>
          <TextField
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description"
            size="small"
            sx={{ width: "160px" }}
          />
        </>}
      {value.type === 'SPEAKER' &&
        <>
          <Typography variant="h6" component="h2">
            Name
          </Typography>
          <TextField
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Name of guest"
            size="small"
            sx={{ width: "160px" }}
          />
        </>}
      {value.type === 'PLENARY' &&
        <>
          <Typography variant="h6" component="h2">
            Description
          </Typography>
          <TextField
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description"
            size="small"
            sx={{ width: "160px" }}
          />
        </>}
      {value.type === 'MISC' &&
        <>
          <Typography variant="h6" component="h2">
            Description
          </Typography>
          <TextField
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description"
            size="small"
            sx={{ width: "160px" }}
          />
        </>}
      {value.type === 'TUTORIAL' &&
        <>
          <Typography variant="h6" component="h2">
            Description
          </Typography>
          <TextField
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description"
            size="small"
            sx={{ width: "160px" }}
          />
        </>}
      {value.type === 'CONFERENCE' &&
        <>
          <Typography variant="h6" component="h2">
            Committee:
          </Typography>
          <Select
            size="small"
            value={value.conference}
            onChange={(e) => onChange("conference", e.target.value)}
            sx={{ width: "160px" }}
          >
            {committees.map((committee) => (
              <MenuItem value={committee} key={committee}>
                {committee}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="h6" component="h2">
            Duration (in slots)
          </Typography>
          <Select
            size="small"
            value={value.duration}
            onChange={(e) => onChange("duration", e.target.value)}
            sx={{ width: "160px" }}
            disabled={!slotsAvaialble}
          >
            {Array(slotsAvaialble).fill(0).map((_, i) => (
              <MenuItem value={((i + 1) / 2) * 30} key={(i + 1) / 2}>
                {(i + 1) / 2}
              </MenuItem>
            ))
            }
          </Select>
        </>
      }
      {!isSingle && <Button onClick={onRemove} variant="contained" color="error"><RemoveIcon /> Remove </Button>}
    </Stack>
  );
}
