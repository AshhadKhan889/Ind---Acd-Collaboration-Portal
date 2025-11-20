import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      textAlign="center"
    >
      <Typography variant="h3" gutterBottom>
        🚫 Unauthorized Access
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        You don’t have permission to view this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/home-page")}
      >
        Go Back Home
      </Button>
    </Box>
  );
};

export default Unauthorized;
