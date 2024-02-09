import NavBarProgramChairS2 from "../components/Navbars/NavBarProgramChairS2";
import { IconButton, Typography, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useState, useEffect, useCallback } from "react";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import uuid from "react-uuid";
import useAxiosProtected from "../hooks/useAxiosProtected";
import AlertWindow from "../components/AlertWindow";
import InputLabel from "@mui/material/InputLabel";
import DownloadIcon from "@mui/icons-material/Download";
import FormControl from "@mui/material/FormControl";
import WarningPage from "../components/WarningPage";
import { useParams } from "react-router-dom";
//1.6
/**
 * @author Kris Michaylov
 */
export default function CommitteesPage() {
  const columns = [
    {
      field: "_id",
      headerName: "ID",
      width: 10,
      filterable: false,

    },
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: ["ACCEPTED", "PENDING", "REJECTED", "RESERVED"],
      width: 150,
      editable: true,
    },
    {
      field: "first_name",
      headerName: "First Name",
      width: 150,
      editable: true,
    },
    { field: "last_name", headerName: "Last Name", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 250, editable: true },
    {
      field: "country",
      headerName: "Country",
      width: 150,
      editable: true,
    },
    {
      field: "affiliation",
      headerName: "Affiliation",
      width: 300,
      editable: true,
    },
    {
      field: "delete",
      type: "actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteRow(params.id)}
        />,
      ],
    },
  ];
  const [totalSlots, setTotalSlots] = useState(0);
  const [rows, setRows] = useState([]);
  const { committee } = useParams();
  const { year } = useParams();
  const [numberOfAcceptedRows, setNumberOfAcceptedRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [committeeIdField, setCommitteeIdField] = useState();
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [disableDecreaseButton, setDisableDecreaseButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [status, setStatus] = useState("PENDING");

  const api = useAxiosProtected();
  const emailRegex = new RegExp(
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  );
  const countryRegex = new RegExp(/^[a-zA-Z\s-]*$/);
  const cachedLoadCommitteeData = useCallback(loadCommitteeData, [api, committee, year]) // fix warning
  // Used to load the data on the first page render
  useEffect(() => {
    cachedLoadCommitteeData();
  }, [cachedLoadCommitteeData]);

  // Used to update the  number of accepted rows when the rows or totalSlots states change.
  useEffect(() => {
    const acceptedRows = rows.filter(
      (item) => item.status === "ACCEPTED"
    ).length;
    setNumberOfAcceptedRows(acceptedRows);
    if (acceptedRows > totalSlots - 1 || totalSlots < 0) {
      setDisableDecreaseButton(true);
    } else {
      setDisableAddButton(false);
      setDisableDecreaseButton(false);
    }
    setLoading(false);
  }, [rows, totalSlots]);

  /**
   * Async function used to update the total number of slots for specific committee
   * @param newSlots - the number of slots
   */
  async function updateTotalSlotsNumber(newSlots) {
    await api
      .patch(`/committees/${committeeIdField}`, {
        _id: committeeIdField,
        conference: committee,
        year: year,
        slots: newSlots,
        members: rows,
      })
      .then((res) => {
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Async function to load the data for specific committee.
   */
  async function loadCommitteeData() {
    await api
      .get("/committees", {
        params: { conference: committee, year: year },
      })
      .then((res) => {
        if (res.data.length === 0) {
          setLoadingError(true);
        } else {
          const data = res.data[0].members;
          setCommitteeIdField(res.data[0]._id);
          setTotalSlots(res.data[0].slots);
          setRows(data);
          setLoading(false);
          setLoadingError(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingError(true);
        setLoading(false);
      });
  }

  /**
   * Async function to update the data for specific committee.
   * @param {*} newData - the new list of members
   */
  async function updateCommitteeMembers(newData) {
    await api
      .patch(`/committees/${committeeIdField}`, {
        _id: committeeIdField,
        conference: committee,
        year: year,
        slots: totalSlots,
        members: newData,
      })
      .then((res) => {

      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Function which checks the validation of all input fields and if passed, calls the patch function, to update the list of members with the new one.
   */
  function handleAddRow() {
    if (email === "" && country === "" && affiliation === "") {
      setErrorMessage("");
      setErrorMessage(
        "Email, country, affiliation and status fields are mandatory"
      );
    }
    if (!emailRegex.test(email) || email === "") {
      setErrorMessage("");
      setErrorMessage(
        "Invalid email! Please check if you are entering the correct email!"
      );
      return;
    }
    if (!countryRegex.test(country) || country === "") {
      setErrorMessage("");
      setErrorMessage(
        "Cannot process the name for the country. Please include only letters, spaces or dashes! "
      );
      return;
    }
    if (affiliation === "") {
      setErrorMessage("");
      setErrorMessage("Please provide an affiliation in the affiliation field");
      return;
    }
    if (status === "") {
      setErrorMessage("");
      setErrorMessage("Invalid status, please select one of the options");
    }
    if (status === "ACCEPTED" && numberOfAcceptedRows === totalSlots) {
      setErrorMessage("");
      setErrorMessage(
        "Slots threshold will be passed, please choose different status for the new committee member."
      );
    }
    if (email === "" || country === "" || affiliation === "" || status === "") {
      setErrorMessage("");
      setErrorMessage(
        "Email, country, affiliation and status fields are mandatory, please add values for them."
      );
    } else {
      setErrorMessage("");
      const newMember = {
        _id: uuid(),
        status: status,
        first_name: firstName,
        last_name: lastName,
        email: email,
        country: country,
        affiliation: affiliation,
      };

      const updatedRows = [...rows, newMember];


      setRows(updatedRows);
      updateCommitteeMembers(updatedRows);
      setFirstName("");
      setLastName("");
      setAffiliation("");
      setEmail("");
      setStatus("PENDING")
      setCountry("");
    }
  }

  /**
   * Function which deletes the row with the specified id
   * @param {*} id - the id of the member that needs to be deleted
   */

  function handleDeleteRow(id) {
    let newRows = rows.slice();
    newRows = newRows.filter((row) => row._id !== id);
    setRows(newRows);
    updateCommitteeMembers(newRows);
  }

  /**
   * Function which performs validation and if passed calls the patch function, to update the list of members.
   * @param {*} newRow
   */
  function handleReplaceRow(newRow, oldRow) {
    let updateHasIncorrectValue = false;
    let copyPreviousRows = rows.slice();
    let foundIndex = copyPreviousRows.findIndex((x) => x._id === newRow._id);
    if (!countryRegex.test(newRow.country) || newRow.country === "") {
      setErrorMessage("Invalid value for country. This is a required field");
      updateHasIncorrectValue = true;
    }
    if (newRow.affiliation === "") {
      updateHasIncorrectValue = true;
      setErrorMessage("The affiliation field cannot be empty");
    }
    if (newRow.status === "") {
      updateHasIncorrectValue = true;
      setErrorMessage("The status is a required field");
    }
    if (!emailRegex.test(newRow.email) || newRow.email === "") {
      updateHasIncorrectValue = true;
      setErrorMessage("Invalid value for email. This is a required field");
    }
    if (newRow.status === "ACCEPTED" && numberOfAcceptedRows === totalSlots) {
      updateHasIncorrectValue = true;
      setErrorMessage(
        "Slots threshold will be passed, please choose different status for the new committee member."
      );
    }
    if (!updateHasIncorrectValue) {
      setErrorMessage("");
      copyPreviousRows[foundIndex] = newRow;
      updateCommitteeMembers(copyPreviousRows);
    }

    // Check if member changed status from PENDING to REJECTED
    if (oldRow.status === "PENDING" && newRow.status === "REJECTED") {
      for (let member of copyPreviousRows) {
        if (member.status === "RESERVED" && member._id !== newRow._id) {
          member.status = "PENDING";
          break;
        }
      }
    }
    setRows(copyPreviousRows);
    loadCommitteeData();
  }

  /**
   * Function invoked during Data Grid row change.
   * @param {*} editedDataRow - the new member data
   * @param {*} oldRow - the old member data
   */
  function handleEditRow(editedDataRow, oldRow) {
    const updatedRow = { ...editedDataRow };
    handleReplaceRow(updatedRow, oldRow);
    return updatedRow;
  }

  /**
   * Function to increase the total number of slots.
   */
  function handleIncreaseTotalSlots() {
    const newSlots = totalSlots + 1;
    setTotalSlots(newSlots);
    updateTotalSlotsNumber(newSlots);
  }

  /**
   * Function to decrease the total number of slots.
   */
  function handleDecreaseTotalSlots() {
    const newSlots = totalSlots - 1;
    setTotalSlots(newSlots);
    updateTotalSlotsNumber(newSlots);
  }

   /**
   * Function which produces a text file with the members who were accepted..
   */
   function downloadFile() {
    api
      .get("/exports/committee", {
        params: { conference: committee, year: year },
      })
      .then((res) => {
        const content = res.data.join("\n");
        const file = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(file);
        let a = document.createElement("a");
        a.href = url;
        a.download = `Committee_members_${committee}_${year}.txt`;
        document.body.appendChild(a);
        a.click();
      })
      .catch(err => {
        console.error(err);
      });
  }

  /**
   * Function used to exclude some options from the Data Grid Toolbar.
   */
  function MyToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <NavBarProgramChairS2 />
      {/* Display loading state while the data is being fetched */}
      {loading && <Typography variant="h2">Loading...</Typography>}
      {/* Display error page in case something went wrong*/}
      {loadingError && (
        <>
          <WarningPage
            buttonExplanationText={"Create committee selection"}
            message={`Currently no committees are created for ${year}.`}
            linkForBackupPage="/chair/mainpage/"
          ></WarningPage>
        </>
      )}
      {!loading && !loadingError && (
        <>
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
          <div
            style={{
              height: 500,
              width: "90%",
              margin: "1rem",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignContent: "flex-end",  justifyContent: "space-between", }}>
            <Stack direction={"row"} spacing={2}>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignContent: "flex-end" }}
              >
                {numberOfAcceptedRows}/{totalSlots} slots open
              </Typography>
              <ButtonGroup
                disableElevation
                variant="contained"
                aria-label="Disabled elevation buttons"
                sx={{ marginLeft: "1rem" }}
              >
                <IconButton
                  disabled={disableAddButton}
                  onClick={handleIncreaseTotalSlots}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  disabled={disableDecreaseButton}
                  onClick={handleDecreaseTotalSlots}
                >
                  <RemoveIcon />
                </IconButton>
              </ButtonGroup>
              </Stack>
              <Stack direction={"row"} spacing={2}>
                <Button
                  variant="contained"
                  size="small"
                  color="warning"
                  onClick={downloadFile}
                  endIcon={<DownloadIcon />}
                >
                  Export Table
                </Button>
                </Stack>
            </Box>

            <Box sx={{ display: "flex", alignContent: "center" }}>
              {/* Display alert window in case something occured while editing the data, e.g. invalid input */}
              {errorMessage !== "" && (
                <AlertWindow
                  size={"small"}
                  severity={"error"}
                  message={errorMessage}
                  rows={rows}
                />
              )}
            </Box>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 15]}
              slots={{ toolbar: MyToolbar }}
              editMode="row"
              getRowId={(row) => row._id}
              columnVisibilityModel={{
                _id: false,
              }}
              processRowUpdate={(newRow, oldRow) =>
                handleEditRow(newRow, oldRow)
              }
              onProcessRowUpdateError={err =>
                console.error(err)
              }
            />
            {/* Elements used to add a new member to the committee */}
            <Box sx={{ margin: "20px 40px" }}>
              <Typography variant="h6" sx={{ margin: "1rem" }}>
                Add a new member
              </Typography>
              <Stack
                spacing={2}
                direction={"row"}
                sx={{ marginBottom: "20px" }}
              >
                <TextField
                  variant="outlined"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                ></TextField>
                <TextField
                  variant="outlined"
                  label="Last Name"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                ></TextField>
                <TextField
                  variant="outlined"
                  label="Email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                ></TextField>
                <TextField
                  variant="outlined"
                  label="Country"
                  onChange={(e) => setCountry(e.target.value)}
                  value={country}
                  required
                ></TextField>
                <TextField
                  variant="outlined"
                  label="Affiliation"
                  onChange={(e) => setAffiliation(e.target.value)}
                  value={affiliation}
                  required
                ></TextField>
                <Box margin={"1rem"}>
                  <FormControl>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      labelId="status-label"
                      label="Status"
                      sx={{ width: "160px" }}
                    >
                      <MenuItem value={"ACCEPTED"}>Accepted</MenuItem>
                      <MenuItem value={"PENDING"}>Pending</MenuItem>
                      <MenuItem value={"REJECTED"}>Rejected</MenuItem>
                      <MenuItem value={"RESERVED"}>Reserved</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Stack
                  spacing={1}
                  direction={"row-reverse"}
                  sx={{
                    margin: "1rem",
                  }}
                >
                  <Button
                    size="medium"
                    variant="contained"
                    onClick={handleAddRow}
                    endIcon={<AddIcon />}
                  >
                    Add member
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </div>
        </>
      )}
    </>
  );
}
