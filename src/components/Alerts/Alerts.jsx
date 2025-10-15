import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import React from "react";

const tableData = [
  {
    id: 1,
    accountNumber: "1234567890",
    accountHolderName: "Farid Bouaziz",
    dateOfLastMovement: "2023-10-15",
    dateOfRecentMovement: "2024-01-15",
    typeOfMovement: "Withdrawal",
    durationOfInactivity: "92 days",
    operatorAndAgency: "Operator A, Agency X",
  },
  {
    id: 2,
    accountNumber: "9876543210",
    accountHolderName: "Jamal El Tahiri",
    dateOfLastMovement: "2023-08-20",
    dateOfRecentMovement: "2024-02-20",
    typeOfMovement: "Transfer",
    durationOfInactivity: "184 days",
    operatorAndAgency: "Operator B, Agency Y",
  },
  {
    id: 3,
    accountNumber: "4567890123",
    accountHolderName: "Samia El Rhazi",
    dateOfLastMovement: "2024-02-05",
    dateOfRecentMovement: "2024-03-05",
    typeOfMovement: "Purchase",
    durationOfInactivity: "29 days",
    operatorAndAgency: "Operator C, Agency Z",
  },
  {
    id: 4,
    accountNumber: "7890123456",
    accountHolderName: "Younes Rochdi",
    dateOfLastMovement: "2023-07-10",
    dateOfRecentMovement: "2024-04-10",
    typeOfMovement: "Withdrawal",
    durationOfInactivity: "274 days",
    operatorAndAgency: "Operator D, Agency W",
  },
  {
    id: 5,
    accountNumber: "2345678901",
    accountHolderName: "Houda Bennani",
    dateOfLastMovement: "2023-05-15",
    dateOfRecentMovement: "2024-05-15",
    typeOfMovement: "Transfer",
    durationOfInactivity: "365 days",
    operatorAndAgency: "Operator E, Agency V",
  },
  {
    id: 6,
    accountNumber: "6789012345",
    accountHolderName: "Houda Benzakour",
    dateOfLastMovement: "2024-04-20",
    dateOfRecentMovement: "2024-06-20",
    typeOfMovement: "Purchase",
    durationOfInactivity: "61 days",
    operatorAndAgency: "Operator F, Agency U",
  },
  {
    id: 7,
    accountNumber: "3456789012",
    accountHolderName: "Khadija El Hassani",
    dateOfLastMovement: "2023-11-25",
    dateOfRecentMovement: "2024-07-25",
    typeOfMovement: "Withdrawal",
    durationOfInactivity: "212 days",
    operatorAndAgency: "Operator G, Agency T",
  },
  {
    id: 8,
    accountNumber: "8901234567",
    accountHolderName: "Issam El Ouahabi",
    dateOfLastMovement: "2024-01-30",
    dateOfRecentMovement: "2024-08-30",
    typeOfMovement: "Transfer",
    durationOfInactivity: "212 days",
    operatorAndAgency: "Operator H, Agency S",
  },
  {
    id: 9,
    accountNumber: "5678901234",
    accountHolderName: "Youssef Chebanni",
    dateOfLastMovement: "2024-08-05",
    dateOfRecentMovement: "2024-09-05",
    typeOfMovement: "Purchase",
    durationOfInactivity: "31 days",
    operatorAndAgency: "Operator I, Agency R",
  },
  {
    id: 10,
    accountNumber: "0123456789",
    accountHolderName: "Lucas Brooks",
    dateOfLastMovement: "2023-12-10",
    dateOfRecentMovement: "2024-10-10",
    typeOfMovement: "Withdrawal",
    durationOfInactivity: "305 days",
    operatorAndAgency: "Operator J, Agency Q",
  },
];

const filterOptions = [
  {
    label: "Transaction Type",
    options: ["Withdrawal", "Transfer", "Purchase"],
  },
  { label: "Amount Range", options: ["0-1000", "1000-5000", "5000+"] },
  {
    label: "Date Range",
    options: ["Last 30 days", "Last 90 days", "Last year"],
  },
];

export const AlertsSection = () => {
  // Custom toolbar with export functionality
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport 
          csvOptions={{ 
            fileName: 'alerts-section',
            delimiter: ',',
            utf8WithBom: true
          }}
          printOptions={{ disableToolbarButton: true }}
        />
      </GridToolbarContainer>
    );
  }

  return (
    <Stack spacing={0} sx={{ width: "100%", position: "relative" }}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#111416",
              fontSize: "32px",
              lineHeight: "40px",
            }}
          >
            Fraudulent Activities
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7782",
              fontSize: "14px",
              lineHeight: "21px",
            }}
          >
            Review and manage detected fraudulent transactions.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Autocomplete
          options={[]}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by account number or transaction ID"
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ color: "#6b7782", mr: 1 }} />,
                sx: {
                  backgroundColor: "#f2f2f4",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  height: "48px",
                },
              }}
              sx={{
                "& .MuiInputBase-input": {
                  color: "#6b7782",
                  fontSize: "16px",
                },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {filterOptions.map((filter, index) => (
            <FormControl key={index} size="small">
              <Select
                displayEmpty
                value=""
                sx={{
                  backgroundColor: "#f2f2f4",
                  borderRadius: "16px",
                  height: "32px",
                  minWidth: "120px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    color: "#111416",
                    fontSize: "14px",
                    fontWeight: "500",
                    py: 0.5,
                    px: 2,
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {filter.label}
                </MenuItem>
                {filter.options.map((option, optionIndex) => (
                  <MenuItem key={optionIndex} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 1.5, height: 600 }}>
        <DataGrid
          rows={tableData}
          columns={[
            { field: 'accountNumber', headerName: 'Account Number', width: 135 },
            { field: 'accountHolderName', headerName: 'Account Holder Name', width: 150 },
            { field: 'dateOfLastMovement', headerName: 'Date of Last Movement Before Inactivity', width: 250 },
            { field: 'dateOfRecentMovement', headerName: 'Date of Recent Movement', width: 180 },
            { field: 'typeOfMovement', headerName: 'Type of Movement', width: 127 },
            { field: 'durationOfInactivity', headerName: 'Duration of Inactivity Before Movement', width: 250 },
            { field: 'operatorAndAgency', headerName: 'Operator and Agency Performing the Transaction', width: 280 },
          ]}
          paginationModel={{ page: 0, pageSize: 10 }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: '#e5e8ea',
              fontSize: '14px',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f2f2f4',
              '& .MuiDataGrid-columnHeader': {
                fontWeight: 500,
                color: '#111416',
                fontSize: '14px',
              },
            },
          }}
        />
      </Box>
    </Stack>
  );
};