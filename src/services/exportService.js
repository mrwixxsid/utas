import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const exportAsPDF = async (elementId, fileName, title) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  const header = input.querySelector('.print-header');
  if (header) header.style.display = 'block';

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  if (header) header.style.display = 'none';

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;
  
  let newImgWidth = pdfWidth - 20; 
  let newImgHeight = newImgWidth / ratio;
  if (newImgHeight > pdfHeight - 30) {
      newImgHeight = pdfHeight - 30; 
      newImgWidth = newImgHeight * ratio;
  }

  const x = (pdfWidth - newImgWidth) / 2;
  const y = 15; 

  pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);

  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    const footerText = `Page ${i} of ${pageCount} | Generated on: ${new Date().toLocaleDateString()}`;
    pdf.text(footerText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
  }

  pdf.save(`${fileName}.pdf`);
};


const exportAsImage = async (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }
  
  const header = input.querySelector('.print-header');
  if (header) header.style.display = 'block';

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight
  });

  if (header) header.style.display = 'none';

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const ExportService = {
  exportAsPDF,
  exportAsImage,
};