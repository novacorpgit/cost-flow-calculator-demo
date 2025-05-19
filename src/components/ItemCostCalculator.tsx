
import React, { useEffect, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Filter, Plus, MoveDown, Download, X } from "lucide-react";

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

const ItemCostCalculator = () => {
  const hotRef = useRef<HTMLDivElement>(null);
  const hotInstance = useRef<Handsontable | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  
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
    });

    return () => {
      if (hotInstance.current) {
        hotInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (hotInstance.current && searchQuery) {
      const searchQueryLower = searchQuery.toLowerCase();
      hotInstance.current.updateSettings({
        search: {
          queryMethod: (query: string, value: any) => {
            if (value === null || value === undefined) {
              return false;
            }
            return String(value).toLowerCase().indexOf(searchQueryLower) !== -1;
          }
        }
      });

      const searchResult = hotInstance.current.search.query(searchQuery);
      hotInstance.current.render();
    }
  }, [searchQuery]);

  // Filter functionality
  useEffect(() => {
    if (hotInstance.current && Object.keys(filterValues).length > 0) {
      const filters = [];
      
      for (const [colIndex, value] of Object.entries(filterValues)) {
        if (value) {
          filters.push({
            column: parseInt(colIndex),
            conditions: [
              { name: 'contains', args: [value] }
            ]
          });
        }
      }
      
      if (filters.length > 0) {
        // @ts-ignore - Filters method exists but TypeScript doesn't recognize it
        hotInstance.current.getPlugin('filters').addConditions(filters);
        // @ts-ignore
        hotInstance.current.getPlugin('filters').filter();
      } else {
        // @ts-ignore
        hotInstance.current.getPlugin('filters').clearConditions();
        // @ts-ignore
        hotInstance.current.getPlugin('filters').filter();
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

  const addNewColumn = () => {
    if (!hotInstance.current) return;
    const currentColCount = hotInstance.current.countCols();
    hotInstance.current.alter('insert_col_end', 1);
    
    // Add a header for the new column
    hotInstance.current.setDataAtCell(0, currentColCount, `Custom Column ${currentColCount - 7}`);
    
    toast({
      title: "Column added",
      description: "A new column has been added to the table",
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    setFilterValues({});
    
    if (!showFilters && hotInstance.current) {
      // @ts-ignore
      hotInstance.current.getPlugin('filters').clearConditions();
      // @ts-ignore
      hotInstance.current.getPlugin('filters').filter();
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
    if (hotInstance.current) {
      // @ts-ignore
      hotInstance.current.getPlugin('filters').clearConditions();
      // @ts-ignore
      hotInstance.current.getPlugin('filters').filter();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {columnHeaders.map((header, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-sm mb-1">{header}</label>
                <Input
                  value={filterValues[index.toString()] || ''}
                  onChange={(e) => handleFilterChange(index.toString(), e.target.value)}
                  placeholder={`Filter ${header}...`}
                  className="h-8 text-sm"
                />
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
          <strong>Tip:</strong> Right-click on any cell to access additional options including cut, copy, insert rows/columns and more.
        </p>
      </div>
    </div>
  );
};

export default ItemCostCalculator;
