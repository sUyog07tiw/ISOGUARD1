import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";

const checklists = [
  { 
    id: 1, 
    title: "A.5 Information Security Policies", 
    description: "Policy framework including business strategy alignment, compliance commitments, security objectives, and role-based responsibilities.",
    keyControls: ["Policy definition", "Security objectives", "Compliance commitment", "Continual improvement", "Topic-specific policies"]
  },
  { 
    id: 2, 
    title: "A.6 Organization of Information Security", 
    description: "Organizational structure with defined roles, responsibilities, asset ownership, and segregation of duties.",
    keyControls: ["Roles & responsibilities", "Segregation of duties", "Asset ownership", "Contact with authorities", "Project management"]
  },
  { 
    id: 3, 
    title: "A.7 Human Resource Security", 
    description: "Pre-employment screening, awareness training, disciplinary process, and secure termination procedures.",
    keyControls: ["Background checks", "NDAs", "Security training", "Disciplinary process", "Termination procedures", "Remote working"]
  },
  { 
    id: 4, 
    title: "A.8 Asset Management", 
    description: "Asset inventory, classification, acceptable use, configuration management, and data protection controls.",
    keyControls: ["Asset inventory", "Classification", "Media handling", "Configuration management", "Data deletion", "DLP"]
  },
  { 
    id: 5, 
    title: "A.9 Access Control", 
    description: "Access policy, user management, privileged access, MFA, and system access controls.",
    keyControls: ["Access policy", "User provisioning", "Privileged access", "MFA", "Access reviews", "Secure log-on"]
  },
];

