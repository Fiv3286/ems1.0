import NavBarProgramChair from "../components/Navbars/NavBarProgramChair";
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
import { useNavigate, useParams } from "react-router-dom";
import WarningPage from "../components/WarningPage";
//1.4 From the figma design
/**
 * @author Kris Michaylov
 */

export default function OverviewTable() {
  const api = useAxiosProtected();
  const [rows, setRows] = useState([]);
  const { year } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { committee } = useParams();
  const navigator = useNavigate();
  // Columns used for the Data Grid table.
  const columns = [
    {
      field: "_id",
      editable: false,
      filterable: false,
    },
    {
      field: "session",
      headerName: "Topic",
      width: 150,
      editable: false,
    },
    {
      field: "day",
      headerName: "Date (dd-mm-yyyy)",
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

  const cachedLoadData = useCallback(loadData, [api, committee, year]); // it is like this to fixed warnings
  // Used to load program data once the page renders.
  useEffect(() => {
    cachedLoadData();
  }, [cachedLoadData]);

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

  /**
   * Async function used to fetch the data from the backend for the programs.
   */
  async function loadData() {
    await api
      .get("/programs/", { params: { conference: committee, year: year } })
      .then((res) => {
        const data = res.data;

        if (data.length === 0) {
          setLoadingError(true);
        } else {
          let newData = trimSecondsFromTime(data);
          newData = changeDateFormat(newData);
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
  return (
    <>
      <NavBarProgramChair />
      {/* Display loading state while the data is being fetched */}
      {loading && <Typography variant="h2">Loading...</Typography>}
      {/* Display error page in case something went wrong*/}
      {loadingError && (
        <>
          <WarningPage
            buttonExplanationText={"Go committee selection page"}
            message={`There is no program data for the ${committee} committee!`}
            linkForBackupPage="/chair/scheduleSelection"
          ></WarningPage>
        </>
      )}
      {!loading && !loadingError && (
        <>
          <Box sx={{ height: 650, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "5px",
              }}
            >
              <Typography variant="h3">{`${committee} committee`}</Typography>
            </Box>
            {/* Display alert window in case something occurred while editing the data, e.g. invalid input */}
            {errorMessage !== "" && (
              <AlertWindow
                size={"small"}
                severity={"error"}
                message={errorMessage}
              />
            )}
            <DataGrid
              columns={columns}
              rows={rows}
              slots={{ toolbar: MyToolbar }}
              pageSize={5}
              rowsPerPageOptions={[10, 20, 30]}
              editMode="row"
              columnVisibilityModel={{
                _id: false,
              }}
              getRowId={(row) => row._id}
              processRowUpdate={(newRow, oldRow) =>
                handleEditRow(newRow, oldRow)
              }
              onProcessRowUpdateError={(error) =>
                console.error(error)
              }
            />
            <Button
              variant="contained"
              sx={{ margin: "1rem", position: "" }}
              onClick={() => navigator(`/chair/${committee}/${year}/program`)}
            >
              Back
            </Button>
          </Box>
        </>
      )}
    </>
  );
}
