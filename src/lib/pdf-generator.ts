import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { PlotData } from '../store/map-store';

export async function generatePlotPDF(plot: PlotData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const navy = rgb(0.04, 0.12, 0.25); // #0A1E3F
  const primaryBlue = rgb(0.0, 0.4, 0.8); // #0066CC
  const slateGray = rgb(0.4, 0.45, 0.5);
  const lightBg = rgb(0.96, 0.97, 0.98);
  const borderCol = rgb(0.85, 0.88, 0.92);

  // Top Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: navy,
  });

  page.drawText('DHOLERA SPECIAL INVESTMENT REGION (DSIR)', {
    x: 40,
    y: height - 42,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Statutory Town Planning Scheme 1 — Cadastral Valuation Dossier', {
    x: 40,
    y: height - 62,
    size: 10,
    font: fontRegular,
    color: rgb(0.8, 0.88, 1),
  });

  page.drawText(`Scheme Act: Gujarat Town Planning & Urban Dev. Act, 1976 (Sec 50)`, {
    x: 40,
    y: height - 80,
    size: 8,
    font: fontRegular,
    color: rgb(0.65, 0.75, 0.9),
  });

  // Plot Highlights Card
  let y = height - 130;

  page.drawRectangle({
    x: 40,
    y: y - 75,
    width: width - 80,
    height: 75,
    color: lightBg,
    borderColor: borderCol,
    borderWidth: 1,
  });

  page.drawText(`FINAL PLOT: ${plot.finalPlot}`, {
    x: 60,
    y: y - 28,
    size: 18,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(`Survey No: ${plot.surveyNo} | Village: ${plot.village} | Sector: ${plot.subSector}`, {
    x: 60,
    y: y - 52,
    size: 11,
    font: fontRegular,
    color: navy,
  });

  // QR Code for verification
  try {
    const qrDataUrl = await QRCode.toDataURL(
      `https://dholeramap-vector.vercel.app/?survey=${plot.surveyNo}&fp=${plot.finalPlot}`
    );
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: width - 110,
      y: y - 70,
      width: 60,
      height: 60,
    });
  } catch (err) {
    console.error('QR code error:', err);
  }

  y -= 105;

  // Section: Cadastral Dimensions & Zoning
  page.drawText('1. CADASTRAL & LAND USE SPECIFICATIONS', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: navy,
  });

  y -= 10;
  page.drawLine({
    start: { x: 40, y: y },
    end: { x: width - 40, y: y },
    thickness: 1,
    color: borderCol,
  });

  y -= 25;
  const col1 = 50;
  const col2 = 300;

  page.drawText(`Allotted Plot Area:`, { x: col1, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.areaSqM.toLocaleString()} sq.m (${plot.areaSqYd.toLocaleString()} sq.yd)`, {
    x: col1 + 130,
    y,
    size: 10,
    font: fontBold,
    color: navy,
  });

  page.drawText(`Road Access Corridor:`, { x: col2, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.roadWidthM} Meter Wide TP Road`, {
    x: col2 + 130,
    y,
    size: 10,
    font: fontBold,
    color: navy,
  });

  y -= 22;
  page.drawText(`Designated Zone:`, { x: col1, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.zone} (${plot.zoneCode})`, { x: col1 + 130, y, size: 10, font: fontBold, color: navy });

  page.drawText(`Max Floor Space Index (FSI/FAR):`, { x: col2, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.maxFAR}`, { x: col2 + 160, y, size: 10, font: fontBold, color: navy });

  y -= 22;
  page.drawText(`Max Building Height:`, { x: col1, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.maxHeightM} Meters`, { x: col1 + 130, y, size: 10, font: fontBold, color: navy });

  page.drawText(`Ground Coverage Allowed:`, { x: col2, y, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`${plot.groundCoveragePct}%`, { x: col2 + 160, y, size: 10, font: fontBold, color: navy });

  // Section: Statutory Gujarat Valuation
  y -= 40;
  page.drawText('2. STATUTORY GUJARAT REVENUE VALUATION (JANTRI 2026)', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: navy,
  });

  y -= 10;
  page.drawLine({
    start: { x: 40, y: y },
    end: { x: width - 40, y: y },
    thickness: 1,
    color: borderCol,
  });

  y -= 30;
  page.drawRectangle({
    x: 40,
    y: y - 100,
    width: width - 80,
    height: 110,
    color: lightBg,
    borderColor: borderCol,
    borderWidth: 1,
  });

  page.drawText(`Statutory Jantri Rate:`, { x: 60, y: y - 20, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`INR ${plot.jantriRate.toLocaleString()} per sq.meter`, {
    x: 220,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: navy,
  });

  page.drawText(`Government Plot Value:`, { x: 60, y: y - 42, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`INR ${plot.govtValuation.toLocaleString()} (approx ${(plot.govtValuation / 100000).toFixed(2)} Lakhs)`, {
    x: 220,
    y: y - 42,
    size: 11,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(`Gujarat Stamp Duty (4.9%):`, { x: 60, y: y - 64, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`INR ${plot.stampDuty.toLocaleString()} (Exempt for female allottees)`, {
    x: 220,
    y: y - 64,
    size: 10,
    font: fontRegular,
    color: navy,
  });

  page.drawText(`Registration Fee (1.0%):`, { x: 60, y: y - 86, size: 10, font: fontRegular, color: slateGray });
  page.drawText(`INR ${plot.regFee.toLocaleString()}`, {
    x: 220,
    y: y - 86,
    size: 10,
    font: fontRegular,
    color: navy,
  });

  // Total Revenue Fee Banner
  y -= 140;
  page.drawRectangle({
    x: 40,
    y: y - 25,
    width: width - 80,
    height: 40,
    color: navy,
  });

  page.drawText(`TOTAL STATUTORY GUJARAT REVENUE DUTY:`, {
    x: 60,
    y: y - 12,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`INR ${plot.totalGovtFee.toLocaleString()}`, {
    x: width - 180,
    y: y - 12,
    size: 13,
    font: fontBold,
    color: rgb(0.2, 0.9, 0.4),
  });

  // Footer Disclaimer
  page.drawText(
    'Note: Generated from Gujarat Statutory Town Planning Scheme 1 CAD Geodatabase. Values subject to official Sub-Registrar confirmation.',
    {
      x: 40,
      y: 35,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    }
  );

  page.drawText(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | DholeraMap Vector GIS`, {
    x: 40,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });

  return await pdfDoc.save();
}
