import { Drawer, Typography, Box, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useCallback, useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import useAxiosProtected from "../hooks/useAxiosProtected";
import AlertWindow from "./AlertWindow";

/**
 * The sidebar component, mainly used for duplicate check
 * @author Kris Michaylov & Daniel Mocanu
 */

export default function Sidebar({ warningFilter, year, rows, day }) {
  const api = useAxiosProtected();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [warnings, setWarnings] = useState([]);

  const cachedLoadWarnings = useCallback(loadWarnings, [api, year]) // remove wanrnigs
  const cachedLoadWarningsForPresentation = useCallback(loadWarningsForPresentation, [api, year]) // remove wanrnigs
  // Invoke the loadWarnings function on page render.
  useEffect(() => {
    if (day === undefined) {
      // load the warnings for committee members
      cachedLoadWarnings();
    } else if (day !== undefined) {
      // load the warnings for presentation authors
      let copy = day.split("/")
      const date = `${copy[2]}-${copy[1]}-${copy[0]}`
      cachedLoadWarningsForPresentation(date);
    }
  }, [cachedLoadWarnings, cachedLoadWarningsForPresentation, day]);

  /**
   * Load the duplicate data for committee members from the backend.
   */
  async function loadWarnings() {
    await api
      .get("/committees/duplicate", {
        params: { year: year },
      })
      .then((res) => {
        let warningData = [];
        for (let element of res.data) {
          warningData.push(element);
        }
        setWarnings(warningData);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Load the duplicate data for presentation authors from the backend.
   */
  async function loadWarningsForPresentation(date) {
    await api
      .get("/programs/duplicate", {
        params: { year: year, day: date },
      })
      .then((res) => {
        let warningData = [];
        for (let element of res.data) {
          warningData.push(element);
        }
        setWarnings(warningData);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Function used to change to new filter settings for duplicate check.
   * @param  ids - an array of ids for the possible duplicates.
   */
  function handleFilter(ids) {
    warningFilter([
      {
        field: "_id",
        operator: "isAnyOf",
        value: [...ids],
      },
    ]);
  }

  /**
   * Function to visually delete a warning in the sidebar.
   * @param id - the id of the warning to be deleted
   */
  function handleDelete(id) {
    const newWarnings = warnings.filter((warning) => warning._id !== id);
    setWarnings(newWarnings);
    warningFilter([]);
  }
  /**
   * Function to visually delete all warnings.
   */
  function handleDeleteAll() {
    let emptyWarnings = [];
    setWarnings(emptyWarnings);
    warningFilter(emptyWarnings);
  }

  return (
    <>
      <Button
        size="large"
        edge="start"
        aria-label="logo"
        variant="contained"
        color="warning"
        onClick={() => setIsSidebarOpen(true)}
      >
        Warnings
      </Button>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <IconButton size="medium" onClick={() => setIsSidebarOpen(false)}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ p: 2, width: "250px", textAlign: "center" }}>
          <Typography variant="h3" sx={{ textAlign: "center" }}>
            Warnings
          </Typography>
          <Typography
            sx={{ textAlign: "left", marginTop: "1rem", marginBottom: "2rem" }}
          >
            List of warnings:
          </Typography>
          {/* Display this alert in case of no duplicates */}
          {warnings.length === 0 && (
            <AlertWindow
              message={"Currently, there are no warnings!"}
              severity={"info"}
              key={0}
            ></AlertWindow>
          )}
          <ul
            style={{
              listStyle: "none",
              marginLeft: 0,
              paddingLeft: 0,
            }}
          >
            {warnings.length > 0 && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={() => handleDeleteAll()}
              >
                Delete all
              </Button>
            )}
            {/* Go through all the warnings, fetched from the backend */}
            {warnings.map((item, index) => (
              // <div>
              <li
                key={item._id}
                style={{
                  textAlign: "left",
                  border: "1px solid black",
                  borderRadius: "5px",
                  backgroundColor: "#FEE781",
                  margin: "1rem",
                  padding: "0.5rem",
                }}
              >
                <span>
                  {index + 1}. {item.errorMessage}
                </span>
                <Stack
                  sx={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  direction={"row"}
                  spacing={2}
                >
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    onClick={() => handleFilter(item.ids)}
                  >
                    Filter
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </li>
              // </div>
            ))}
          </ul>
        </Box>
      </Drawer>
    </>
  );
}
