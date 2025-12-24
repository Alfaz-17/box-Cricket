import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  FileDown, 
  FileSpreadsheet,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Trash2,
  X,
  ArrowUpDown,
  BookOpen
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import api from '../../utils/api'
import { formatBookingDate, formatTime, convertTo12Hour } from '../../utils/formatDate'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { exportToExcel, exportToPDF } from '../../utils/exportBookings'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu'


const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [quarterFilter, setQuarterFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [boxName, setBoxName] = useState('Cricket Box')
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/booking/owner-bookings')
      const data = response.data
      setBookings(data)
      if (data.length > 0 && data[0].box) {
        setBoxName(data[0].box.name)
      }
    } catch (error) {
      toast.error('Failed to fetch bookings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async id => {
    const ownerCode = prompt('Enter Owner Code to confirm cancellation:')
    if (!ownerCode) {
      toast.error('Owner code is required')
      return
    }

    if (!confirm('Cancel this booking? Slot will be freed.')) return

    try {
      await api.post(`/booking/cancel/${id}`, { ownerCode })
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel')
    }
  }

  const uniqueQuarters = useMemo(() => {
    const quarters = new Set(bookings.map(b => b.quarterName).filter(Boolean))
    return Array.from(quarters)
  }, [bookings])

  const filteredData = useMemo(() => {
    return bookings.filter(booking => {
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'upcoming' && booking.status === 'confirmed') ||
        (statusFilter === 'archive' && booking.status === 'completed') ||
        (statusFilter === 'cancelled' && booking.status === 'cancelled')
      
      const matchesQuarter = quarterFilter === 'all' || booking.quarterName === quarterFilter
      
      const matchesDate = !dateFilter ||
        new Date(booking.date).toDateString() === dateFilter.toDateString()

      return matchesStatus && matchesQuarter && matchesDate
    })
  }, [bookings, statusFilter, quarterFilter, dateFilter])

  const columns = useMemo(() => [
    {
      accessorKey: 'user',
      header: ({ column }) => (
        <button className="flex items-center gap-2 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-wider" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Athlete <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">{row.original.user}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{row.original.contactNumber}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'quarterName',
      header: 'Box Space',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen size={12} className="text-primary/60" />
          {row.original.quarterName || 'Main Box'}
        </div>
      )
    },
    {
      accessorKey: 'date',
      header: 'Schedule',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Calendar size={12} className="text-primary" />
            {formatBookingDate(row.original.date)}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <Clock size={12} className="text-primary" />
            {convertTo12Hour(row.original.startTime)} - {formatTime(row.original.endTime)}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'amountPaid',
      header: 'Collection',
      cell: ({ row }) => (
        <div className="font-bold text-foreground text-sm">
          ₹{row.original.amountPaid}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <div className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
            status === 'confirmed' ? "bg-green-500/10 border-green-500/20 text-green-500" :
            status === 'completed' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
            "bg-red-500/10 border-red-500/20 text-red-500"
          )}>
            {status}
          </div>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Administrative Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={`https://wa.me/91${row.original.contactNumber}?text=Hi ${row.original.user}, regarding your booking on ${formatBookingDate(row.original.date)}...`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle size={14} className="text-green-500" />
                <span>Contact Athlete</span>
              </a>
            </DropdownMenuItem>
            {row.original.status === 'confirmed' && (
              <DropdownMenuItem 
                onClick={() => cancelBooking(row.original._id)}
                className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 size={14} className="mr-2" />
                <span>Cancel Ledger Entry</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [bookings])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToExcel(filteredData, boxName)
      toast.success('Excel file downloaded!')
    } catch (error) {
      toast.error('Failed to export Excel')
      console.error(error)
    }
  }

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast.error('No bookings to export')
      return
    }
    try {
      exportToPDF(filteredData, boxName)
      toast.success('PDF file downloaded!')
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BookOpen className="text-primary w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Box <span className="text-primary">Bookings</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Management, scheduling and fiscal oversight
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-11 gap-2 border-border bg-card hover:bg-muted/50 font-bold uppercase tracking-wider text-[10px]"
            disabled={filteredData.length === 0}
          >
            <FileSpreadsheet size={16} className="text-green-500" />
            Export XLS
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-11 gap-2 border-border bg-card hover:bg-muted/50 font-bold uppercase tracking-wider text-[10px]"
            disabled={filteredData.length === 0}
          >
            <FileDown size={16} className="text-red-500" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by athlete or box..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-12 h-11 border-border bg-muted/5"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-11 border-border bg-muted/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {uniqueQuarters.length > 0 && (
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger className="w-[140px] h-11 border-border bg-muted/5">
                  <SelectValue placeholder="Box" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boxes</SelectItem>
                  {uniqueQuarters.map(q => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
              <DatePicker
                selected={dateFilter}
                onChange={date => setDateFilter(date)}
                placeholderText="Target Date"
                className="h-11 pl-10 pr-10 bg-muted/5 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-[160px]"
                dateFormat="MMM d, yyyy"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter(null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Search size={40} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No entries found for this period</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Displaying {table.getRowModel().rows.length} of {filteredData.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs font-bold text-foreground mx-2">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBookings
