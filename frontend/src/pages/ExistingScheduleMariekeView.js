import { Box, Button, Typography } from "@mui/material";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import useAxiosProtected from "../hooks/useAxiosProtected";
import AlertWindow from "../components/AlertWindow";
import NavBarSteeringChair from "../components/Navbars/NavBarSteeringChair";
import WarningPage from "../components/WarningPage";
import { useNavigate, useParams } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Sidebar from "../components/Sidebar";
//2.6 & 2.12 from the figma design.
/**
 * @author Kris Michaylov
 */
export default function ExistingScheduleMariekeView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [tableFilter, setTableFilter] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const api = useAxiosProtected();
  const { year } = useParams();
  const [date, setDate] = useState("");
  const [arrayOfDates, setArrayOfDates] = useState([]);
  const navigator = useNavigate();
  // Columns used for the Data Grid table.
  const columns = [
    {
      field: "_id",
      editable: false,
      filterable: false,
    },
    {
      field: "conference",
      headerName: "Conference",
      type: "singleSelect",
      width: 100,
      editable: false,
    },
    {
      field: "day",
      headerName: "Date (dd-mm-yyyy)",
      width: 150,
      editable: false,
    },
    {
      field: "session",
      headerName: "Topic",
      width: 150,
      editable: false,
    },
    {
      field: "start_time",
      headerName: "Start Time",
      width: 80,
      editable: false,
    },
    { field: "end_time", headerName: "End Time", width: 80, editable: false },
    {
      field: "title",
      headerName: "Title of Presentation",
      width: 400,
      editable: true,
    },
    {
      field: "authors",
      headerName: "Speakers",
      width: 400,
      editable: true,
    },
  ];
  /**
   * Function to convert from the HH:MM:SS time format to HH:MM for the Data Grid display.
   * @param {*} data - the program data
   * @returns the whole program data with the start and end times changed in the specified format.
   */
  function trimSecondsFromTime(data) {
    for (let element of data) {
      let newStartTime = element["start_time"].slice(0, 5);
      let newEndTime = element["end_time"].slice(0, 5);
      element["start_time"] = newStartTime;
      element["end_time"] = newEndTime;
    }
    return data;
  }

  /**
   * Loads all the distinct dates from the programs endpoint and adds the data to the select filter.
   * @param {*} data - the whole program data for specific year
   */
  function loadDistinctDatesPerYear(data) {
    let datesArray = [];
    for (let element of data) {
      if (!datesArray.includes(element["day"])) {
        datesArray.push(element["day"]);
      }
    }
    datesArray.sort();
    setArrayOfDates(datesArray);
  }

  /**
   * Function to change the date format to dd:mm:yyyy.
   * @param {*} data - the program data
   * @returns the whole program data with the date changed in the specified format.
   */
  function changeDateFormat(data) {
    for (let element of data) {
      let elementsOfDay = element["day"].split("-");
      const newDateFormat = `${elementsOfDay[2]}/${elementsOfDay[1]}/${elementsOfDay[0]}`;
      element["day"] = newDateFormat;
    }
    return data;
  }

  const cachedLoadData = useCallback(loadData, [api, year]); // remove wanrnigs
  // Used to load program data once the page renders.
  useEffect(() => {
    cachedLoadData();
  }, [cachedLoadData]);
  /**
   * Async function used to fetch the data from the backend for the programs.
   */
  async function loadData() {
    await api
      .get("/programs/", { params: { year: year } })
      .then((res) => {
        const data = res.data;
        if (data.length === 0) {
          setLoadingError(true);
        } else {
          let newData = trimSecondsFromTime(data);
          newData = changeDateFormat(newData);
          loadDistinctDatesPerYear(newData);
          setRows(newData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setLoadingError(true);
      });
  }
  /**
   * Function used to a whole object from the program data with a new one.
   * @param newRow - the new row that should be replaced in the program data.
   */
  function handleReplaceRow(newRow) {
    let updateHasIncorrectValue = false;
    let copyPreviousRows = rows.slice();

    let foundIndex = copyPreviousRows.findIndex((x) => x._id === newRow._id);

    if (newRow.session === "") {
      setErrorMessage("The topic field cannot be empty");
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (newRow.start_time === "") {
      setErrorMessage(
        "Start time field cannot be empty, please add a start time."
      );
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (newRow.end_time === "") {
      setErrorMessage("End time field cannot be empty, please add a end time.");
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (newRow.start_time > newRow.end_time) {
      setErrorMessage("The start time cannot be after the end time!");
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (newRow.start_time.length !== 5) {
      setErrorMessage(
        "The start time should be in the format hh:mm, e.g. 09:00, not 9:00"
      );
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (newRow.end_time.length !== 5) {
      setErrorMessage(
        "The end time should be in the format hh:mm, e.g. 09:00, not 9:00"
      );
      // Set the rows here with the previous data
      updateHasIncorrectValue = true;
    }
    if (!updateHasIncorrectValue) {
      setErrorMessage("");
      let copyStartTime = newRow["start_time"];
      let copyEndTime = newRow["end_time"];
      let copyDay = newRow["day"].split("/");
      let formatDay = `${copyDay[2]}-${copyDay[1]}-${copyDay[0]}`;
      newRow["start_time"] = copyStartTime + ":00";
      newRow["end_time"] = copyEndTime + ":00";

      newRow["day"] = formatDay;
      copyPreviousRows[foundIndex] = newRow;

      patchRow(newRow);
    }
    setRows(copyPreviousRows);
    loadData();
  }

  /**
   * Function used to set custom field for the duplicate checking
   * @param {*} sidebarFilter - the custom filter.
   */
  function handleSetDuplicateFilterFromSidebar(sidebarFilter) {
    setTableFilter(sidebarFilter);
  }

  /**
   * Async function used to send the updated data in the backend.
   * @param {*} newRow - the new row that should be replaced in the program data.
   */
  async function patchRow(newRow) {
    await api
      .patch("/programs/update", newRow, {
        params: { _id: newRow._id },
      })
      .catch((error) => console.error(error));
  }
  /**
   * Function used from the Data Grid to pass the edited and old data.
   * @param {*} editedDataRow - the new edited row
   * @param {*} oldRow - the old row
   */
  function handleEditRow(editedDataRow, oldRow) {
    const updatedRow = { ...editedDataRow };
    handleReplaceRow(updatedRow);
    return updatedRow;
  }

  function MyToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }

  /**
   * Function used to set custom field for the duplicate checking
   */
  function handleSetCustomFilter(dt) {
    setTableFilter([
      {
        field: "day",
        operator: "equals",
        value: dt,
      },
    ]);
  }

  function clearFilters() {
    setTableFilter([]);
    setDate("");
  }

  return (
    <>
      <NavBarSteeringChair />
      {/* Display loading state while the data is being fetched */}
      {loading && <Typography variant="h2">Loading...</Typography>}
      {/* Display error page in case something went wrong*/}
      {loadingError && (
        <>
          <WarningPage
            buttonExplanationText={"Go the login page"}
            message={`Currently, there is no program data for any of the committees committees!`}
            linkForBackupPage="/"
          ></WarningPage>
        </>
      )}
      {!loading && !loadingError && (
        <>
          <Box
            margin={"1rem"}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h3">Detailed Overview</Typography>
          </Box>
          <Box sx={{ height: 650, width: "100%" }}>
            {/* Display alert window in case something occurred while editing the data, e.g. invalid input */}
            {errorMessage !== "" && (
              <AlertWindow
                size={"small"}
                severity={"error"}
                message={errorMessage}
              />
            )}
            <Stack direction={"row"} spacing={2}>
              <FormControl>
                <InputLabel id="date-label">Date</InputLabel>
                <Select
                  size="small"
                  labelId="date-label"
                  label="Date"
                  value={date}
                  onChange={(e) => {
                    const dt = e.target.value;

                    setDate(dt);
                    handleSetCustomFilter(dt);
                  }}
                  sx={{ width: "160px" }}
                >
                  {arrayOfDates.map((element, index) => {
                    if (arrayOfDates.length === 0) {
                      return false;
                    }
                    return (
                      <MenuItem key={index} value={element.toUpperCase()}>
                        {element.toUpperCase()}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                sx={{ margin: "1rem", position: "" }}
                onClick={() => clearFilters()}
              >
                Clear Filter
              </Button>
            </Stack>
            <DataGrid
              columns={columns}
              rows={rows}
              pageSize={5}
              rowsPerPageOptions={[10, 20, 30]}
              editMode="row"
              columnVisibilityModel={{
                _id: false,
              }}
              slots={{ toolbar: MyToolbar }}
              getRowId={(row) => row._id}
              filterModel={{ items: tableFilter }}
              processRowUpdate={(newRow, oldRow) =>
                handleEditRow(newRow, oldRow)
              }
              onProcessRowUpdateError={(error) =>
                console.error(error)
              }
            />
            <Button
              variant="contained"
              size="large"
              sx={{ margin: "1rem", position: "" }}
              onClick={() => navigator(`/admin/${year}/conference-creation`)}
            >
              Back
            </Button>
            {date !== "" && (
              <Sidebar
                warningFilter={handleSetDuplicateFilterFromSidebar}
                year={year}
                rows={rows}
                day={date}
              />
            )}
          </Box>
        </>
      )}
    </>
  );
}
