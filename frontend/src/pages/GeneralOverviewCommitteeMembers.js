import NavBarSteeringChair from "../components/Navbars/NavBarSteeringChair";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import AlertWindow from "../components/AlertWindow";
import Sidebar from "../components/Sidebar";
import useAxiosProtected from "../hooks/useAxiosProtected";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
//2.4 & 2.9 from the Figma design.
/**
 * @author Kris Michaylov & Daniel Mocanu
 */
export default function GeneralOverview() {
  const api = useAxiosProtected();
  const { year } = useParams();
  const columns = [
    {
      field: "_id",
      headerName: "ID",
      width: 100,
      editable: false,
    },
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: ["ACCEPTED", "PENDING", "REJECTED", "RESERVED"],
      width: 150,
      editable: false,
    },
    {
      field: "first_name",
      headerName: "First Name",
      width: 150,
      editable: true,
    },
    { field: "last_name", headerName: "Last Name", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 150, editable: true },
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
  ];
  const [rows, setRows] = useState([]);
  const [tableFilter, setTableFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailRegex = new RegExp(
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  );

  const countryRegex = new RegExp(/^[a-zA-Z\s-]*$/);

  const cachedLoadCommitteeData = useCallback(loadCommitteeData, [api, year]) // remove wanrnigs
  // Used to load the data on the first page render
  useEffect(() => {
    cachedLoadCommitteeData();
  }, [cachedLoadCommitteeData]);

  /**
   * Async function to load the data for specific committee.
   */
  async function loadCommitteeData() {
    await api
      .get("/committees", {
        params: { year: year },
      })
      .then((res) => {
        const allData = res.data;
        // Data which will be sent to the datagrid
        const data = [];
        for (let element of allData) {
          for (let item of element.members) {
            item["conference_id"] = element._id;
            data.push(item);
          }
        }
        setRows(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingError(true);
        setLoading(false);
      });
  }

  // Change this to use new endpoint
  /**
   * Async function which update a single member from a committee.
   * @param {*} updatedMember - the new member data
   * @param {*} conferenceIdField  - the id of the conference (committee)
   * @param {*} memberIdField  - the id of the member
   */
  async function updateCommitteeMembers(
    updatedMember,
    conferenceIdField,
    memberIdField
  ) {
    await api
      .patch(`/committees/${conferenceIdField}/${memberIdField}`, {
        _id: memberIdField,
        first_name: updatedMember["first_name"],
        last_name: updatedMember["last_name"],
        email: updatedMember["email"],
        affiliation: updatedMember["affiliation"],
        country: updatedMember["country"],
        status: updatedMember["status"],
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Function which performs validation and if passed calls the patch function, to update the list of members.
   * @param {*} newRow
   */
  function handleReplaceRow(newRow) {
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
    if (!updateHasIncorrectValue) {
      setErrorMessage("");
      copyPreviousRows[foundIndex] = newRow;
      updateCommitteeMembers(newRow, newRow.conference_id, newRow._id);
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
    handleReplaceRow(updatedRow);
    return updatedRow;
  }

  /**
   * Function used to set custom field for the duplicate checking
   * @param {*} sidebarFilter - the custom filter.
   */
  function handleSetFilterFromSidebar(sidebarFilter) {
    setTableFilter(sidebarFilter);
  }

  /**
   * Function used to exclude some options from the Data Grid Toolbar.
   */
  function MyToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        {/* <GridToolbarFilterButton /> */}
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <NavBarSteeringChair />
      {/* Display loading state while the data is being fetched */}
      {loading && <Typography variant="h2">Loading...</Typography>}
      {/* Display error page in case something went wrong*/}
      {loadingError && (
        <>
          <Typography variant="h2">
            Oops something went wrong. Please try again.
          </Typography>
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
            <Typography variant="h3">General Overview</Typography>
          </Box>
          <div style={{ height: 500, width: "100%" }}>
            <Box sx={{ display: "flex", alignContent: "center" }}>
              {/* Display alert window in case something occurred while editing the data, e.g. invalid input */}
              {errorMessage !== "" && (
                <AlertWindow
                  size={"small"}
                  severity={"error"}
                  message={errorMessage}
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
              filterModel={{ items: tableFilter }}
              onProcessRowUpdateError={(error) =>
                console.error(error)
              }
            />
            <Box sx={{ display: "flex", margin: "20px" }}>
              <Sidebar
                warningFilter={handleSetFilterFromSidebar}
                year={year}
                rows={rows}
              />
            </Box>
          </div>
        </>
      )}
    </>
  );
}
