import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Edit, Check, X } from 'lucide-react';

export default function DataGrid({ data = [], columns = [], activeTab }) {
  const [gridData, setGridData] = useState(data || []);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [editCell, setEditCell] = useState(null); // { rowId, columnId, value }
  const [editValue, setEditValue] = useState('');

  // Reset selection when data changes
  useEffect(() => {
    setGridData(data || []);
    setSelectedRows(new Set());
    setSelectAll(false);
    setEditCell(null);
  }, [data, activeTab]);

  // Apply sorting when sortConfig changes
  useEffect(() => {
    const safeData = data || [];

    if (sortConfig.key && safeData.length > 0) {
      const sortedData = [...safeData].sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });

      setGridData(sortedData);
    } else {
      setGridData(safeData);
    }
  }, [sortConfig, data]);

  // Handle column sort
  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  // Handle checkbox selection
  const handleRowSelect = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);

    const safeData = data || [];
    setSelectAll(newSelected.size === safeData.length && safeData.length > 0);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const safeData = data || [];
      const allIds = safeData.map(row => row.id || row._id);
      setSelectedRows(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  // Start editing a cell
  const startEditing = (rowId, columnId, value) => {
    setEditCell({ rowId, columnId });
    setEditValue(value);
  };

  // Save edited cell
  const saveEdit = () => {
    if (!editCell) return;

    const { rowId, columnId } = editCell;
    const updatedData = gridData.map(row => {
      if (row.id === rowId) {
        return { ...row, [columnId]: editValue };
      }
      return row;
    });

    setGridData(updatedData);
    setEditCell(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditCell(null);
  };

  // Format cell value based on column type
  const formatCellValue = (value, columnType) => {
    if (value === null || value === undefined) return '';

    switch (columnType) {
      case 'currency':
        return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'number':
        return parseFloat(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value;
    }
  };

  // Render the grid based on the active tab
  const renderGrid = () => {
    if (activeTab === 'visualization') {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500">Select visualization type from the toolbar above</p>
        </div>
      );
    }

    // Handle empty data
    const safeData = gridData || [];
    let safeColumns = columns || [];

    // Generate columns from data if they're not provided but we have data
    if (safeData.length > 0 && safeColumns.length === 0) {
      console.log("DataGrid: No columns provided, generating from data...");
      const firstRow = safeData[0];
      if (firstRow && typeof firstRow === 'object') {
        safeColumns = Object.keys(firstRow).map(key => ({
          id: key,
          name: key,
          type: typeof firstRow[key] === 'number' ? 'number' : 'string'
        }));
        console.log(`DataGrid: Generated ${safeColumns.length} columns from data`);
      }
    }

    console.log(`DataGrid rendering with ${safeData.length} rows and ${safeColumns.length} columns`);

    if (safeData.length === 0 && safeColumns.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500">No data available to display</p>
        </div>
      );
    }

    // If we have columns but no data, create an empty table with headers
    if (safeData.length === 0 && safeColumns.length > 0) {
      return (
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled
                  />
                </th>
                {safeColumns.map(column => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.name}
                  </th>
                ))}
                <th scope="col" className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td colSpan={safeColumns.length + 2} className="px-3 py-4 text-center text-gray-500">
                  No data rows available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              {safeColumns.map(column => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center">
                    {column.name}
                    {sortConfig.key === column.id ? (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      )
                    ) : (
                      <div className="ml-1 w-4" />
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((row, rowIndex) => {
              const rowId = row.id || row._id || `row-${rowIndex}`;
              return (
                <tr
                  key={rowId}
                  className={selectedRows.has(rowId) ? 'bg-blue-50' : ''}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={selectedRows.has(rowId)}
                      onChange={() => handleRowSelect(rowId)}
                    />
                  </td>
                  {safeColumns.map(column => (
                    <td
                      key={`${rowId}-${column.id}`}
                      className="px-3 py-2 whitespace-nowrap"
                      onDoubleClick={() => startEditing(rowId, column.id, row[column.id])}
                    >
                      {editCell && editCell.rowId === rowId && editCell.columnId === column.id ? (
                        <div className="flex items-center">
                          <input
                            type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <div className="flex ml-2">
                            <button
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {formatCellValue(row[column.id], column.type)}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      {renderGrid()}
    </div>
  );
}
