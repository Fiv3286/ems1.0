import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";
import { useContainerDimensions } from "../hooks/useContainerDimentions";

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
  

export default function UploadedPapersModal({ open, handleClose, papers, handleAddPresentations }){
    const [selectedItems, setSelectedItems] = useState([])
    const modalRef = useRef()
    const { width } = useContainerDimensions(modalRef)

    const columns = [
        {
            field: "title",
            headerName: "Title",
            width: 0.4 * width,
            editable: false,
            sortable: false,
        },
        {
            field: "authors",
            headerName: "Authors",
            width: 0.4 * width,
            editable: false,
            sortable: false,
        },
    ]

    function handleCancel(){
        setSelectedItems([])
        handleClose()
    }

    return (
        <div ref={modalRef}>
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Box sx={style} >
                <Typography id="modal-modal-title" variant="h4" align="center">
                    Adding presentations
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <DataGrid
                        rows={papers}
                        columns={columns}
                        checkboxSelection
                        autoHeight
                        disableColumnMenu
                        disableColumnFilter
                        onRowSelectionModelChange={setSelectedItems}
                        rowSelectionModel={selectedItems}
                        initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 8,
                              },
                            },
                          }}
                          pageSizeOptions={[8]}
                    />
                </Box>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    marginTop={2}
                    spacing={2}
                >
                    <Button variant="contained" color="error" onClick={handleCancel}> Cancel</Button>
                    <Button variant="contained" color="success" onClick={() => {
                        handleAddPresentations(selectedItems)
                    }}><AddIcon/> Add presentations</Button>
                </Stack>
            </Box>
        </Modal>
        </div>
    );
}