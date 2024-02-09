import {
  Box,
  Button,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Typography,
  ButtonGroup,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridArrowDownwardIcon,
  GridArrowUpwardIcon,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import useAxiosProtected from "../hooks/useAxiosProtected"
import { useContainerDimensions } from "../hooks/useContainerDimentions";
import { useParams } from "react-router-dom";
import dayjs from 'dayjs';
import { Stack } from "@mui/system";
import UploadedPapersModal from "./UploadedPapersModal";

export default function SessionTable({ startTime, endTime, day, program, sessionTitle, conference, conferenceId }) {
  const [rows, setRows] = useState(program);
  rows.sort((row1, row2) => {
    return row1.start_time > row2.start_time
  })
  let lastPresentationTime = dayjs(startTime).format("HH:mm:ss")

  const { year, id } = useParams()
  const [overtime, setOvertime] = useState(false);
  const [alert, setAlert] = useState("");

  const [openUploadPapers, setOpenUploadPapers] = useState(false);
  const [uploadedPapers, setUploadedPapers] = useState()
  const [uploadedPapersId, setUploadedPapersId] = useState()
  const handleOpenUploadPapers = () => setOpenUploadPapers(true)
  const handleCloseUploadPapers = () => setOpenUploadPapers(false)

  const api = useAxiosProtected();

  const initial_presentation = {
    duration: 30,
    title: "",
    authors: "",
    session_id: id, 
    session: sessionTitle, 
    conference, 
    year: 1900 + startTime.getYear(),
    day: day,
    type: 1
  }
  const [newPresentation, setNewPresentation] = useState(initial_presentation);

  const datagridRef = useRef();
  let { width } = useContainerDimensions(datagridRef);
  width = width - 100 - 150 - 140 - 80 - 20; // -20 is for the scrollbar to dissapear
  
  const columns = [
    {
      field: "order",
      headerName: "Order",
      width: 100,
      sortable: false,
      renderCell: (cellValues) => {
        const index = rows.findIndex((row) => row.id === cellValues.id);
        return (
          <ButtonGroup>
            <GridActionsCellItem
              icon={<GridArrowUpwardIcon />}
              label="Delete"
              onClick={() => handleOnUp(index)}
              disabled={index === 0}
            />
            <GridActionsCellItem
              icon={<GridArrowDownwardIcon />}
              label="Delete"
              onClick={() => handleOnDown(index)}
              disabled={index === rows.length - 1}
            />
          </ButtonGroup>
        );
      },
    },
    {
      field: "time",
      headerName: "Start-End time",
      width: 150,
      editable: false,
      sortable: false,
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 140,
      editable: true,
      sortable: false,
      type: "singleSelect",
      valueOptions: [
        { value: 15, label: "0.5 (15 min)" },
        { value: 30, label: "1 (30 min)" },
        { value: 60, label: "2 (60 min)" },
      ],
    },
    {
      field: "title",
      headerName: "Title of presentation",
      width: width * 0.5,
      editable: true,
      sortable: false,
    },
    {
      field: "authors",
      headerName: "Authors",
      width: width * 0.5,
      editable: true,
      sortable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => deleteRow(params.id)}
        />,
      ],
    },
  ];

  // Load accepted papers
  useEffect(() => {
    api.get('accepted_papers/', {params: {year, conference}})
    .then(res => {
      if(res.data.length === 0){
        setUploadedPapers(null)
        return
      }
      let uploadedPapers = res.data[0].papers
      uploadedPapers.forEach(paper => paper.id = paper._id)
      setUploadedPapersId(res.data[0]._id)
      setUploadedPapers(uploadedPapers)
    })
    .catch(err => {
      setAlert("Loading uploaded papers failed")
    })
  }, [api, conference, year])

  /**
   * Switch the order of the row with the one above
   * @param index - row number in the table
   */
  function handleOnUp(index) {
    if (index === 0) {
      return;
    }
    let newRows = rows.slice();
    newRows[index - 1] = rows[index];
    newRows[index] = rows[index - 1];
    setRows(newRows);

    updatePresentations(newRows);
  }
  /**
   * Switch the order of the row with the one below
   * @param index - row number in the table
   */
  function handleOnDown(index) {
    if (index === rows.length - 1) {
      return;
    }
    let newRows = rows.slice();
    newRows[index + 1] = rows[index];
    newRows[index] = rows[index + 1];
    setRows(newRows);
    updatePresentations(newRows)
  }
  /**
   * Update the presentations in the database after a row was edited
   * @param newRows - the new version of the row which was edited
   */
  function updatePresentations(newRows){
    //fix times
    let currTime = dayjs(startTime)
    newRows.forEach(presentation => {
      presentation.start_time = currTime.format("HH:mm:ss")
      currTime = currTime.add(presentation.duration, 'minute')
      presentation.end_time = currTime.format("HH:mm:ss")
    })

    //send all presentations

    Promise.all(newRows.map((p) => api.patch('programs/update', p, {params: {_id: p._id}})))
    .then(results => {

    })
    .catch(err => {
      setAlert("Something went wrong with updating the presentation!")
    })
  }
  /**
   * Delete presentation
   * @param id the id of the presentation to be deleted 
   */
  function deleteRow(id) {
    api.delete('programs', {params: {_id: id}})
    .then(res => {
      const newRow = rows.filter((row) => row.id !== id)
      setRows(newRow);
      updatePresentations(newRow)
    })
    .catch(err => {
      setAlert("Deleting the presentation failed!")
    })
  }
  /**
   * Create presentation
   */
  function handleAddPresentation() {
    if (newPresentation.title === "" && newPresentation.authors === "") {
      setAlert("Title and Authors fields are empty");
      return;
    }
    if (newPresentation.title === "") {
      setAlert("Title field is empty!");
      return;
    }
    if (newPresentation.authors === "") {
      setAlert("Authors field is empty!");
      return;
    }

    const endPresentation = new Date((new Date('0000-01-01 ' + lastPresentationTime)).getTime() + newPresentation.duration * 1000 * 60)
    let presentation = { 
      ...newPresentation,
      session: sessionTitle,
      start_time: lastPresentationTime, 
      end_time: dayjs(endPresentation).format("HH:mm:ss")
    };

    api.post('programs/', [presentation])
    .then((res) => {
      let newProgram = rows.slice()
      res.data[0].id = res.data[0]._id
      newProgram.push(res.data[0])
      let ids = rows.map((p) => p.id)
      ids.push(res.data[0]._id)

      api.patch(`sessions/${id}`, {presentations: ids})
      .then((res) => {
        setRows(newProgram)
        setNewPresentation(initial_presentation)
        setAlert("")
      })
      .catch((err) => {
        setAlert("Adding the presentation failed!")
      })
    })
    .catch((err) => {
      setAlert("Adding the presentation failed!")
    })
  }
  /**
   * Add presentation from the uploaded papers
   * @param ids - ids of papers to be added
   */
  function handleConfirmAddUploaded(ids){
    const presentations = uploadedPapers.filter(pres => ids.includes(pres.id))
    presentations.forEach(pres => {
        pres.duration = 30
        pres.session_id = id
        pres.session = sessionTitle 
        pres.conference = conference
        pres.start_time = lastPresentationTime
        pres.end_time = dayjs("0000-01-01" + lastPresentationTime).add(30, 'minutes').format("HH:mm:ss")
        lastPresentationTime = pres.end_time;
        pres.year =  1900 + startTime.getYear()
        pres.day = day
        pres.type = 1
    })
    api.post('programs/', presentations)
    .then((res) => {
      let newPres = res.data
      newPres.forEach(pres => pres.id = pres._id)
      // res.data[0].id = res.data[0]._id
      let newProgram = rows.concat(newPres)
      let pids = newProgram.map((p) => p.id)

      api.patch(`sessions/${id}`, {presentations: pids})
      .then((res) => {
        setRows(newProgram)
      })
      .catch((err) => {
        setAlert("Adding the presentations failed!")
      })
    })
    .catch((err) => {
      setAlert("Adding the presentations failed!")
    })
    // delete paper from the uploaded ones
    
    Promise.all(ids.map(id => api.delete(`accepted_papers/${uploadedPapersId}/${id}`)))
    .then(res => {
      setUploadedPapers(uploadedPapers.filter(p => !ids.includes(p._id)))
    })
    .catch(err => {
      setAlert("Removing presentations from uploaded papers failed")
    })

    handleCloseUploadPapers()
  }

  function handleKeyPress(e){
    if(e.keyCode === 13){
      handleAddPresentation();
    }
  }
  /**
   * Update the table when row is edited
   * @param newRow - new version of the edited row
   */
  function handleRowUpdate(newRow) {
    let newRows = rows.slice();
    const index = newRows.findIndex((row) => row.id === newRow.id);
    newRows[index] = newRow;
    setRows(newRows);
    updatePresentations(newRows)
    return newRow;
  }
  /**
   * Calculate start and end time of presentations
   * @param rows - presentations
   * @returns presentations with times
   */
  function addTime(rows) {
    if(rows.length === 0){
      return rows
    }
    let updatedRows = rows.slice();
    let time;
    rows.forEach((row, index) => {
      time = `${row.start_time.substring(0, 5)}-${row.end_time.substring(0, 5)}`
      row.id = row._id
      updatedRows[index].time = time;
    });
    lastPresentationTime = time.substring(6) + ":00";
    if ((lastPresentationTime > dayjs(endTime).format("HH:mm:ss")) !== overtime) {
      setOvertime(!overtime);
    }
    return updatedRows;
  }

  let rowWithTime = addTime(rows);

  return (
    <Stack 
      direction="column"
      spacing={2}
      marginTop={2}
    >
    {/* // <Box> */}
      <Typography variant="h4">Add a presentation</Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <FormControl sx={{ width: "10%" }}>
          <InputLabel id="slot-select">Slot</InputLabel>
          <Select
            labelId="slot-select"
            id="slot-select"
            label="Slot"
            value={newPresentation.duration}
            onChange={(e) => {
              let changed = { ...newPresentation };
              changed.duration = e.target.value;
              setNewPresentation(changed);
            }}
          >
            <MenuItem value={15}>0.5 (15 min)</MenuItem>
            <MenuItem value={30}>1 (30 min)</MenuItem>
            <MenuItem value={60}>2 (60 min)</MenuItem>
          </Select>
        </FormControl>
        <TextField
          sx={{
            width: "40%",
          }}
          id="title"
          label="Title"
          variant="outlined"
          value={newPresentation.title}
          onChange={(e) => {
            let changed = { ...newPresentation };
            changed.title = e.target.value;
            setNewPresentation(changed);
          }}
          onKeyDown={handleKeyPress}
        />
        <TextField
          sx={{
            width: "45%",
          }}
          id="authors"
          label="Authors"
          variant="outlined"
          value={newPresentation.authors}
          onChange={(e) => {
            let changed = { ...newPresentation };
            changed.authors = e.target.value;
            setNewPresentation(changed);
          }}
          onKeyDown={handleKeyPress}
        />
      </Box>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <Button variant="contained" onClick={handleAddPresentation} sx={{ alignSelf:"center"}}>
          <AddIcon /> Add presentation
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleOpenUploadPapers()} sx={{ alignSelf:"center"}} disabled={!uploadedPapers}>
          <AddIcon /> Add presentations from uploaded papers
        </Button>
      </Stack>
      {uploadedPapers &&
        <UploadedPapersModal
          open={openUploadPapers}
          handleClose={handleCloseUploadPapers}
          papers={uploadedPapers}
          handleAddPresentations={handleConfirmAddUploaded}
        />
      }
      {alert && <Alert color="error" onClose={() => setAlert("")}>{alert}</Alert>}
      <Box sx={{ width: "100%" }} ref={datagridRef}>
        <DataGrid
          rows={rowWithTime}
          columns={columns}
          editMode="row"
          processRowUpdate={(newRow, oldRow) => handleRowUpdate(newRow)}
          onProcessRowUpdateError={(error) =>
            setAlert("Presentation failed to update!")
          }
          autoHeight
          disableColumnMenu
          disableColumnFilter
          hasPagination={false}
        />
      </Box>
      {overtime && (
        <Alert severity="error">
          There are presentations which are scheduled overtime!!!
        </Alert>
      )}
    {/* </Box> */}
    </Stack>
  );
}

