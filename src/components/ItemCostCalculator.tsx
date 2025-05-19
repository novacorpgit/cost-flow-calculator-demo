import React, { useEffect, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
import Handsontable from 'handsontable';
// Import the AlterAction enum to fix the TypeScript error
import { CellChange } from 'handsontable/common';
import 'handsontable/dist/handsontable.full.min.css';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Filter, Plus, MoveDown, Download, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Register all Handsontable modules
registerAllModules();

const initialData = [
  ['H1', '', '', 'MCB 6kA, 3Pole, Curve2, AC QF18*', '', '', '', ''],
  ['H1-2', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 3P 2A C2 AC QF18', 'QFD38202', '', '24.5', '=F2*G2'],
  ['H1-3', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 3P 4A C2 AC QF18', 'QFD38204', '', '24.5', '=F3*G3'],
  ['H1-4', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 3P 6A C2 AC QF18', 'QFD38206', '', '24.5', '=F4*G4'],
  ['H1-5', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 3P 10A C2 AC QF18', 'QFD38210', '', '24.5', '=F5*G5'],
  ['H1-6', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 3P 16A C2 AC QF18', 'QFD38216', '', '24.5', '=F6*G6'],
  ['H1-ACC-1', '', '', 'SHUNT TRIP & AUXILIARY CONTACT- CHECK PRICE', 'SFM-G09', '', '', '=F7*G7'],
  ['H1-ACC-2', '', '', 'MCB S/T ST1 TO SUIT LHS SFM CB', 'SFM-G10', '', '', '=F8*G8'],
  ['H1-ACC-3', '', '', 'SFM AUX SWITCH (3A AC/ 2A DC)', 'SFM-G15', '', '', '=F9*G9'],
  ['H2', '', '', 'MCB 6kA, 1Pole, Curve1, AC QF18*', '', '', '', ''],
  ['H2-1', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 1P 4A C1 AC QF18', 'QFD18104', '', '18.75', '=F11*G11'],
  ['H2-2', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 1P 6A C1 AC QF18', 'QFD18106', '', '18.75', '=F12*G12'],
  ['H2-3', 'HEINEMANN', 'Electrical Wholesalers', 'MCB 6kA 1P 10A C1 AC QF18', 'QFD18110', '', '18.75', '=F13*G13'],
  ['H2-ACC-1', '', '', 'SHUNT TRIP & AUXILIARY CONTACT- CHECK PRICE', 'SFM-G09', '', '', '=F14*G14'],
  ['H2-ACC-2', '', '', 'MCB S/T ST1 TO SUIT LHS SFM CB', 'SFM-G10', '', '', '=F15*G15'],
  ['H2-ACC-3', '', '', 'SFM AUX SWITCH (3A AC/ 2A DC)', 'SFM-G15', '', '', '=F16*G16'],
];

const columnHeaders = ['Cat_ID', 'Manufacturer', 'Supplier', 'Item Description', 'Item Number', 'Qty', 'Unit cost $', 'Total Cost'];

// Define filter condition types for the dropdown menu
const filterConditions = [
  { name: 'None', value: null },
  { name: 'Contains', value: 'contains' },
  { name: 'Equals', value: 'eq' },
  { name: 'Begins with', value: 'begins_with' },
  { name: 'Ends with', value: 'ends_with' },
  { name: 'Greater than', value: 'gt' },
  { name: 'Greater than or equal', value: 'gte' },
  { name: 'Less than', value: 'lt' },
  { name: 'Less than or equal', value: 'lte' },
  { name: 'Is empty', value: 'empty' },
  { name: 'Is not empty', value: 'not_empty' }
];

const ItemCostCalculator = () => {
  const hotRef = useRef<HTMLDivElement>(null);
  const hotInstance = useRef<Handsontable | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [activeFilters, setActiveFilters] = useState<{
    column: number;
    condition: string;
    value: string;
  }[]>([]);
  
  useEffect(() => {
    if (!hotRef.current) return;
    
    // Initialize HyperFormula
    const hyperformulaInstance = HyperFormula.buildEmpty({
      licenseKey: 'internal-use-in-handsontable',
    });
    
    // Initialize Handsontable with HyperFormula
    hotInstance.current = new Handsontable(hotRef.current, {
      data: initialData,
      colHeaders: columnHeaders,
      rowHeaders: true,
      height: 'auto',
      width: '100%',
      licenseKey: 'non-commercial-and-evaluation',
      minSpareRows: 1,
      contextMenu: true,
      manualColumnMove: true,
      manualRowMove: true,
      manualColumnResize: true,
      filters: true,
      dropdownMenu: [
        'filter_by_condition',
        'filter_by_value',
        'filter_action_bar'
      ],
      formulas: {
        engine: hyperformulaInstance,
        sheetName: 'Sheet1'
      },
      columns: [
        { type: 'text' },
        { type: 'text' },
        { type: 'text' },
        { type: 'text' },
        { type: 'text' },
        { type: 'numeric', numericFormat: { pattern: '0,0.00' } },
        { type: 'numeric', numericFormat: { pattern: '$0,0.00' } },
        { 
          type: 'numeric', 
          numericFormat: { pattern: '$0,0.00' },
          readOnly: true,
          className: 'htRight htMiddle bg-gray-100'
        }
      ],
      cells: function(row, col) {
        if (col === 7) { // Total Cost column
          return { className: 'bg-green-50' };
        }
        // Add header styling
        if ((row === 0 && col >= 0) || (row === 9 && col >= 0)) {
          return { 
            className: row === 0 ? 'bg-yellow-100 font-bold' : 'bg-cyan-100 font-bold',
            readOnly: true
          };
        }
      },
      afterChange: (changes) => {
        if (changes) {
          hotInstance.current?.render();
        }
      },
      // Add search plugin configuration
      search: true,
      // Event handler after applying filters
      afterFilter: (conditionsStack) => {
        console.log('Filters applied:', conditionsStack);
        // Convert the filters to our format to display in the UI
        const newActiveFilters = conditionsStack.map(condition => ({
          column: condition.column,
          condition: condition.conditions[0]?.name || '',
          value: condition.conditions[0]?.args ? condition.conditions[0].args[0] : ''
        }));
        setActiveFilters(newActiveFilters);
      }
    });

    return () => {
      if (hotInstance.current) {
        hotInstance.current.destroy();
      }
    };
  }, []);

  // Modified search functionality
  useEffect(() => {
    if (hotInstance.current && searchQuery) {
      // Get the search plugin from the Handsontable instance
      const searchPlugin = hotInstance.current.getPlugin('search');
      
      if (searchPlugin) {
        // Clear previous search results
        hotInstance.current.render();
        
        // Perform the search
        const queryResult = searchPlugin.query(searchQuery);
        
        // Highlight the search results
        const foundCells = queryResult.length;
        
        if (foundCells > 0) {
          // Optional: Add some visual indication that cells were found
          console.log(`Found ${foundCells} cells matching "${searchQuery}"`);
        } else {
          console.log(`No cells found matching "${searchQuery}"`);
        }
      }
    }
  }, [searchQuery]);

  // Filter functionality
  useEffect(() => {
    if (hotInstance.current && Object.keys(filterValues).length > 0) {
      const filtersPlugin = hotInstance.current.getPlugin('filters');
      
      if (filtersPlugin) {
        // Clear existing conditions first
        filtersPlugin.clearConditions();
        
        // Apply new filters
        Object.entries(filterValues).forEach(([colIndex, value]) => {
          if (value) {
            filtersPlugin.addCondition(parseInt(colIndex), 'contains', [value]);
          }
        });
        
        // Apply the filters
        filtersPlugin.filter();
      }
    }
  }, [filterValues]);

  const exportToCSV = () => {
    if (!hotInstance.current) return;
    
    const exportPlugin = hotInstance.current.getPlugin('exportFile');
    // @ts-ignore - exportFile method exists but TypeScript doesn't recognize it
    exportPlugin.downloadFile('csv', {
      bom: false,
      columnHeaders: true,
      exportHiddenColumns: false,
      exportHiddenRows: false,
      mimeType: 'text/csv',
      filename: 'item-cost-calculator_[YYYY]-[MM]-[DD]'
    });
    
    toast({
      title: "Export successful",
      description: "Data has been exported to CSV",
    });
  };

  const addNewRow = () => {
    if (!hotInstance.current) return;
    hotInstance.current.alter('insert_row_below', hotInstance.current.countRows() - 1);
    toast({
      title: "Row added",
      description: "A new row has been added to the table",
    });
  };

  // Fixed the addNewColumn function to use the correct type for alter method
  const addNewColumn = () => {
    if (!hotInstance.current) return;
    
    try {
      // Get current number of columns
      const currentColCount = hotInstance.current.countCols();
      
      // Use the correct method to insert a column
      // The string 'insert_col' is not a valid enum value
      hotInstance.current.alter('insert_col_right', currentColCount - 1);
      
      // Set header for the new column
      hotInstance.current.setDataAtCell(0, currentColCount, `Custom Column ${currentColCount - 7}`);
      
      toast({
        title: "Column added",
        description: "A new column has been added to the table",
      });
    } catch (error) {
      console.error("Error adding column:", error);
      toast({
        title: "Error",
        description: "Could not add a new column. This may be due to data structure limitations.",
        variant: "destructive"
      });
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    
    if (!showFilters && hotInstance.current) {
      const filtersPlugin = hotInstance.current.getPlugin('filters');
      if (filtersPlugin) {
        filtersPlugin.clearConditions();
        filtersPlugin.filter();
      }
      setFilterValues({});
      setActiveFilters([]);
    }
  };

  const handleFilterChange = (colIndex: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [colIndex]: value
    }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setActiveFilters([]);
    if (hotInstance.current) {
      const filtersPlugin = hotInstance.current.getPlugin('filters');
      if (filtersPlugin) {
        filtersPlugin.clearConditions();
        filtersPlugin.filter();
      }
    }
  };

  // Apply custom filter with condition type
  const applyCustomFilter = (column: number, condition: string, value: string) => {
    if (!hotInstance.current) return;
    
    const filtersPlugin = hotInstance.current.getPlugin('filters');
    if (filtersPlugin) {
      // Clear existing conditions for this column
      filtersPlugin.removeConditions(column);
      
      if (condition && condition !== 'empty' && condition !== 'not_empty') {
        // Add the new condition with the specified value
        filtersPlugin.addCondition(column, condition, [value]);
      } else if (condition === 'empty' || condition === 'not_empty') {
        // These conditions don't need a value
        filtersPlugin.addCondition(column, condition, []);
      }
      
      // Apply the filters
      filtersPlugin.filter();
      
      toast({
        title: "Filter applied",
        description: `Filtering column ${columnHeaders[column]} with condition: ${condition}`,
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-4 mb-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table..."
            className="w-full sm:w-60"
          />
          <div className="flex gap-2">
            <Button 
              onClick={toggleFilters} 
              variant="outline" 
              size="icon" 
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={addNewRow} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={addNewColumn} variant="outline" size="icon">
              <MoveDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Column Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
          
          {/* Enhanced filter UI with condition dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columnHeaders.map((header, index) => (
              <div key={index} className="relative flex flex-col">
                <label className="text-sm mb-1 font-medium">{header}</label>
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full text-xs justify-start truncate">
                        {activeFilters.find(f => f.column === index)?.condition 
                          ? filterConditions.find(c => c.value === activeFilters.find(f => f.column === index)?.condition)?.name 
                          : 'Select condition'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="start">
                      <div className="flex flex-col gap-1 p-1 max-h-48 overflow-y-auto">
                        {filterConditions.map((condition) => (
                          <Button
                            key={condition.value || 'none'}
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs"
                            onClick={() => {
                              if (!condition.value) {
                                // Clear this column's filter
                                const filtersPlugin = hotInstance.current?.getPlugin('filters');
                                if (filtersPlugin) {
                                  filtersPlugin.removeConditions(index);
                                  filtersPlugin.filter();
                                }
                              } else if (condition.value === 'empty' || condition.value === 'not_empty') {
                                // These don't need a value
                                applyCustomFilter(index, condition.value, '');
                              } else {
                                // For other conditions, we need to prompt for a value
                                const value = prompt(`Enter value for "${condition.name}" filter:`);
                                if (value !== null) {
                                  applyCustomFilter(index, condition.value, value);
                                }
                              }
                            }}
                          >
                            {condition.name}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Show active filter value if exists */}
                {activeFilters.find(f => f.column === index && f.condition !== 'empty' && f.condition !== 'not_empty' && f.value) && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    <span className="truncate">
                      Value: {activeFilters.find(f => f.column === index)?.value}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        const filtersPlugin = hotInstance.current?.getPlugin('filters');
                        if (filtersPlugin) {
                          filtersPlugin.removeConditions(index);
                          filtersPlugin.filter();
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div ref={hotRef} className="handsontable-container"></div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Instructions:</strong> Enter quantities in the "Qty" column to automatically calculate the total cost.
          Use the table controls to filter, add rows/columns, and export data.
        </p>
        <p className="mt-2">
          <strong>Tips:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Right-click on any cell to access additional options including cut, copy, insert rows/columns and more.</li>
          <li>Click the filter button and choose filter conditions for precise data filtering.</li>
          <li>Click on column headers to access built-in column filters and sorting options.</li>
          <li>You can also drag and drop columns to reorder them.</li>
        </ul>
      </div>
    </div>
  );
};

export default ItemCostCalculator;
