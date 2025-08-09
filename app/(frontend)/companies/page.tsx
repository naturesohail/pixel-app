"use client";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress,
  Link as MuiLink,
  TextField,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";

interface User {
  _id: string;
  name: string;
  companyName: string;
  website: string;
  industry: string[];
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/companies?page=${page}&limit=10&search=${query}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage]);

  const handlePageChange = (_event: any, value: number) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1); // reset to page 1 on new search

    // Debounce the fetch
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(1, value);
    }, 500);
  };

  return (
    <FrontendLayout>
      <Header />

      <div className="page-heading about-page-heading" id="top" />

      <Box display="flex" justifyContent="center" pt={6}>
        <Box width="100%" maxWidth="1000px" px={2}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            Company Listings
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by name, company, or industry"
            variant="outlined"
            margin="normal"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={3}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>#</strong></TableCell>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Company</strong></TableCell>
                      <TableCell><strong>Link</strong></TableCell>
                      <TableCell><strong>Industries</strong></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={user._id}>
                        <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.companyName}</TableCell>
                        <TableCell>
                          <MuiLink
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                          >
                            {user.website}
                          </MuiLink>
                        </TableCell>
                        <TableCell>{user.industry}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Footer />
    </FrontendLayout>
  );
}
