import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a clean, human-readable, Unicode-friendly filename for diagnosis PDF reports
 * e.g. "UrbanFarm_Tomato_Early_Blight_2026-10-07.pdf" or "UrbanFarm_પાનખર_છોડ_ફંગલ_પાંદડાના_ટપકાં_2026-10-07.pdf"
 */
export const generatePdfFileName = (plantName, conditionName, date = new Date()) => {
  const sanitize = (text, fallback, maxLen = 30) => {
    if (!text || typeof text !== 'string') return fallback;
    const cleaned = text
      .trim()
      .replace(/[<>:"/\\|?*()\[\]{}#%&+=~`^$@!;,\.]/gu, ' ')
      .replace(/[^\p{L}\p{M}\p{N}-]+/gu, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, maxLen)
      .replace(/_+$/g, '');
    return cleaned || fallback;
  };

  const cleanPlant = sanitize(plantName, 'Plant', 24);
  const cleanCond = sanitize(conditionName, 'Diagnosis_Report', 32);
  const dateStr = date instanceof Date 
    ? date.toISOString().slice(0, 10) 
    : String(date || '').slice(0, 10) || new Date().toISOString().slice(0, 10);

  return `UrbanFarm_${cleanPlant}_${cleanCond}_${dateStr}.pdf`;
};

/**
 * Generate and download a high-resolution, guaranteed 1-PAGE A4 PDF diagnosis report
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} fileName - File name for download
 * @param {Function} onProgress - Optional callback for loading status
 */
export const downloadDiagnosisPDF = async (element, fileName = 'UrbanFarm-Diagnosis-Report.pdf', onProgress) => {
  if (!element) {
    throw new Error('Report element not found for PDF export.');
  }

  if (onProgress) onProgress(true);

  try {
    // Capture off-screen cleanly using html2canvas onclone without flashing on screen
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 860,
      onclone: (clonedDoc) => {
        const clonedSheet = clonedDoc.querySelector('.dr-dedicated-pdf-sheet') || clonedDoc.querySelector('.dr-report-printable-area');
        if (clonedSheet) {
          clonedSheet.style.position = 'relative';
          clonedSheet.style.left = '0px';
          clonedSheet.style.top = '0px';
          clonedSheet.style.zIndex = '1';
          clonedSheet.style.visibility = 'visible';
          clonedSheet.style.opacity = '1';
          clonedSheet.style.display = 'flex';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // Standard A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const marginX = 6;
    const marginY = 6;
    const usableWidth = pageWidth - (marginX * 2); // 198mm
    const usableHeight = pageHeight - (marginY * 2); // 285mm

    const canvasAspect = canvas.height / canvas.width;

    let finalWidth = usableWidth;
    let finalHeight = usableWidth * canvasAspect;

    // Strict 1-Page Constraint: fit within A4 usable height
    if (finalHeight > usableHeight) {
      finalHeight = usableHeight;
      finalWidth = usableHeight / canvasAspect;
    }

    // Center horizontally & vertically within printable A4 boundary
    const posX = marginX + (usableWidth - finalWidth) / 2;
    const posY = marginY + (usableHeight - finalHeight) / 2;

    // Add exactly ONE page
    pdf.addImage(imgData, 'JPEG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (onProgress) onProgress(false);
  }
};
