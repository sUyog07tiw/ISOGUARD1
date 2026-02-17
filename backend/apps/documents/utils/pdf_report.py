"""
PDF Report Generator for ISO 27001 Compliance Audit Reports.
Generates professional PDF reports from LLM analysis results.
"""

import io
from datetime import datetime
from typing import List, Dict, Any, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


class ISOAuditReportGenerator:
    """
    Generates professional PDF audit reports for ISO 27001 compliance analysis.
    """
    
    # Color scheme
    PRIMARY_COLOR = colors.HexColor('#B91C1C')  # Red-700
    SECONDARY_COLOR = colors.HexColor('#1F2937')  # Gray-800
    SUCCESS_COLOR = colors.HexColor('#059669')  # Green-600
    WARNING_COLOR = colors.HexColor('#D97706')  # Amber-600
    DANGER_COLOR = colors.HexColor('#DC2626')  # Red-600
    LIGHT_GRAY = colors.HexColor('#F3F4F6')
    BORDER_COLOR = colors.HexColor('#E5E7EB')
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles for the report."""
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.SECONDARY_COLOR,
            spaceAfter=30,
            alignment=TA_CENTER,
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=self.PRIMARY_COLOR,
            spaceBefore=20,
            spaceAfter=10,
            fontName='Helvetica-Bold',
            borderColor=self.PRIMARY_COLOR,
            borderWidth=0,
            borderPadding=5,
        ))
        
        # Checklist header
        self.styles.add(ParagraphStyle(
            name='ChecklistHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=self.SECONDARY_COLOR,
            spaceBefore=15,
            spaceAfter=8,
            fontName='Helvetica-Bold',
        ))
        
        # Body text (custom - renamed to avoid conflict with default BodyText)
        self.styles.add(ParagraphStyle(
            name='ReportBody',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.SECONDARY_COLOR,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            leading=14,
        ))
        
        # Finding item
        self.styles.add(ParagraphStyle(
            name='FindingItem',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.SECONDARY_COLOR,
            leftIndent=15,
            spaceAfter=4,
            leading=12,
        ))
        
        # Gap item (warning)
        self.styles.add(ParagraphStyle(
            name='GapItem',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.DANGER_COLOR,
            leftIndent=15,
            spaceAfter=4,
            leading=12,
        ))
        
        # Recommendation item
        self.styles.add(ParagraphStyle(
            name='RecommendationItem',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.SUCCESS_COLOR,
            leftIndent=15,
            spaceAfter=4,
            leading=12,
        ))
        
        # Score text
        self.styles.add(ParagraphStyle(
            name='ScoreText',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
        ))
    
    def _get_compliance_color(self, status: str) -> colors.Color:
        """Get color based on compliance status."""
        status_colors = {
            'compliant': self.SUCCESS_COLOR,
            'partial': self.WARNING_COLOR,
            'non_compliant': self.DANGER_COLOR,
            'not_applicable': colors.gray,
        }
        return status_colors.get(status, colors.gray)
    
    def _get_score_color(self, score: float) -> colors.Color:
        """Get color based on compliance score."""
        if score >= 0.7:
            return self.SUCCESS_COLOR
        elif score >= 0.4:
            return self.WARNING_COLOR
        else:
            return self.DANGER_COLOR
    
    def _create_score_bar(self, score: float, width: int = 100) -> str:
        """Create a text-based score bar."""
        filled = int(score * 10)
        empty = 10 - filled
        return '█' * filled + '░' * empty
    
    def _header_footer(self, canvas, doc):
        """Add header and footer to each page."""
        canvas.saveState()
        
        # Header
        canvas.setFillColor(self.PRIMARY_COLOR)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(40, A4[1] - 30, "ISOGUARD")
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(self.SECONDARY_COLOR)
        canvas.drawString(40, A4[1] - 42, "ISO 27001:2022 Compliance Audit Report")
        
        # Footer
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.gray)
        canvas.drawString(40, 30, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        canvas.drawRightString(A4[0] - 40, 30, f"Page {doc.page}")
        
        # Line under header
        canvas.setStrokeColor(self.BORDER_COLOR)
        canvas.setLineWidth(0.5)
        canvas.line(40, A4[1] - 50, A4[0] - 40, A4[1] - 50)
        
        # Line above footer
        canvas.line(40, 45, A4[0] - 40, 45)
        
        canvas.restoreState()
    
    def generate_report(
        self,
        analysis_results: List[Dict[str, Any]],
        organization_name: str = "Organization",
        report_title: str = "ISO 27001:2022 Compliance Audit Report"
    ) -> bytes:
        """
        Generate a PDF report from analysis results.
        
        Args:
            analysis_results: List of analysis result dictionaries
            organization_name: Name of the organization
            report_title: Title for the report
            
        Returns:
            PDF file as bytes
        """
        buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=60,
            bottomMargin=60,
        )
        
        story = []
        
        # Title Page
        story.extend(self._create_title_page(organization_name, report_title))
        story.append(PageBreak())
        
        # Executive Summary
        story.extend(self._create_executive_summary(analysis_results))
        story.append(PageBreak())
        
        # Detailed Results for each checklist
        for result in analysis_results:
            story.extend(self._create_checklist_section(result))
            story.append(PageBreak())
        
        # Recommendations Summary
        story.extend(self._create_recommendations_summary(analysis_results))
        
        # Build PDF
        doc.build(story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
    
    def _create_title_page(self, organization_name: str, report_title: str) -> List:
        """Create the title page."""
        elements = []
        
        # Spacer to push content down
        elements.append(Spacer(1, 100))
        
        # Title
        elements.append(Paragraph(report_title, self.styles['ReportTitle']))
        
        # Subtitle
        elements.append(Paragraph(
            f"Prepared for: {organization_name}",
            self.styles['ReportSubtitle']
        ))
        
        elements.append(Spacer(1, 20))
        
        # Date
        elements.append(Paragraph(
            f"Report Date: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['ReportSubtitle']
        ))
        
        elements.append(Spacer(1, 40))
        
        # Info box
        info_data = [
            ['Report Type', 'ISO 27001:2022 Compliance Assessment'],
            ['Standard', 'ISO/IEC 27001:2022'],
            ['Generated By', 'ISOGUARD AI Analysis Engine'],
            ['Report Version', '1.0'],
        ]
        
        info_table = Table(info_data, colWidths=[150, 300])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.SECONDARY_COLOR),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(info_table)
        
        elements.append(Spacer(1, 60))
        
        # Disclaimer
        elements.append(Paragraph(
            "<b>Disclaimer:</b> This report is generated by AI-assisted analysis and should be "
            "reviewed by qualified information security professionals. The findings and recommendations "
            "are based on the documents provided and may not represent a complete assessment of the "
            "organization's information security posture.",
            self.styles['ReportBody']
        ))
        
        return elements
    
    def _create_executive_summary(self, analysis_results: List[Dict]) -> List:
        """Create the executive summary section."""
        elements = []
        
        elements.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.PRIMARY_COLOR))
        elements.append(Spacer(1, 15))
        
        # Calculate overall statistics
        total_checklists = len(analysis_results)
        completed_analyses = [r for r in analysis_results if r.get('status') == 'completed']
        
        if completed_analyses:
            avg_score = sum(r.get('compliance_score', 0) for r in completed_analyses) / len(completed_analyses)
            compliant_count = sum(1 for r in completed_analyses if r.get('compliance_status') == 'compliant')
            partial_count = sum(1 for r in completed_analyses if r.get('compliance_status') == 'partial')
            non_compliant_count = sum(1 for r in completed_analyses if r.get('compliance_status') == 'non_compliant')
        else:
            avg_score = 0
            compliant_count = partial_count = non_compliant_count = 0
        
        # Summary paragraph
        elements.append(Paragraph(
            f"This report presents the results of an ISO 27001:2022 compliance assessment covering "
            f"<b>{total_checklists} Annex A control categories</b>. The assessment was performed using "
            f"AI-powered document analysis to evaluate the organization's information security management "
            f"system (ISMS) against the requirements of ISO/IEC 27001:2022.",
            self.styles['ReportBody']
        ))
        elements.append(Spacer(1, 15))
        
        # Overall score display
        score_color = self._get_score_color(avg_score)
        score_percentage = int(avg_score * 100)
        
        score_data = [
            ['Overall Compliance Score', f'{score_percentage}%'],
            ['Checklists Analyzed', str(total_checklists)],
            ['Compliant', str(compliant_count)],
            ['Partially Compliant', str(partial_count)],
            ['Non-Compliant', str(non_compliant_count)],
        ]
        
        score_table = Table(score_data, colWidths=[200, 100])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.SECONDARY_COLOR),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 20))
        
        # Checklist summary table
        elements.append(Paragraph("Checklist Results Overview", self.styles['ChecklistHeader']))
        
        table_data = [['Checklist', 'Status', 'Score', 'Gaps']]
        
        for result in analysis_results:
            status = result.get('compliance_status', 'N/A')
            if status == 'compliant':
                status_display = '✓ Compliant'
            elif status == 'partial':
                status_display = '◐ Partial'
            elif status == 'non_compliant':
                status_display = '✗ Non-Compliant'
            else:
                status_display = '- N/A'
            
            score = result.get('compliance_score', 0)
            gaps = result.get('gaps', [])
            
            table_data.append([
                result.get('checklist_title', 'Unknown')[:40],
                status_display,
                f'{int(score * 100)}%',
                str(len(gaps))
            ])
        
        summary_table = Table(table_data, colWidths=[250, 100, 60, 50])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.SECONDARY_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.SECONDARY_COLOR),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.LIGHT_GRAY]),
        ]))
        elements.append(summary_table)
        
        return elements
    
    def _create_checklist_section(self, result: Dict) -> List:
        """Create a detailed section for a single checklist."""
        elements = []
        
        checklist_title = result.get('checklist_title', 'Unknown Checklist')
        compliance_status = result.get('compliance_status', 'N/A')
        compliance_score = result.get('compliance_score', 0)
        
        # Section header
        elements.append(Paragraph(checklist_title, self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.PRIMARY_COLOR))
        elements.append(Spacer(1, 10))
        
        # Status and score display
        status_color = self._get_compliance_color(compliance_status)
        score_bar = self._create_score_bar(compliance_score)
        
        status_data = [
            ['Compliance Status', compliance_status.replace('_', ' ').title()],
            ['Compliance Score', f'{int(compliance_score * 100)}%  {score_bar}'],
        ]
        
        status_table = Table(status_data, colWidths=[150, 350])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.SECONDARY_COLOR),
            ('TEXTCOLOR', (1, 0), (1, 0), status_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(status_table)
        elements.append(Spacer(1, 15))
        
        # Summary
        summary = result.get('summary', '')
        if summary:
            elements.append(Paragraph("<b>Summary</b>", self.styles['ReportBody']))
            elements.append(Paragraph(summary, self.styles['ReportBody']))
            elements.append(Spacer(1, 10))
        
        # Control Scores
        control_scores = result.get('control_scores', {})
        if control_scores:
            elements.append(Paragraph("<b>Control Scores</b>", self.styles['ReportBody']))
            
            control_data = [['Control', 'Score', 'Progress']]
            for control, score in control_scores.items():
                score_val = float(score) if isinstance(score, (int, float, str)) else 0
                bar = self._create_score_bar(score_val)
                control_data.append([control, f'{int(score_val * 100)}%', bar])
            
            control_table = Table(control_data, colWidths=[200, 50, 200])
            control_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.SECONDARY_COLOR),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 1), (-1, -1), self.SECONDARY_COLOR),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.LIGHT_GRAY]),
            ]))
            elements.append(control_table)
            elements.append(Spacer(1, 15))
        
        # Findings
        findings = result.get('findings', [])
        if findings:
            elements.append(Paragraph("<b>Key Findings</b>", self.styles['ReportBody']))
            for i, finding in enumerate(findings, 1):
                elements.append(Paragraph(
                    f"<b>{i}.</b> {finding}",
                    self.styles['FindingItem']
                ))
            elements.append(Spacer(1, 10))
        
        # Gaps
        gaps = result.get('gaps', [])
        if gaps:
            elements.append(Paragraph("<b>Identified Gaps</b>", self.styles['ReportBody']))
            for i, gap in enumerate(gaps, 1):
                elements.append(Paragraph(
                    f"<b>⚠ {i}.</b> {gap}",
                    self.styles['GapItem']
                ))
            elements.append(Spacer(1, 10))
        
        # Recommendations
        recommendations = result.get('recommendations', [])
        if recommendations:
            elements.append(Paragraph("<b>Recommendations</b>", self.styles['ReportBody']))
            for i, rec in enumerate(recommendations, 1):
                elements.append(Paragraph(
                    f"<b>→ {i}.</b> {rec}",
                    self.styles['RecommendationItem']
                ))
            elements.append(Spacer(1, 10))
        
        # Comments
        comments = result.get('comments', [])
        if comments:
            elements.append(Paragraph("<b>Auditor Comments</b>", self.styles['ReportBody']))
            for comment in comments:
                elements.append(Paragraph(f"• {comment}", self.styles['FindingItem']))
        
        return elements
    
    def _create_recommendations_summary(self, analysis_results: List[Dict]) -> List:
        """Create a summary of all recommendations."""
        elements = []
        
        elements.append(Paragraph("Consolidated Recommendations", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.PRIMARY_COLOR))
        elements.append(Spacer(1, 15))
        
        elements.append(Paragraph(
            "The following is a consolidated list of recommendations across all analyzed "
            "control categories. These should be prioritized based on risk and business impact.",
            self.styles['ReportBody']
        ))
        elements.append(Spacer(1, 15))
        
        rec_number = 1
        for result in analysis_results:
            checklist_title = result.get('checklist_title', 'Unknown')
            recommendations = result.get('recommendations', [])
            
            if recommendations:
                elements.append(Paragraph(
                    f"<b>{checklist_title}</b>",
                    self.styles['ChecklistHeader']
                ))
                
                for rec in recommendations:
                    elements.append(Paragraph(
                        f"<b>R{rec_number}.</b> {rec}",
                        self.styles['RecommendationItem']
                    ))
                    rec_number += 1
                
                elements.append(Spacer(1, 10))
        
        # Closing statement
        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.BORDER_COLOR))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(
            "<b>Next Steps:</b> Review the findings and recommendations with your information security "
            "team. Develop an action plan to address identified gaps and improve your overall compliance "
            "posture. Consider engaging qualified ISO 27001 auditors for a formal certification assessment.",
            self.styles['ReportBody']
        ))
        
        return elements


def generate_audit_report_pdf(
    analysis_results: List[Dict[str, Any]],
    organization_name: str = "Organization"
) -> bytes:
    """
    Convenience function to generate a PDF audit report.
    
    Args:
        analysis_results: List of analysis result dictionaries
        organization_name: Name of the organization
        
    Returns:
        PDF file as bytes
    """
    generator = ISOAuditReportGenerator()
    return generator.generate_report(analysis_results, organization_name)
