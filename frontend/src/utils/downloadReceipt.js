
import { jsPDF } from 'jspdf';
import api from './api';

/**
 * Downloads a PDF receipt for a given booking ID.
 * Fetches booking details from the backend report API.
 * @param {string} bookingId - The ID of the booking to generate a receipt for.
 */
export const downloadReceipt = async (bookingId) => {
  try {
    const response = await api.get(`/booking/report/${bookingId}`);
    const data = response.data;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Brand colors matching logo with better contrast
    const primaryGreen = [77, 99, 46];      // Olive Green
    const limeYellow = [139, 156, 54];      // Lime Yellow
    const lightBg = [248, 249, 250];        // Very Light Gray
    const white = [255, 255, 255];
    const successGreen = [46, 204, 113];
    const darkText = [33, 37, 41];          // Almost Black - Better contrast
    
    // Professional header with logo
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Add logo image
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    try {
      doc.addImage(logoImg, 'PNG', 10, 5, 35, 35);
    } catch (e) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...white);
      doc.text('BMB', 15, 16);
    }

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('BOOKING RECEIPT', pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.box.name, pageWidth / 2, 26, { align: 'center' });

    // Booking ID
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const bookingIdShort = String(data._id).substring(0, 8).toUpperCase();
    doc.text('ID: ' + bookingIdShort, pageWidth / 2, 36, { align: 'center' });

    // Reset colors
    doc.setTextColor(...darkText);

    let yPos = 55;

    // Details section with professional styling
    doc.setFillColor(...lightBg);
    doc.rect(15, yPos, pageWidth - 30, 85, 'F');

    doc.setFillColor(...white);
    doc.rect(17, yPos + 2, pageWidth - 34, 81, 'F');

    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('BOOKING DETAILS', 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);

    // Left column
    const leftCol = 20;
    const rightCol = pageWidth / 2 + 10;

    // Row 1: Name & Date
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.user || 'Guest', leftCol + 28, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date, rightCol + 28, yPos);
    yPos += 8;

    // Row 2: Quarter & Contact
    doc.setFont('helvetica', 'bold');
    doc.text('Quarter:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.quarterName, leftCol + 28, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Contact:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.contactNumber, rightCol + 28, yPos);
    yPos += 8;

    // Row 3: Start & End Time
    doc.setFont('helvetica', 'bold');
    doc.text('Start Time:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.startTime, leftCol + 28, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('End Time:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.endTime, rightCol + 28, yPos);
    yPos += 8;

    // Row 4: Duration & Payment
    doc.setFont('helvetica', 'bold');
    doc.text('Duration:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.duration + ' hours', leftCol + 28, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');

    // Color code payment status
    if (data.paymentStatus === 'paid') {
      doc.setTextColor(...successGreen);
    } else {
      doc.setTextColor(230, 126, 34);
    }
    doc.text(data.paymentStatus.toUpperCase(), rightCol + 28, yPos);
    doc.setTextColor(...darkText);

    yPos += 15;

    // Amount section with professional styling
    doc.setFillColor(...primaryGreen);
    doc.rect(15, yPos, pageWidth - 30, 22, 'F');

    doc.setFillColor(...white);
    doc.rect(17, yPos + 2, pageWidth - 34, 18, 'F');

    yPos += 13;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    const amountText = 'TOTAL AMOUNT: Rs.' + data.amountPaid;
    doc.text(amountText, pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(...darkText);

    yPos += 20;

    // Footer note
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(127, 140, 141);
    doc.text('Thank you for booking with us!', pageWidth / 2, yPos, { align: 'center' });
    doc.text('Please show this receipt at the venue.', pageWidth / 2, yPos + 5, { align: 'center' });

    // Page footer
    doc.setFontSize(7);
    doc.setTextColor(149, 165, 166);
    doc.text(
      'Generated on ' + new Date().toLocaleString('en-IN'),
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Open in new tab user request
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error('Download failed', error);
  }
};
