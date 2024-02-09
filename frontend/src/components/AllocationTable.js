import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export default function AllocationTable({ schedule, committees }) {
    const body = []
    committees.forEach(element => {
        // calculate the allocated and filled slots
        let allocated = 0;
        let filled = 0;
        schedule.forEach(session => {
            if (session.type !== 'CONFERENCE') {
                return;
            }
            if (session.conference === element) {
                allocated += session.duration / 30;
                session.presentations.forEach(presentation => {
                    filled += presentation.duration / 30;
                })
            }
        })

        //make the table body
        body.push(
            <TableRow key={`row ${element}`}>
                <TableCell align="center" key={`${element} name`}>{element}</TableCell>
                <TableCell align="center" key={`${element} filled/allocated`}>{`${filled} / ${allocated}`}</TableCell>
            </TableRow>
        )
    });

    return (
        <TableContainer component={Paper}>
            {body.length > 0 ?
                <Table>
                    <TableHead>
                        <TableRow key='header'>
                            <TableCell align="center">Commitee</TableCell>
                            <TableCell align="center">Filled / Allocated slots</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {body}
                    </TableBody>
                </Table>
                :
                <Typography variant="h4" align="center">No committees!</Typography>
            }
        </TableContainer>
    );
}