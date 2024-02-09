import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { Stack } from "@mui/system";
import ActivityInputBox from "./ActivityInputBox";
import dayjs from 'dayjs';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const initialActivityInput = { type: "CONFERENCE", description: "", duration: "", conference: "", speaker_name: "" }

export default function ActivityModal({
  handleClose,
  open,
  handleConfirm,
  dayIndex,
  sessions,
  start_time_initial,
  duration_initial,
  timeslots,
  committees,
  alert,
  MAX_NUMBER_OF_PARALLEL_CONFERENCES,
  START_TIME_DAY
}) {

  const [startTime, setStartTime] = useState(start_time_initial);
  const [duration, setDuration] = useState(duration_initial);

  const [activityInputs, setActivityInputs] = useState(sessions || [{ ...initialActivityInput }]);

  //fix the timeslots whe the start time changes
  useEffect(() => {
    if (sessions) {
      const timeslotIndex = (((new Date("0000-01-01 " + start_time_initial)).getTime()) - START_TIME_DAY.getTime()) / 1000 / 60 / 15
      let time = dayjs("0000-01-01 " + sessions[0].start_time)
      for (let i = 0; i < duration_initial / 15; i++) {
        timeslots[timeslotIndex + i] = time.format("HH:mm");
        time = time.add(15, 'm')
      }
    }
  }, [startTime, duration_initial, sessions, start_time_initial, timeslots, START_TIME_DAY])

  /**
   * Calculates the possible duration times
   * @returns the possible duration times
   */
  function durationAvailable() {
    const res = [];
    const startIndex = timeslots.findIndex((x) => x === startTime);
    for (let i = startIndex; i < timeslots.length; i++) {
      if (timeslots[i] !== null) {
        const time = (i - startIndex + 1) * 15
        res.push(
          <MenuItem value={time} key={time}>
            {time}
          </MenuItem>
        )
      }
      else {
        break;
      }
    }
    return res;
  }

  function handleRemove(object) {
    setActivityInputs(activityInputs.filter((el) => el !== object))
  }

  /**
   * Update a propery in a activity
   * @param field - property to be chagned
   * @param newValue - new value
   * @param index - activity in which to be changed
   */
  function handleOnChange(field, newValue, index) {
    let newAV = activityInputs.slice();
    newAV[index][field] = newValue
    setActivityInputs(newAV)
  }

  function onCancelAddActivity() {
    setActivityInputs([{ ...initialActivityInput }])
    handleClose();
  }

  /**
   * Executes when the button for adding an activity is pressed
   * @returns Modal for adding an activity
   */
  function onAddActivity() {
    activityInputs.forEach((activity, index) => {
      activity.start_time = startTime
      if (activity.duration === 0) {
        activity.duration = duration
      }
      activity.session_order = index + 1
    })
    if (!handleConfirm(activityInputs, dayIndex)) {
      return
    }
    setActivityInputs([{ ...initialActivityInput }])
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" align="center">
            Adding an activity
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            key="time contatiner"
            p={2}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              key="start time"
            >
              <Typography variant="h6" component="h2" noWrap>
                Start time
              </Typography>
              <Select
                size="small"
                MenuProps={MenuProps}
                value={startTime}
                onChange={(e) => { setDuration(""); setStartTime(e.target.value); }}
                sx={{ width: "160px" }}
              >
                {timeslots.map((timeslot) => {
                  if (!timeslot) {
                    return null
                  }
                  return (
                    <MenuItem value={timeslot} key={timeslot}>
                      {timeslot}
                    </MenuItem>
                  )
                })}
              </Select>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              key="duration"
            >
              <Typography variant="h6" component="h2" noWrap disabled={startTime === ""}>
                Duration (in minutes)
              </Typography>
              <Select
                size="small"
                MenuProps={MenuProps}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                sx={{ width: "160px" }}
                disabled={startTime === ""}
              >
                {
                  durationAvailable()
                }
              </Select>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={3}
            sx={{ width: "100%" }}
            key="activity input container"
            p={2}
          >
            {activityInputs.map((obj, i) => (
              <ActivityInputBox
                key={i}
                value={obj}
                slotsAvaialble={duration / 15}
                onChange={(field, newValue) => handleOnChange(field, newValue, i)}
                committees={committees}
                onRemove={() => handleRemove(obj)}
                isSingle={activityInputs.length === 1}
              />
            ))}
            {activityInputs.length < MAX_NUMBER_OF_PARALLEL_CONFERENCES &&
              <Button
                onClick={() => {
                  let newAV = activityInputs.slice();
                  newAV.push({ ...initialActivityInput })
                  setActivityInputs(newAV)
                }}
              >
                Add activity in parralell
              </Button>
            }
          </Stack>

          
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            key="cancel and confirm buttons"
          >
            <Button onClick={onCancelAddActivity} color="error" variant="contained">
              Cancel
            </Button>
            <Button onClick={onAddActivity} color="success" variant="contained">
              Confirm
            </Button>
          </Stack>
          {alert}
        </Box>
      </Modal>
    </>
  );
}
