import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import MDBox from "@/components/MDBox";
import MDInput from "@/components/MDInput";
import MDPagination from "@/components/MDPagination";

import DataTableHeadCell from "@/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "./DataTableBodyCell";
import * as MuiIcons from "@mui/icons-material";


function DataTable({ canSearch, table, pagination, noEndBorder, headerActions, searchActions, onSearchChange
}) {
  const columns = useMemo(() => table.columns, [table.columns]);
  const data = useMemo(() => table.rows, [table.rows]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: (row, columnId, filterValue) => {
      const normalizedFilter = String(filterValue ?? "").trim().toLowerCase();
      if (!normalizedFilter) return true;

      const value = row.getValue(columnId);
      if (value === undefined || value === null) return false;

      if (typeof value === "boolean") {
        const boolLabel = value ? "autorizado" : "no autorizado";
        return boolLabel.includes(normalizedFilter);
      }

      return String(value).toLowerCase().includes(normalizedFilter);
    },
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });


  const getPageNumbers = () => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const current = pagination.page + 1;
    const pages = [];

    if (totalPages <= 5){
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

    // Siempre mostrar la primera
    pages.push(1);

    //   en la primera
    if (current === 1) {
      pages.push("...");
    }

    // en la segunda
    else if (current === 2) {
      pages.push(2);
      if (totalPages > 2) pages.push("...");
    }

    // en la última
    else if (current === totalPages) {
      pages.push("...");
    }

    //  en la penúltima
    else if (current === totalPages - 1) {
      pages.push("...");
      pages.push(totalPages - 1);
    }
    // Caso intermedio real
    else {
      pages.push("...");
      pages.push(current);
      pages.push("...");
    }

    // Siempre mostrar la última (si no es la misma que 1)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const KeyboardArrowRight = MuiIcons.KeyboardArrowRight;
  const KeyboardArrowLeft = MuiIcons.KeyboardArrowLeft;

  return (
    <TableContainer sx={{ boxShadow: "none", width: 1150, maxHeight: "580px"}}>
      
      <MDBox display="flex" justifyContent="space-between" p={3}>
        <MDBox>
          {headerActions && (
            <MDBox display="flex" justifyContent="flex-end" mb={1}>
              {headerActions}
            </MDBox>
          )}
          
        </MDBox>
        <MDBox display="flex" alignItems="center" gap={1}>
          {searchActions}
          {canSearch && (
            <MDInput
              placeholder="Buscar"
              size="small"
              value={globalFilter ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setGlobalFilter(value);
                if (onSearchChange) {
                  onSearchChange(value);
                }
              }} />
          )}
        </MDBox>
      </MDBox>

      <Table>
        <MDBox component="thead">
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <DataTableHeadCell
                  key={header.id}
                  sorted={
                    header.column.getIsSorted()
                      ? header.column.getIsSorted() === "desc" ? "desc"
                        : "asc" : false}
                  align={header.column.columnDef.align || "center"}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext()
                    )}
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>

        <TableBody>
          {tableInstance.getRowModel().rows.map((row, index) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <DataTableBodyCell
                  key={cell.id}
                  noBorder={
                    noEndBorder &&
                    tableInstance.getRowModel().rows.length - 1 === index
                  }
                  align={cell.column.columnDef.align || "center"}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext()
                  )}
                </DataTableBodyCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINACIÓN */}
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
      >
        {pagination && (
          <MDPagination variant="gradient" color="success">
            <MDPagination
              item
              disabled={pagination.page === 0}
              onClick={() =>
                pagination.onPageChange(pagination.page - 1)
              }
            >
              <KeyboardArrowLeft />
            </MDPagination>

            {getPageNumbers().map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <MDPagination key={index} item disabled>
                    ...
                  </MDPagination>
                );
              }

              return (
                <MDPagination
                  key={index}
                  item
                  active={pagination.page === pageNumber - 1}
                  onClick={() =>
                    pagination.onPageChange(pageNumber - 1)
                  }
                >
                  {pageNumber}
                </MDPagination>
              );
            })}

            <MDPagination
              item
              disabled={
                pagination.page >=
                Math.ceil(
                  pagination.total / pagination.pageSize
                ) - 1
              }
              onClick={() =>
                pagination.onPageChange(pagination.page + 1)
              }
            >
              <KeyboardArrowRight />
            </MDPagination>
          </MDPagination>
        )}
      </MDBox>
    </TableContainer>
  );
}

DataTable.propTypes = {
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.object.isRequired,
  pagination: PropTypes.object,
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  searchActions: PropTypes.node,
  onSearchChange: PropTypes.func,
};

export default DataTable;