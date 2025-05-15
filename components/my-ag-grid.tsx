'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { GridReadyEvent, ModuleRegistry, ColDef, GridApi, ICellRendererParams, ClientSideRowModelModule, provideGlobalGridOptions, RowApiModule, RowSelectionModule, TextFilterModule, NumberFilterModule } from 'ag-grid-community'
// import 'ag-grid-community/styles/ag-grid.css'
// import 'ag-grid-community/styles/ag-theme-alpine.css'

// provideGlobalGridOptions({ theme: 'ag-theme-alpine', })
ModuleRegistry.registerModules([ClientSideRowModelModule, RowSelectionModule, TextFilterModule, NumberFilterModule])

interface RowData{
    id: number,
    name: string,
    age: number,
    city: string,
    [key: string]: any
}

const MyAgGridTable = () => {
    const gridRef = useRef<AgGridReact<RowData>>(null)
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { headerName: 'ID', field: 'id', filter: true },
        { headerName: 'Nombre', field: 'name', filter: true },
        { headerName: 'Edad', field: 'age', filter: 'agNumberColumnFilter' },
        { headerName: 'Ciudad', field: 'city', filter: 'agTextColumnFilter'
        },
        { headerName: 'Acciones', 
            cellRenderer: (params: ICellRendererParams<RowData>) => (
            <button onClick={() => alert(`Button clicked for ID: ${params.data?.id}`)}>
                Click me
            </button>
        ),
        sortable: false,
        filter: false, 
        }
    ])
    const [rowData, setRowData] = useState<RowData[]>([
        { id: 1, name: 'Juan', age: 25, city: 'Durango' },
        { id: 2, name: 'Maria', age: 30, city: 'Gómez Palacio' },
        { id: 3, name: 'Pedro', age: 35, city: 'Lerdo' },
        { id: 4, name: 'Ana', age: 28, city: 'Durango' },
    ])
    
    const [gridApi, setGridApi] = useState<GridApi | null>(null)
    const modules: Module[] = useMemo(() => [ClientSideRowModelModule], [])
    const onGridReady = useCallback((params: GridReadyEvent<RowData>) =>{
        setGridApi(params.api)
    }, [])

    return (
        <div className='w-[900px]'>
            <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
                <AgGridReact<RowData>
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    rowSelection={'single'}
                    onGridReady={onGridReady}
                    modules={modules}
                />
            </div>
        </div>
    )
}

export default MyAgGridTable