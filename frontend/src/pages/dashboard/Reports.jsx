import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";

export default function Reports() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.get('/analyses/');
      setReports(data.results || data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (report) => {
    if (!report) return;
    
    // Check if this report has completed analysis
    if (report.status !== 'completed') {
      setExportError('Analysis is not completed yet. Please wait for the analysis to finish.');
      return;
    }
    
    try {
      setExporting(true);
      setExportError(null);
      
      const filename = `ISOGUARD_${report.checklist_title?.replace(/\s+/g, '_') || 'Report'}.pdf`;
      
      // If PDF is already stored, download directly
      if (report.pdf_report_url) {
        const link = document.createElement('a');
        link.href = report.pdf_report_url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Otherwise generate via API
      const API_BASE_URL = '/api';
      const endpoint = `/export-report/?checklist_ids=${report.checklist_id}`;
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Handle 404 - no completed analysis
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No completed analysis found for this checklist. Please run Gap Analysis first.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download PDF (Error ${response.status})`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Refresh to get updated pdf_report_url
      fetchReports();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportError(err.message || 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllReports = async () => {
    try {
      setExporting(true);
      setExportError(null);
      
      // Export all completed reports
      const API_BASE_URL = '/api';
      const endpoint = '/export-report/';
      const filename = 'ISOGUARD_Full_Audit_Report.pdf';
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Handle 404 - no completed analysis
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No completed analysis reports available. Please run analysis from Gap Analysis page first.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download PDF (Error ${response.status})`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export all reports:', err);
      setExportError(err.message || 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleViewPDF = async (report) => {
    if (!report) return;
    
    // Check if this report has completed analysis
    if (report.status !== 'completed') {
      setExportError('Analysis is not completed yet. Please wait for the analysis to finish.');
      return;
    }
    
    try {
      setLoadingPdf(true);
      setExportError(null);
      
      // Revoke previous URL if exists
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      
      // If PDF is already stored, use it directly
      if (report.pdf_report_url) {
        // Fetch the stored PDF to create blob URL for iframe
        const response = await fetch(report.pdf_report_url);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setPdfUrl(url);
          setShowPdfViewer(true);
          return;
        }
        // If stored PDF fails, fall through to generate new one
      }
      
      // Generate PDF via API
      const API_BASE_URL = '/api';
      const endpoint = `/export-report/?checklist_ids=${report.checklist_id}`;
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Handle 404 - no completed analysis
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No completed analysis found for this checklist. Please run Gap Analysis first.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate PDF (Error ${response.status})`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server did not return a PDF. Please try again.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setPdfUrl(url);
      setShowPdfViewer(true);
      
      // Refresh to get updated pdf_report_url
      fetchReports();
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setExportError(err.message || 'Failed to load PDF preview. Please try again.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'non_compliant': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'partial': return 'Partially Compliant';
      case 'non_compliant': return 'Non-Compliant';
      case 'not_applicable': return 'N/A';
      default: return status || 'Pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Gap Analysis", path: "/gap-analysis" },
    { label: "Reports", path: "/reports", active: true },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <aside className="w-64 hidden md:flex md:flex-col bg-gradient-to-b from-red-900 to-red-950 text-white shadow-2xl">
        <div className="p-6 text-center">
          <img src={logo} alt="ISOGUARD Logo" className="mx-auto w-16 h-16 mb-2 rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight">ISOGUARD</h1>
          <p className="text-xs text-red-200 mt-1">ISO 27001 Validator</p>
        </div>
        <nav className="mt-6 flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-3 px-6 rounded-full transition-colors ${
                item.active ? "bg-red-600/90" : "hover:bg-red-700/60 text-red-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          {user && <p className="text-sm text-gray-400 mb-2 truncate">{user.name || user.email}</p>}
          <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-8 overflow-auto">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis Reports</h2>
            <p className="text-red-200 text-sm">View AI-powered compliance analysis results</p>
          </div>
          <div className="flex gap-3">
            {reports.length > 0 && (
              <button
                onClick={handleExportAllReports}
                disabled={exporting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export All
                  </>
                )}
              </button>
            )}
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-red-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchReports} className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-sm">
              Retry
            </button>
          </section>
        ) : reports.length === 0 ? (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
            <p className="text-gray-400 text-sm">Reports will appear here after you analyze your ISMS documentation.</p>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white">All Reports ({reports.length})</h3>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => { 
                      setSelectedReport(report); 
                      setExportError(null); 
                      setShowPdfViewer(false);
                      if (pdfUrl) {
                        window.URL.revokeObjectURL(pdfUrl);
                        setPdfUrl(null);
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedReport?.id === report.id
                        ? 'bg-red-600/20 border-red-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-sm">{report.checklist_title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(report.compliance_status)}`}>
                        {getStatusLabel(report.compliance_status)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Score: {((report.compliance_score || 0) * 100).toFixed(0)}%</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Report Detail */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
              {selectedReport ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedReport.checklist_title}</h3>
                      <p className="text-xs text-gray-400 mt-1">Analyzed: {formatDate(selectedReport.completed_at)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(selectedReport.compliance_status)}`}>
                        {getStatusLabel(selectedReport.compliance_status)}
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">
                        {((selectedReport.compliance_score || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Export PDF Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewPDF(selectedReport)}
                      disabled={loadingPdf}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-800 disabled:to-red-900 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loadingPdf ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View AI Report
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleExportPDF(selectedReport)}
                      disabled={exporting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:from-red-900 disabled:to-red-950 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg border border-red-700"
                    >
                      {exporting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* Export Error */}
                  {exportError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                      {exportError}
                    </div>
                  )}

                  {/* Summary */}
                  {selectedReport.summary && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-300 mb-2">Summary</h4>
                      <p className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg">{selectedReport.summary}</p>
                    </div>
                  )}

                  {/* Findings */}
                  {selectedReport.findings?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-300 mb-2">Findings ({selectedReport.findings.length})</h4>
                      <ul className="space-y-2">
                        {selectedReport.findings.map((finding, idx) => (
                          <li key={idx} className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg flex gap-2">
                            <span className="text-green-400">✓</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {selectedReport.gaps?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-300 mb-2">Gaps ({selectedReport.gaps.length})</h4>
                      <ul className="space-y-2">
                        {selectedReport.gaps.map((gap, idx) => (
                          <li key={idx} className="text-sm text-gray-300 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex gap-2">
                            <span className="text-yellow-400">⚠</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedReport.recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Recommendations ({selectedReport.recommendations.length})</h4>
                      <ul className="space-y-2">
                        {selectedReport.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg flex gap-2">
                            <span className="text-blue-400">💡</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comments */}
                  {selectedReport.comments?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">AI Comments ({selectedReport.comments.length})</h4>
                      <ul className="space-y-2">
                        {selectedReport.comments.map((comment, idx) => (
                          <li key={idx} className="text-sm text-gray-300 bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
                            {comment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Control Scores */}
                  {selectedReport.control_scores && Object.keys(selectedReport.control_scores).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-300 mb-2">Control Scores</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedReport.control_scores).map(([control, score]) => (
                          <div key={control} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-20 truncate" title={control}>{control}</span>
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${score >= 0.7 ? 'bg-green-500' : score >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${(score || 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white w-10 text-right">{((score || 0) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline PDF Viewer - Shows below report details */}
                  {showPdfViewer && pdfUrl && (
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-red-300">AI Generated PDF Report</h4>
                        </div>
                        <button
                          onClick={handleClosePdfViewer}
                          className="p-1.5 hover:bg-red-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="Close PDF viewer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                        <iframe
                          src={pdfUrl}
                          className="w-full border-0"
                          style={{ height: '600px' }}
                          title="AI Generated Audit Report"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Select a report to view details</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

    </div>
  );
}
