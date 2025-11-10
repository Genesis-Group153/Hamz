import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Calendar, MapPin, Clock, User, Ticket } from 'lucide-react';

interface ModernTicketProps {
  bookingReference: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  venue: string;
  attendeeName: string;
  quantity: number;
  totalPrice: number;
  ticketCode: string;
  qrCodeData: string;
  currentTicket: number;
  totalTickets: number;
}

export const ModernTicket: React.FC<ModernTicketProps> = ({
  bookingReference,
  eventTitle,
  eventDate,
  eventTime,
  venue,
  attendeeName,
  quantity,
  totalPrice,
  ticketCode,
  qrCodeData,
  currentTicket,
  totalTickets
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${bookingReference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; padding: 20px; }
            .ticket { 
              width: 850px; 
              height: 280px; 
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              position: relative; 
              margin: 0 auto;
              display: flex;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            .ticket-left { 
              width: 150px; 
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              padding: 20px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .ticket-left::before,
            .ticket-left::after {
              content: '';
              position: absolute;
              left: 0;
              width: 100%;
              height: 20px;
              background: radial-gradient(circle, transparent 5px, #F59E0B 5px);
              background-size: 20px 20px;
            }
            .ticket-left::before { top: 0; }
            .ticket-left::after { bottom: 0; }
            .barcode { width: 100%; height: 120px; background: #1e40af; border-radius: 4px; }
            .price {
              color: #1e40af;
              font-size: 32px;
              font-weight: 900;
              writing-mode: vertical-rl;
              text-orientation: upright;
              letter-spacing: 2px;
            }
            .ticket-no {
              color: #1e40af;
              font-size: 10px;
              font-weight: 700;
              writing-mode: vertical-rl;
              text-orientation: upright;
              letter-spacing: 1px;
            }
            .dash-line {
              width: 2px;
              height: 100%;
              background: repeating-linear-gradient(
                to bottom,
                #1e40af 0px,
                #1e40af 8px,
                transparent 8px,
                transparent 14px
              );
            }
            .ticket-right {
              flex: 1;
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              padding: 30px;
              position: relative;
            }
            .ticket-right::before,
            .ticket-right::after {
              content: '';
              position: absolute;
              right: 0;
              width: 100%;
              height: 20px;
              background: radial-gradient(circle, transparent 5px, #F59E0B 5px);
              background-size: 20px 20px;
            }
            .ticket-right::before { top: 0; }
            .ticket-right::after { bottom: 0; }
            .title { 
              font-size: 24px; 
              font-weight: 900; 
              color: #1e40af; 
              text-align: center;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .subtitle {
              font-size: 14px;
              color: #1e40af;
              text-align: center;
              margin-bottom: 30px;
              font-weight: 600;
              letter-spacing: 1px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 200px;
              gap: 20px;
              align-items: start;
            }
            .info-left { display: flex; flex-direction: column; gap: 8px; }
            .info-item { display: flex; align-items: center; gap: 8px; color: #1e40af; font-size: 12px; }
            .info-label { font-weight: 700; font-size: 10px; }
            .info-value { font-weight: 600; }
            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .qr-code {
              width: 160px;
              height: 160px;
              background: white;
              border-radius: 8px;
              padding: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .decorative-circles {
              position: absolute;
              inset: 0;
              pointer-events: none;
            }
            .circle {
              position: absolute;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.1);
            }
            @media print {
              body { background: white; }
              .ticket { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${ticketRef.current.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${bookingReference}-${currentTicket}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !ticketRef.current) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${bookingReference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; padding: 20px; background: white; }
            .ticket { 
              width: 850px; 
              height: 280px; 
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              position: relative; 
              margin: 0 auto;
              display: flex;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            .ticket-left { 
              width: 150px; 
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              padding: 20px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .barcode { width: 100%; height: 120px; background: #1e40af; border-radius: 4px; }
            .price {
              color: #1e40af;
              font-size: 32px;
              font-weight: 900;
              writing-mode: vertical-rl;
              text-orientation: upright;
              letter-spacing: 2px;
            }
            .ticket-no {
              color: #1e40af;
              font-size: 10px;
              font-weight: 700;
              writing-mode: vertical-rl;
              text-orientation: upright;
              letter-spacing: 1px;
            }
            .dash-line {
              width: 2px;
              height: 100%;
              background: repeating-linear-gradient(
                to bottom,
                #1e40af 0px,
                #1e40af 8px,
                transparent 8px,
                transparent 14px
              );
            }
            .ticket-right {
              flex: 1;
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              padding: 30px;
              position: relative;
            }
            .title { 
              font-size: 24px; 
              font-weight: 900; 
              color: #1e40af; 
              text-align: center;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .subtitle {
              font-size: 14px;
              color: #1e40af;
              text-align: center;
              margin-bottom: 30px;
              font-weight: 600;
              letter-spacing: 1px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 200px;
              gap: 20px;
              align-items: start;
            }
            .info-left { display: flex; flex-direction: column; gap: 8px; }
            .info-item { display: flex; align-items: center; gap: 8px; color: #1e40af; font-size: 12px; }
            .info-label { font-weight: 700; font-size: 10px; }
            .info-value { font-weight: 600; }
            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .qr-code {
              width: 160px;
              height: 160px;
              background: white;
              border-radius: 8px;
              padding: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
          </style>
        </head>
        <body>
          ${ticketRef.current.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleDownload}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PNG
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Ticket */}
      <div ref={ticketRef} className="w-full max-w-4xl mx-auto">
        <div className="ticket-wrapper bg-white p-8 rounded-2xl shadow-2xl">
          <div className="ticket flex w-full h-72 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 relative overflow-hidden rounded-lg">
            {/* Decorative circles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 right-8 w-16 h-16 bg-white/20 rounded-full blur-sm"></div>
              <div className="absolute bottom-8 left-12 w-12 h-12 bg-white/20 rounded-full blur-sm"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/20 rounded-full blur-md"></div>
            </div>

            {/* Left Section - Stub */}
            <div className="ticket-left relative w-40 bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-between p-4">
              {/* Perforation circles on left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>

              {/* Barcode placeholder */}
              <div className="barcode w-full h-32 bg-blue-900 rounded flex items-center justify-center">
                <div className="text-white text-xs font-bold">BARCODE</div>
              </div>

              {/* Price rotated */}
              <div className="price">
                UGX {totalPrice.toLocaleString()}
              </div>

              {/* Ticket number */}
              <div className="ticket-no">
                TICKET NO. {currentTicket.toString().padStart(4, '0')}
              </div>

              {/* Perforation circles on right edge */}
              <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Dashed line separator */}
            <div className="dash-line w-1 bg-blue-900 relative">
              <div className="absolute inset-0 flex flex-col justify-around">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="h-6 border-b-2 border-dashed border-blue-900"></div>
                ))}
              </div>
            </div>

            {/* Right Section - Main Ticket */}
            <div className="ticket-right flex-1 p-8 flex flex-col justify-between relative">
              {/* Perforation circles on right edge */}
              <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>

              {/* Title and Subtitle */}
              <div className="text-center mb-6">
                <div className="title text-blue-900 font-black text-2xl mb-2 tracking-wide">
                  ONLINE TICKET
                </div>
                <div className="subtitle text-blue-900 font-bold text-sm">
                  ENJOY YOUR TIME
                </div>
              </div>

              {/* Info Grid */}
              <div className="flex-1 grid grid-cols-2 gap-8 items-start">
                {/* Left Info */}
                <div className="space-y-3">
                  <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                    <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                    <div>
                      <span className="info-label font-bold">EVENT:</span>{' '}
                      <span className="info-value">{eventTitle}</span>
                    </div>
                  </div>
                  <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                    <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                    <div>
                      <span className="info-label font-bold">DATE:</span>{' '}
                      <span className="info-value">{eventDate}</span>
                    </div>
                  </div>
                  {eventTime && (
                    <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                      <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                      <div>
                        <span className="info-label font-bold">TIME:</span>{' '}
                        <span className="info-value">{eventTime}</span>
                      </div>
                    </div>
                  )}
                  <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                    <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                    <div>
                      <span className="info-label font-bold">VENUE:</span>{' '}
                      <span className="info-value">{venue}</span>
                    </div>
                  </div>
                  <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                    <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                    <div>
                      <span className="info-label font-bold">NAME:</span>{' '}
                      <span className="info-value">{attendeeName}</span>
                    </div>
                  </div>
                  <div className="info-item flex items-center gap-2 text-blue-900 text-xs">
                    <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                    <div>
                      <span className="info-label font-bold">QTY:</span>{' '}
                      <span className="info-value">{quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Right QR Section */}
                <div className="qr-section">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code" 
                    className="qr-code w-40 h-40 object-contain bg-white p-2 rounded-lg shadow-lg"
                  />
                  <div className="text-xs font-bold text-blue-900 mt-2">
                    CODE: {ticketCode.substring(0, 12)}
                  </div>
                </div>
              </div>

              {/* Admit One */}
              <div className="mt-6 border-t-2 border-blue-900 pt-2">
                <div className="text-center text-blue-900">
                  <div className="text-xs font-bold">ADMIT ONE: UGX {totalPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Count */}
      {totalTickets > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Ticket {currentTicket} of {totalTickets}
        </div>
      )}
    </div>
  );
};