export default function Dashboard() {
  const [dragActive, setDragActive] = useState({});
  const [expandedPanels, setExpandedPanels] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [analyzing, setAnalyzing] = useState({});
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});
  const [exporting, setExporting] = useState({});
  const navigate = useNavigate();
  const user = getCurrentUser();
  const fileInputRefs = useRef({});

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const togglePanel = (id) => {
    setExpandedPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectFiles = (checklistId) => {
    if (fileInputRefs.current[checklistId]) {
      fileInputRefs.current[checklistId].click();
    }
  };

  const handleFileChange = async (e, checklistId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedExtensions = ['.pdf'];
    const validFiles = Array.from(files).filter(f =>
      allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklist_id', checklistId);

      try {
        await api.upload('/files/', formData);
        setUploadedFiles((prev) => ({
          ...prev,
          [checklistId]: [...(prev[checklistId] || []), file.name],
        }));
        // Auto-expand the panel to show uploaded file
        setExpandedPanels((prev) => ({ ...prev, [checklistId]: true }));
        alert(`${file.name} uploaded successfully for checklist ${checklistId}`);
      } catch (err) {
        console.error(err);
        alert(`Upload failed for ${file.name}: ` + (err.message || 'Unknown error'));
      }
    }
  };

  const handleDrop = async (e, checklistId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [checklistId]: false }));
    
    const dropped = e.dataTransfer.files;
    if (!dropped || dropped.length === 0) return;

    const allowedExtensions = ['.pdf'];
    const validFiles = Array.from(dropped).filter(f =>
      allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklist_id', checklistId);

      try {
        await api.upload('/files/', formData);
        setUploadedFiles((prev) => ({
          ...prev,
          [checklistId]: [...(prev[checklistId] || []), file.name],
        }));
        // Auto-expand the panel to show uploaded file
        setExpandedPanels((prev) => ({ ...prev, [checklistId]: true }));
        alert(`${file.name} uploaded successfully for checklist ${checklistId}`);
      } catch (err) {
        console.error(err);
        alert(`Upload failed for ${file.name}: ` + (err.message || 'Unknown error'));
      }
    }
  };

  const handleAnalyzeChecklist = async (checklistId) => {
    const files = uploadedFiles[checklistId];
    if (!files || files.length === 0) {
      alert('Please upload at least one file before analyzing.');
      return;
    }

    setAnalyzing((prev) => ({ ...prev, [checklistId]: true }));
    try {
      const checklist = checklists.find((c) => c.id === checklistId);
      const response = await api.post('/analyze/', {
        checklist_id: checklistId,
        checklist_title: checklist?.title,
        files: files,
      });
      
      // Store the analysis result
      setAnalysisResults((prev) => ({ ...prev, [checklistId]: response }));
      
      // Show success with score
      const score = ((response.compliance_score || 0) * 100).toFixed(0);
      const status = response.compliance_status || 'completed';
      alert(`Analysis complete for ${checklist?.title}!\n\nCompliance Score: ${score}%\nStatus: ${status.replace('_', ' ').toUpperCase()}\n\nView detailed results in the Reports section.`);
      console.log('Analysis response:', response);
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAnalyzing((prev) => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleAnalyzeAll = async () => {
    // Check if any files are uploaded
    const totalFiles = Object.values(uploadedFiles).flat().length;
    if (totalFiles === 0) {
      alert('Please upload at least one file before analyzing.');
      return;
    }

    // Get checklists that have files
    const checklistsWithFiles = checklists.filter(
      (c) => uploadedFiles[c.id]?.length > 0
    );

    if (checklistsWithFiles.length === 0) {
      alert('No files uploaded for any checklist.');
      return;
    }

    setAnalyzingAll(true);
    const results = [];

    try {
      // Analyze each checklist that has files
      for (const checklist of checklistsWithFiles) {
        setAnalyzing((prev) => ({ ...prev, [checklist.id]: true }));
        
        try {
          const response = await api.post('/analyze/', {
            checklist_id: checklist.id,
            checklist_title: checklist.title,
            files: uploadedFiles[checklist.id],
          });
          results.push({ checklist: checklist.title, checklistId: checklist.id, success: true, response });
          // Store individual result
          setAnalysisResults((prev) => ({ ...prev, [checklist.id]: response }));
        } catch (err) {
          console.error(`Analysis failed for ${checklist.title}:`, err);
          results.push({ checklist: checklist.title, checklistId: checklist.id, success: false, error: err.message });
        } finally {
          setAnalyzing((prev) => ({ ...prev, [checklist.id]: false }));
        }
      }

      // Summary of results
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      
      // Calculate average score
      const successfulResults = results.filter((r) => r.success);
      const avgScore = successfulResults.length > 0
        ? (successfulResults.reduce((sum, r) => sum + (r.response?.compliance_score || 0), 0) / successfulResults.length * 100).toFixed(0)
        : 0;
      
      if (failed === 0) {
        alert(`All ${successful} analyses completed!\n\nAverage Compliance Score: ${avgScore}%\n\nView detailed results in the Reports section.`);
      } else {
        alert(`Analysis complete: ${successful} succeeded, ${failed} failed.\n\nAverage Score: ${avgScore}%\n\nView results in the Reports section.`);
      }
      
      console.log('All analysis results:', results);
    } catch (err) {
      console.error('Analyze all failed:', err);
      alert('Analysis failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAnalyzingAll(false);
    }
  };

  const handleExportChecklist = async (checklistId) => {
    const checklist = checklists.find((c) => c.id === checklistId);
    
    // Check if there's an analysis result for this checklist
    if (!analysisResults[checklistId]) {
      alert(`Please analyze documents for "${checklist?.title}" before exporting.`);
      return;
    }
    
    setExporting((prev) => ({ ...prev, [checklistId]: true }));
    try {
      const orgName = user?.name || 'Organization';
      const endpoint = `/export-report/?checklist_ids=${checklistId}&organization=${encodeURIComponent(orgName)}`;
      const filename = `ISOGUARD_${checklist?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
      
      await api.downloadFile(endpoint, filename);
      
      alert(`Audit report for "${checklist?.title}" downloaded successfully!`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setExporting((prev) => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleExportAll = async () => {
    // Check if any analysis has been completed
    const completedAnalyses = Object.keys(analysisResults);
    if (completedAnalyses.length === 0) {
      alert('Please analyze at least one checklist before exporting.');
      return;
    }
    
    setExporting((prev) => ({ ...prev, all: true }));
    try {
      const orgName = user?.name || 'Organization';
      const checklistIds = completedAnalyses.join(',');
      const endpoint = `/export-report/?checklist_ids=${checklistIds}&organization=${encodeURIComponent(orgName)}`;
      
      await api.downloadFile(endpoint, `ISOGUARD_Full_Audit_Report_${orgName.replace(/\s+/g, '_')}.pdf`);
      
      alert(`Full audit report for ${completedAnalyses.length} checklist(s) downloaded!`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setExporting((prev) => ({ ...prev, all: false }));
    }
  };

  // Calculate total uploaded files
  const totalUploadedFiles = Object.values(uploadedFiles).flat().length;
  const checklistsWithUploads = Object.keys(uploadedFiles).filter(
    (key) => uploadedFiles[key]?.length > 0
  ).length;

  const complianceStats = [
    { label: "Overall Score", value: "68%", color: "text-red-400" },
    { label: "Annex A Controls", value: "42/93", color: "text-red-300" },
    { label: "Critical Gaps", value: "12", color: "text-yellow-300" },
    { label: "Maturity Level", value: "Level 2", color: "text-orange-300" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex md:flex-col bg-gradient-to-b from-red-900 to-red-950 text-white shadow-2xl">
        <div className="p-6 text-center">
          <img src={logo} alt="ISOGUARD Logo" className="mx-auto w-16 h-16 mb-2 rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight">ISOGUARD</h1>
          <p className="text-xs text-red-200 mt-1">ISO 27001 Validator</p>
        </div>
        <nav className="mt-6 flex-1 space-y-2">
          <Link to="/dashboard" className="block py-3 px-6 bg-red-600/90 rounded-full transition-colors">Overview</Link>
          <Link to="/gap-analysis" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Gap Analysis</Link>
          <Link to="/reports" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Reports</Link>
          <Link to="/settings" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Settings</Link>
        </nav>
        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {user && (
            <p className="text-sm text-gray-400 mb-2 truncate">
              {user.name || user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Compliance Dashboard</h2>
            <p className="text-red-200 text-sm">
              {user ? `Welcome , ${user.name || 'User'}!` : 'Real-time ISMS validation against ISO/IEC 27001:2022'}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportAll}
              disabled={exporting.all || Object.keys(analysisResults).length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 transition-all ${
                exporting.all || Object.keys(analysisResults).length === 0
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-br from-red-600 to-red-700 border border-red-500 hover:from-red-700 hover:to-red-800 text-white'
              }`}
              title={Object.keys(analysisResults).length === 0 ? 'Run analysis first to export report' : 'Export all completed analyses'}
            >
              {exporting.all ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All Reports (PDF)
                </>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {complianceStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section with Accordion */}
          <section className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-900/70 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">Validate New Evidence</h3>
              <button
                onClick={handleAnalyzeAll}
                disabled={analyzingAll || totalUploadedFiles === 0}
                className={`px-5 py-2 rounded-full font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                  analyzingAll || totalUploadedFiles === 0
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {analyzingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing All...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze All Checklists
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-red-200 mb-2">Upload documents for each ISO 27001 checklist item below.</p>
            <p className="text-xs text-gray-400 mb-6">
              <span className="font-semibold text-white">{totalUploadedFiles}</span> file(s) uploaded across{' '}
              <span className="font-semibold text-white">{checklistsWithUploads}</span> checklist(s)
            </p>
            
            {/* Accordion Panels */}
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <div key={checklist.id} className="border border-white/20 rounded-xl overflow-hidden">
                  {/* Panel Header */}
                  <button
                    onClick={() => togglePanel(checklist.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-full text-sm font-bold">
                        {checklist.id}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{checklist.title}</p>
                        <p className="text-xs text-gray-400">{checklist.description}</p>
                        {/* Key Controls Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {checklist.keyControls?.slice(0, 4).map((control, idx) => (
                            <span key={idx} className="text-xs bg-red-900/50 text-red-200 px-2 py-0.5 rounded">
                              {control}
                            </span>
                          ))}
                          {checklist.keyControls?.length > 4 && (
                            <span className="text-xs text-gray-500">+{checklist.keyControls.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFiles[checklist.id]?.length > 0 && (
                        <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                          {uploadedFiles[checklist.id].length} file(s)
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedPanels[checklist.id] ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Panel Content */}
                  {expandedPanels[checklist.id] && (
                    <div className="p-4 bg-gray-900/50">
                      <div
                        className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all border-2 ${
                          dragActive[checklist.id] ? 'border-red-500/70 bg-red-500/10' : 'border-white/10 bg-gray-800/50'
                        }`}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: true }));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: true }));
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: false }));
                        }}
                        onDrop={(e) => handleDrop(e, checklist.id)}
                      >
                        <svg className="w-8 h-8 text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-300">Drag & drop files here</p>
                        <p className="text-xs text-gray-500 mt-1">PDF only (Max 50MB)</p>
                        <button
                          onClick={() => handleSelectFiles(checklist.id)}
                          className="mt-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg hover:from-red-700 hover:to-red-800 transition-all"
                        >
                          Select Files
                        </button>
                        <input
                          ref={(el) => (fileInputRefs.current[checklist.id] = el)}
                          type="file"
                          accept=".pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(e, checklist.id)}
                        />
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedFiles[checklist.id]?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-gray-400 font-semibold">Uploaded:</p>
                          {uploadedFiles[checklist.id].map((fileName, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{fileName}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Analyze and Export Buttons for this checklist */}
                      <div className="mt-4 flex justify-end gap-2">
                        {/* Export Button */}
                        <button
                          onClick={() => handleExportChecklist(checklist.id)}
                          disabled={exporting[checklist.id] || !analysisResults[checklist.id]}
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
                            exporting[checklist.id] || !analysisResults[checklist.id]
                              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                          }`}
                          title={!analysisResults[checklist.id] ? 'Run analysis first to export report' : 'Export PDF report'}
                        >
                          {exporting[checklist.id] ? (
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
                              Export PDF
                            </>
                          )}
                        </button>
                        
                        {/* Analyze Button */}
                        <button
                          onClick={() => handleAnalyzeChecklist(checklist.id)}
                          disabled={analyzing[checklist.id] || !uploadedFiles[checklist.id]?.length}
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
                            analyzing[checklist.id] || !uploadedFiles[checklist.id]?.length
                              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                          }`}
                        >
                          {analyzing[checklist.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Analyze with AI
                            </>
                          )}
                        </button>
                      </div>

                      {/* Analysis Result Preview */}
                      {analysisResults[checklist.id] && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-white/10">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-white">Last Analysis Result</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              analysisResults[checklist.id].compliance_status === 'compliant' ? 'bg-green-500' :
                              analysisResults[checklist.id].compliance_status === 'partial' ? 'bg-yellow-500' :
                              'bg-red-500'
                            } text-white`}>
                              {((analysisResults[checklist.id].compliance_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          {analysisResults[checklist.id].summary && (
                            <p className="text-xs text-gray-300 mb-2">{analysisResults[checklist.id].summary.slice(0, 150)}...</p>
                          )}
                          <Link
                            to="/reports"
                            className="text-xs text-red-400 hover:text-red-300 underline"
                          >
                            View full report →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Remediation Priorities */}
          <section className="bg-white/10 p-6 rounded-3xl shadow-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Urgent Remediation</h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border-l-4 border-red-500">
                <p className="text-xs font-bold text-red-700">HIGH PRIORITY</p>
                <p className="text-sm text-gray-800">Annex A.8.10: Information Deletion policy missing.</p>
              </div>
              <div className="p-3 bg-orange-50 border-l-4 border-orange-500">
                <p className="text-xs font-bold text-orange-700">MEDIUM PRIORITY</p>
                <p className="text-sm text-gray-800">Clause 6.2: ISMS Objectives not documented.</p>
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-700">TIP</p>
                <p className="text-sm text-gray-800">Review Access Control logs for Annex A.8.3.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
        