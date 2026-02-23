import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";

// ISO 27001:2022 Checklist titles - all 10 checklists
const checklistTitles = {
  1: "Annex A 5.1 - Policies for Information Security",
  2: "Annex A 5.2 - Information Security Roles and Responsibilities",
  3: "Annex A 5.9 - Inventory of Information and Other Associated Assets",
  4: "Annex A 5.10 - Acceptable Use of Information and Other Associated Assets",
  5: "Annex A 5.12 - Classification of Information",
  6: "Annex A 5.7 - Threat Intelligence",
  7: "Annex A 6.1 - Screening",
  8: "Annex A 7.4 - Physical Security Monitoring",
  9: "Annex A 8.18 - Use of Privileged Utility Programs",
  10: "Annex A 8.2 - Access Rights",
};

export default function GapAnalysis() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analyses/?status=completed');
      // Get latest analysis for each checklist
      const latestByChecklist = {};
      (response.results || response || []).forEach(analysis => {
        const cid = analysis.checklist_id;
        if (!latestByChecklist[cid] || new Date(analysis.created_at) > new Date(latestByChecklist[cid].created_at)) {
          latestByChecklist[cid] = analysis;
        }
      });
      setAnalyses(Object.values(latestByChecklist));
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Get all gaps with their checklist context
  const getAllGaps = () => {
    const allGaps = [];
    analyses.forEach(analysis => {
      const gaps = analysis.gaps || [];
      gaps.forEach((gap, index) => {
        // Determine priority based on gap content keywords
        const gapLower = gap.toLowerCase();
        let priority = 'medium'; // default
        
        // High priority indicators - critical issues
        if (gapLower.includes('not satisfied') || 
            gapLower.includes('missing') || 
            gapLower.includes('no evidence') ||
            gapLower.includes('not implemented') ||
            gapLower.includes('not documented') ||
            gapLower.includes('not established') ||
            gapLower.includes('not defined')) {
          priority = 'high';
        } 
        // Low priority indicators - minor issues  
        else if (gapLower.includes('may not be') ||
                 gapLower.includes('adequately addressed') ||
                 gapLower.includes('consider') ||
                 gapLower.includes('could be improved') ||
                 gapLower.includes('enhancement')) {
          priority = 'low';
        }
        // Medium priority - everything else (default)
        
        allGaps.push({
          id: `${analysis.checklist_id}-${index}`,
          checklistId: analysis.checklist_id,
          checklistTitle: analysis.checklist_title || checklistTitles[analysis.checklist_id],
          gap: gap,
          priority: priority,
          complianceScore: analysis.compliance_score,
          complianceStatus: analysis.compliance_status,
        });
      });
    });
    return allGaps;
  };

  // Get all recommendations from analyses
  const getAllRecommendations = () => {
    const allRecs = [];
    analyses.forEach(analysis => {
      const recommendations = analysis.recommendations || [];
      recommendations.forEach((rec, index) => {
        allRecs.push({
          id: `rec-${analysis.checklist_id}-${index}`,
          checklistId: analysis.checklist_id,
          checklistTitle: analysis.checklist_title || checklistTitles[analysis.checklist_id],
          recommendation: rec,
        });
      });
    });
    return allRecs;
  };

  // Get all findings from analyses
  const getAllFindings = () => {
    const allFindings = [];
    analyses.forEach(analysis => {
      const findings = analysis.findings || [];
      findings.forEach((finding, index) => {
        allFindings.push({
          id: `finding-${analysis.checklist_id}-${index}`,
          checklistId: analysis.checklist_id,
          checklistTitle: analysis.checklist_title || checklistTitles[analysis.checklist_id],
          finding: finding,
        });
      });
    });
    return allFindings;
  };

  // No default gaps - use real data only
  const defaultGaps = [];
  const defaultRecommendations = [];
  const defaultFindings = [];

  // Use real data from analyses
  const realGaps = getAllGaps();
  const realRecommendations = getAllRecommendations();
  const realFindings = getAllFindings();
  
  const allGaps = realGaps;
  const allRecommendations = realRecommendations;
  const allFindings = realFindings;
  const isUsingDefaults = realGaps.length === 0 && analyses.length === 0;
  
  // Apply filters
  const filteredGaps = allGaps.filter(gap => {
    if (selectedChecklist !== 'all' && gap.checklistId !== parseInt(selectedChecklist)) {
      return false;
    }
    if (priorityFilter !== 'all' && gap.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // Group gaps by checklist for summary
  const gapsByChecklist = {};
  allGaps.forEach(gap => {
    if (!gapsByChecklist[gap.checklistId]) {
      gapsByChecklist[gap.checklistId] = {
        title: gap.checklistTitle,
        gaps: [],
        complianceScore: gap.complianceScore,
        complianceStatus: gap.complianceStatus,
      };
    }
    gapsByChecklist[gap.checklistId].gaps.push(gap);
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 border-blue-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'non_compliant': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Gap Analysis", path: "/gap-analysis", active: true },
    { label: "Reports", path: "/reports" },
    { label: "Settings", path: "/settings" },
  ];

  const totalHighPriority = allGaps.filter(g => g.priority === 'high').length;
  const totalMediumPriority = allGaps.filter(g => g.priority === 'medium').length;
  const totalLowPriority = allGaps.filter(g => g.priority === 'low').length;

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

      <main className="flex-1 p-8 space-y-6 overflow-auto">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Gap Analysis</h2>
            <p className="text-red-200 text-sm">Identify compliance gaps to fix in your audit report</p>
          </div>
          <button 
            onClick={fetchAnalyses}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-red-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <>
            {/* No Data Notice */}
            {isUsingDefaults && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-yellow-200 text-sm">
                  No analysis data available yet. <Link to="/dashboard" className="underline text-yellow-400 hover:text-yellow-300">Upload and analyze your documents</Link> to see gaps from your ISMS.
                </p>
              </div>
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border border-white/10">
                <p className="text-sm text-gray-400">Total Gaps</p>
                <p className="text-3xl font-bold text-white mt-1">{allGaps.length}</p>
              </div>
              <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 p-5 rounded-2xl border border-red-500/30">
                <p className="text-sm text-red-300">High Priority</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{totalHighPriority}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-950/50 p-5 rounded-2xl border border-yellow-500/30">
                <p className="text-sm text-yellow-300">Medium Priority</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{totalMediumPriority}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 p-5 rounded-2xl border border-blue-500/30">
                <p className="text-sm text-blue-300">Low Priority</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{totalLowPriority}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <label className="text-sm text-gray-400 mr-2">Checklist:</label>
                <select 
                  value={selectedChecklist}
                  onChange={(e) => setSelectedChecklist(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Checklists</option>
                  {Object.entries(checklistTitles).map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mr-2">Priority:</label>
                <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div className="ml-auto text-sm text-gray-400">
                Showing {filteredGaps.length} of {allGaps.length} gaps
              </div>
            </div>

            {/* Gaps by Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Checklist Summary */}
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Gap Distribution by Checklist
                </h3>
                <div className="space-y-3">
                  {Object.entries(gapsByChecklist).length > 0 ? Object.entries(gapsByChecklist).map(([checklistId, data]) => (
                    <div 
                      key={checklistId}
                      className="p-4 bg-gray-800/50 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedChecklist(checklistId)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-white">{data.title}</h4>
                        <span className={`text-xs font-bold ${getStatusColor(data.complianceStatus)}`}>
                          {Math.round((data.complianceScore || 0) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-600"
                            style={{ width: `${Math.min(100, data.gaps.length * 20)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{data.gaps.length} gap(s)</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {data.gaps.filter(g => g.priority === 'high').length > 0 && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            {data.gaps.filter(g => g.priority === 'high').length} High
                          </span>
                        )}
                        {data.gaps.filter(g => g.priority === 'medium').length > 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            {data.gaps.filter(g => g.priority === 'medium').length} Medium
                          </span>
                        )}
                        {data.gaps.filter(g => g.priority === 'low').length > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            {data.gaps.filter(g => g.priority === 'low').length} Low
                          </span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-sm">No gaps grouped by checklist.</p>
                  )}
                </div>
              </section>

              {/* Detailed Gap List */}
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Gaps to Address
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredGaps.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No gaps match the selected filters.</p>
                  ) : (
                    filteredGaps.map((gap) => (
                      <div 
                        key={gap.id}
                        className={`p-4 rounded-xl border ${getPriorityBgColor(gap.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getPriorityColor(gap.priority)}`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs text-gray-400">{gap.checklistTitle}</span>
                              <span className={`text-xs font-semibold uppercase ${getPriorityColor(gap.priority)} px-2 py-0.5 rounded text-white`}>
                                {gap.priority}
                              </span>
                            </div>
                            <p className="text-sm text-white leading-relaxed">{gap.gap}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Audit Findings Section */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Audit Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFindings.map((finding) => (
                  <div 
                    key={finding.id}
                    className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                  >
                    <p className="text-xs text-blue-400 mb-2 font-semibold">{finding.checklistTitle}</p>
                    <p className="text-sm text-gray-200">{finding.finding}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations Section */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recommendations
              </h3>
              <div className="space-y-3">
                {allRecommendations.map((rec, index) => (
                  <div 
                    key={rec.id}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs text-green-400 mb-1 font-semibold">{rec.checklistTitle}</p>
                      <p className="text-sm text-gray-200">{rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Action Items */}
            <section className="bg-gradient-to-r from-red-900/30 to-red-950/30 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Remediation Steps
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                To address the identified gaps and improve your compliance score, follow these steps:
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="text-white font-semibold">Prioritize High-Risk Gaps</p>
                    <p className="text-gray-400">Focus on the {totalHighPriority} high-priority gaps first as they represent critical compliance issues.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="text-white font-semibold">Create/Update Documentation</p>
                    <p className="text-gray-400">Develop missing policies, procedures, and evidence documentation for each identified gap.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="text-white font-semibold">Re-analyze After Updates</p>
                    <p className="text-gray-400">Upload the updated documents and run the analysis again to verify gap closure.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="text-white font-semibold">Export Updated Report</p>
                    <p className="text-gray-400">Generate a new PDF audit report showing improved compliance status.</p>
                  </div>
                </li>
              </ol>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
