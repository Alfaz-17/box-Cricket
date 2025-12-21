import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { formatBookingDate, convertTo12Hour, formatTime } from './formatDate';

// Brand color scheme matching logo (Olive Green & Lime Yellow)
const COLORS = {
  primary: [77, 99, 46],        // Olive Green - HSL(82 39% 30%)
  secondary: [139, 156, 54],    // Lime Yellow - HSL(69 69% 38%)
  accent: [180, 199, 110],      // Bright Lime - HSL(70 56% 64%)
  success: [46, 204, 113],      // Success Green
  text: [33, 37, 41],           // Almost Black - Better contrast
  textLight: [108, 117, 125],   // Medium Gray for secondary text
  lightBg: [248, 249, 250],     // Very Light Gray
  white: [255, 255, 255],
  darkGray: [52, 73, 94]
};

/**
 * Export bookings to Excel with professional formatting
 * @param {Array} bookings - Array of booking objects
 * @param {String} boxName - Name of the cricket box
 */
export const exportToExcel = (bookings, boxName = 'Cricket Box') => {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare header data
  const headerData = [
    [`${boxName} - Booking Records`],
    [`Generated on: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`],
    [], // Empty row for spacing
  ];
  
  // Prepare table headers
  const tableHeaders = [
    'Booking ID', 'Sr.', 'Date', 'Customer Name', 'Contact', 'Quarter/Space', 
    'Start Time', 'End Time', 'Duration', 'Amount (Rs.)', 
    'Payment', 'Status', 'Booked On'
  ];
  
  // Prepare data rows
  const dataRows = bookings.map((booking, index) => [
    String(booking._id).substring(0, 8).toUpperCase(), // Booking ID (first 8 chars)
    index + 1,
    formatBookingDate(booking.date),
    booking.user,
    booking.contactNumber,
    booking.quarterName || 'Main Box',
    convertTo12Hour(booking.startTime),
    formatTime(booking.endTime),
    `${booking.duration} hrs`,
    booking.amountPaid,
    booking.isOffline ? 'Offline' : 'Online',
    booking.status.toUpperCase(),
    new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
  ]);
  
  // Calculate summary - ONLY ONLINE REVENUE
  const onlineBookings = bookings.filter(b => !b.isOffline);
  const totalRevenue = onlineBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const onlineCount = onlineBookings.length;
  const offlineCount = bookings.filter(b => b.isOffline).length;
  
  // Prepare summary data
  const summaryData = [
    [], // Empty row
    ['SUMMARY REPORT'],
    [],
    ['Total Bookings:', totalBookings],
    ['Confirmed:', confirmedBookings],
    ['Completed:', completedBookings],
    ['Cancelled:', cancelledBookings],
    [],
    ['PAYMENT BREAKDOWN'],
    [],
    ['Online Bookings:', onlineCount],
    ['Offline Bookings:', offlineCount],
    [],
    ['TOTAL ONLINE REVENUE:', `Rs.${totalRevenue}`],
    ['Note:', 'Only online payment revenue is tracked']
  ];
  
  // Combine all data
  const allData = [
    ...headerData,
    tableHeaders,
    ...dataRows,
    ...summaryData
  ];
  
  // Create worksheet from array of arrays
  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },  // Booking ID
    { wch: 5 },   // Sr.
    { wch: 15 },  // Date
    { wch: 20 },  // Customer Name
    { wch: 15 },  // Contact
    { wch: 15 },  // Quarter/Space
    { wch: 12 },  // Start Time
    { wch: 12 },  // End Time
    { wch: 10 },  // Duration
    { wch: 12 },  // Amount
    { wch: 10 },  // Payment
    { wch: 12 },  // Status
    { wch: 20 }   // Booked On
  ];
  
  // Merge cells for title
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Title row (13 columns now)
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Generated date row
  ];
  
  // Apply styles (note: XLSX doesn't support all styles in free version, but we set what we can)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Style header row (row 4, index 3)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "2980B9" } }, // Professional blue
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${boxName.replace(/\s+/g, '_')}_Bookings_${timestamp}.xlsx`;
  
  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export bookings to PDF with professional formatting and logo
 * @param {Array} bookings - Array of booking objects
 * @param {String} boxName - Name of the cricket box
 */
export const exportToPDF = (bookings, boxName = 'Cricket Box') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Professional header with logo
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo image
  const logoImg = new Image();
  logoImg.src = '/logo.png';
  try {
    doc.addImage(logoImg, 'PNG', 10, 3, 35, 35);
  } catch (e) {
    // Fallback to text if image fails
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('BMB', 15, 18);
  }
  
  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text('BOOKING RECORDS', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(boxName, pageWidth / 2, 28, { align: 'center' });
  
  // Generation date
  doc.setFontSize(8);
  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
  doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 35, { align: 'center' });
  
  // Reset colors
  doc.setTextColor(...COLORS.text);
  
  let yPos = 48;
  const lineHeight = 7;
  const leftMargin = 10;
  const rightMargin = pageWidth - 10;
  
  // Table header with professional styling
  doc.setFillColor(...COLORS.secondary);
  doc.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('ID', leftMargin + 2, yPos);
  doc.text('#', leftMargin + 12, yPos);
  doc.text('Date', leftMargin + 18, yPos);
  doc.text('Customer', leftMargin + 40, yPos);
  doc.text('Phone', leftMargin + 70, yPos);
  doc.text('Space', leftMargin + 95, yPos);
  doc.text('Time', leftMargin + 120, yPos);
  doc.text('Amt', leftMargin + 155, yPos);
  doc.text('Status', leftMargin + 175, yPos);
  
  doc.setTextColor(...COLORS.text);
  yPos += 8;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  bookings.forEach((booking, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
      
      // Repeat header
      doc.setFillColor(...COLORS.secondary);
      doc.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.white);
      doc.text('ID', leftMargin + 2, yPos);
      doc.text('#', leftMargin + 12, yPos);
      doc.text('Date', leftMargin + 18, yPos);
      doc.text('Customer', leftMargin + 40, yPos);
      doc.text('Phone', leftMargin + 70, yPos);
      doc.text('Space', leftMargin + 95, yPos);
      doc.text('Time', leftMargin + 120, yPos);
      doc.text('Amt', leftMargin + 155, yPos);
      doc.text('Status', leftMargin + 175, yPos);
      doc.setTextColor(...COLORS.text);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
    }
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.lightBg);
      doc.rect(leftMargin, yPos - 5, rightMargin - leftMargin, lineHeight, 'F');
    }
    
    // Row data
    const bookingId = String(booking._id).substring(0, 6).toUpperCase();
    doc.text(bookingId, leftMargin + 2, yPos);
    doc.text(String(index + 1), leftMargin + 12, yPos);
    doc.text(formatBookingDate(booking.date).substring(0, 10), leftMargin + 18, yPos);
    doc.text(booking.user.substring(0, 15), leftMargin + 40, yPos);
    doc.text(booking.contactNumber, leftMargin + 70, yPos);
    doc.text((booking.quarterName || 'Main').substring(0, 10), leftMargin + 95, yPos);
    doc.text(`${convertTo12Hour(booking.startTime)}-${formatTime(booking.endTime)}`.substring(0, 15), leftMargin + 120, yPos);
    doc.text(`Rs.${booking.amountPaid}`, leftMargin + 155, yPos);
    
    // Status with color
    if (booking.status === 'confirmed') {
      doc.setTextColor(...COLORS.accent);
    } else if (booking.status === 'completed') {
      doc.setTextColor(...COLORS.primary);
    } else if (booking.status === 'cancelled') {
      doc.setTextColor(231, 76, 60);
    }
    doc.text(booking.status.toUpperCase().substring(0, 10), leftMargin + 175, yPos);
    doc.setTextColor(...COLORS.text);
    
    yPos += lineHeight;
  });
  
  // Summary section
  yPos += 10;
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 50, 'F');
  
  doc.setFillColor(...COLORS.white);
  doc.rect(leftMargin + 2, yPos - 3, rightMargin - leftMargin - 4, 46, 'F');
  
  yPos += 5;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('SUMMARY REPORT', leftMargin + 5, yPos);
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  // Calculate summary - ONLY ONLINE REVENUE
  const onlineBookings = bookings.filter(b => !b.isOffline);
  const totalRevenue = onlineBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const onlineCount = onlineBookings.length;
  const offlineCount = bookings.filter(b => b.isOffline).length;
  
  // Left column
  doc.text(`Total Bookings:`, leftMargin + 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalBookings}`, leftMargin + 45, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  
  doc.text(`Confirmed:`, leftMargin + 5, yPos);
  doc.text(`${confirmedBookings}`, leftMargin + 45, yPos);
  yPos += 6;
  
  doc.text(`Completed:`, leftMargin + 5, yPos);
  doc.text(`${completedBookings}`, leftMargin + 45, yPos);
  yPos += 6;
  
  doc.text(`Cancelled:`, leftMargin + 5, yPos);
  doc.text(`${cancelledBookings}`, leftMargin + 45, yPos);
  
  // Right column
  yPos -= 18;
  const midPoint = pageWidth / 2 + 20;
  
  doc.text(`Online Bookings:`, midPoint, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${onlineCount}`, midPoint + 40, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  
  doc.text(`Offline Bookings:`, midPoint, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${offlineCount}`, midPoint + 40, yPos);
  yPos += 10;
  
  // Total revenue
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text(`TOTAL ONLINE REVENUE: Rs.${totalRevenue}`, pageWidth / 2, yPos, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  
  // Note
  yPos += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(127, 140, 141);
  doc.text('Note: Only online payment revenue is tracked', pageWidth / 2, yPos, { align: 'center' });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(149, 165, 166);
    doc.text(
      `Page ${i} of ${pageCount} | ${boxName}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${boxName.replace(/\s+/g, '_')}_Bookings_${timestamp}.pdf`;
  
  doc.save(filename);
};
