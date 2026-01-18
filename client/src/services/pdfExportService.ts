import jsPDF from 'jspdf';

export const generatePDF = (analysisData: any) => {
    const doc = new jsPDF();
    let yPos = 20; // Starting Y position
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;

    // Function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
        }
    };

    // Add logo/header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('MedAnalyze AI Triage Report', margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${analysisData.id}`, margin, yPos);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin + 80, yPos);
    yPos += 10;

    // Add line separator
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, 190, yPos);
    yPos += 15;

    // Patient Information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PATIENT INFORMATION', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Date of Analysis: ${new Date(analysisData.date).toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Symptoms
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('SYMPTOMS REPORTED', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    const symptomsLines = doc.splitTextToSize(analysisData.symptoms, maxWidth);
    doc.text(symptomsLines, margin, yPos);
    yPos += (symptomsLines.length * 7) + 15;

    // Primary Diagnosis
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PRIMARY DIAGNOSIS', margin, yPos);
    yPos += 10;

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    const diagnosis = analysisData.report.diagnoses[0]?.disease || 'Unknown';
    const diagnosisLines = doc.splitTextToSize(diagnosis, maxWidth);
    doc.text(diagnosisLines, margin, yPos);
    yPos += (diagnosisLines.length * 8);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Confidence: ${analysisData.report.diagnoses[0]?.confidence || 0}%`, margin, yPos);
    yPos += 20;

    // Alternative Diagnoses
    if (analysisData.report.diagnoses.length > 1) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('ALTERNATIVE DIAGNOSES', margin, yPos);
        yPos += 10;

        doc.setFontSize(11);
        analysisData.report.diagnoses.slice(1, 3).forEach((d: any, i: number) => {
            doc.text(`${i + 1}. ${d.disease} (${d.confidence}% confidence)`, margin, yPos);
            yPos += 7;
        });
        yPos += 10;
    }

    // Triage Level
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('TRIAGE LEVEL', margin, yPos);
    yPos += 10;

    // Color box based on urgency
    const urgencyColor = analysisData.report.triage.urgency === 'RED' ? [220, 38, 38] :
        analysisData.report.triage.urgency === 'YELLOW' ? [234, 179, 8] :
            [34, 197, 94];

    doc.setFillColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
    doc.roundedRect(margin, yPos, 30, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(analysisData.report.triage.urgency, margin + 7, yPos + 6.5);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    const messageLines = doc.splitTextToSize(analysisData.report.triage.message, maxWidth - 40);
    doc.text(messageLines, margin + 40, yPos + 6);
    yPos += (messageLines.length * 7) + 20;

    // What to Do
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('✓ WHAT TO DO NOW', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    analysisData.report.triage.whatToDoNow.forEach((item: string, index: number) => {
        checkPageBreak(7);
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 7;
    });
    yPos += 10;

    // What to Avoid
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text('✗ WHAT TO AVOID', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    analysisData.report.triage.whatToAvoid.forEach((item: string, index: number) => {
        checkPageBreak(7);
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 7;
    });
    yPos += 15;

    // Treatment Recommendations
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('TREATMENT & MEDICATION', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    analysisData.report.treatment.forEach((item: string, index: number) => {
        checkPageBreak(7);
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 7;
    });
    yPos += 15;

    // Specialist Recommendation
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('SPECIALIST RECOMMENDATION', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(analysisData.report.specialist, margin, yPos);
    yPos += 15;

    // Medical Explanation
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('MEDICAL EXPLANATION', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const explanationLines = doc.splitTextToSize(analysisData.report.medicalExplanation, maxWidth);
    doc.text(explanationLines, margin, yPos);
    yPos += (explanationLines.length * 7) + 15;

    // Simple Explanation
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('SIMPLE EXPLANATION', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const simpleLines = doc.splitTextToSize(analysisData.report.simpleExplanation, maxWidth);
    doc.text(simpleLines, margin, yPos);
    yPos += (simpleLines.length * 7) + 15;

    // Footer on every page
    const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 10);
            doc.text('AI-generated report for informational purposes only • Not medical advice', margin, pageHeight - 5);
        }
    };

    addFooter();

    // Save PDF
    doc.save(`medanalyze-report-${analysisData.id}.pdf`);
};