'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit3,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { StudentSubmission } from '@/types';
import { DOMAIN_MAP } from '@/data/domains';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Ceramic Technology',
  'Other / Interdisciplinary',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusTab, setStatusTab] = useState<'pending' | 'valid' | 'all'>('pending');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [inspectCardStudent, setInspectCardStudent] = useState<StudentSubmission | null>(null);
  const [editSemesterStudent, setEditSemesterStudent] = useState<StudentSubmission | null>(null);
  const [newSemesterVal, setNewSemesterVal] = useState<number>(1);
  const [newYearVal, setNewYearVal] = useState<string>('1st Year');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch Submissions
  async function fetchSubmissions() {
    try {
      setLoading(true);
      let url = `/api/admin/submissions?status=${statusTab}`;
      if (selectedDept !== 'All') url += `&department=${encodeURIComponent(selectedDept)}`;
      if (selectedYear !== 'All') url += `&year=${encodeURIComponent(selectedYear)}`;
      if (selectedSemester !== 'All') url += `&semester=${encodeURIComponent(selectedSemester)}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data || []);
      } else {
        setErrorMsg(json.error || 'Failed to fetch student records');
      }
    } catch {
      setErrorMsg('Network error connecting to administrative service.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [statusTab, selectedDept, selectedYear, selectedSemester, searchQuery]);

  // Validate / Invalidate Profile
  async function handleToggleValidation(studentId: string, currentValid: boolean) {
    try {
      setActionLoadingId(studentId);
      const newStatus = !currentValid;
      const res = await fetch(`/api/admin/submissions/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isValid: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          newStatus
            ? '✓ Profile marked as Valid! It is now counted in public graphs & statistics.'
            : 'Profile marked as Pending/Invalid. Removed from public statistics.'
        );
        fetchSubmissions();
      } else {
        setErrorMsg(data.error || 'Action failed');
      }
    } catch {
      setErrorMsg('Failed to update student validation status.');
    } finally {
      setActionLoadingId(null);
    }
  }

  // Update Semester for repeaters / edge cases
  async function handleSaveSemester() {
    if (!editSemesterStudent) return;
    try {
      setActionLoadingId(editSemesterStudent.id);
      const res = await fetch(`/api/admin/submissions/${editSemesterStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: newSemesterVal,
          year: newYearVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`✓ Updated ${editSemesterStudent.name} to Semester ${newSemesterVal} (${newYearVal})`);
        setEditSemesterStudent(null);
        fetchSubmissions();
      } else {
        setErrorMsg(data.error || 'Update failed');
      }
    } catch {
      setErrorMsg('Failed to update semester.');
    } finally {
      setActionLoadingId(null);
    }
  }

  // Advance Term for all students
  async function handleAdvanceTerm() {
    try {
      setPromoting(true);
      const res = await fetch('/api/admin/promote-term', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Academic term advanced successfully!');
        setShowPromoteModal(false);
        fetchSubmissions();
      } else {
        setErrorMsg(data.error || 'Failed to advance term');
      }
    } catch {
      setErrorMsg('Failed to advance academic term.');
    } finally {
      setPromoting(false);
    }
  }

  // Delete submission
  async function handleDeleteSubmission(studentId: string, studentName: string) {
    if (!confirm(`Are you sure you want to permanently delete submission for "${studentName}"?`)) return;
    try {
      setActionLoadingId(studentId);
      const res = await fetch(`/api/admin/submissions/${studentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`✓ Deleted submission for ${studentName}`);
        fetchSubmissions();
      } else {
        setErrorMsg(data.error || 'Delete failed');
      }
    } catch {
      setErrorMsg('Failed to delete submission.');
    } finally {
      setActionLoadingId(null);
    }
  }

  // Export to Excel
  function handleExportExcel() {
    let url = `/api/admin/export?status=${statusTab}`;
    if (selectedDept !== 'All') url += `&department=${encodeURIComponent(selectedDept)}`;
    if (selectedYear !== 'All') url += `&year=${encodeURIComponent(selectedYear)}`;
    if (selectedSemester !== 'All') url += `&semester=${encodeURIComponent(selectedSemester)}`;
    window.location.href = url;
  }

  // Stats calculation
  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => !s.isValid).length;
  const validCount = submissions.filter((s) => s.isValid).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-primary/20">
        <div className="flex items-center gap-3.5">
          <img
            src="/bytemonk-logo.png"
            alt="ByteMonk Logo"
            className="w-12 h-12 rounded-2xl object-cover border border-primary/40 shadow-lg shadow-primary/25"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wider">BYTEMONK ADMIN</h1>
              <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                GCECT CONTROL
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Profile Validation, Semester Promotions, Excel Export & Collegiate Graph Moderation
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchSubmissions}
            title="Refresh records"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-white border border-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowPromoteModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] transition-all flex items-center gap-2 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-accent-violet" />
            <span>Advance Term (+1 Sem)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-accent-emerald hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-accent-rose hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08]">
          <span className="text-[11px] text-text-muted font-medium block mb-1">Total Loaded</span>
          <span className="text-2xl font-black text-white">{totalCount}</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02]">
          <span className="text-[11px] text-accent-amber font-semibold block mb-1">Pending Approval</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-accent-amber">{pendingCount}</span>
            <span className="text-[10px] text-text-muted">(not in public graphs)</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[11px] text-accent-emerald font-semibold block mb-1">Validated Profiles</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-accent-emerald">{validCount}</span>
            <span className="text-[10px] text-accent-emerald">(live in public graphs)</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-primary/20 bg-primary/[0.02]">
          <span className="text-[11px] text-primary font-semibold block mb-1">Public Graph Rule</span>
          <span className="text-xs text-text-secondary leading-tight block">
            Only approved valid profiles populate public domain stats & charts.
          </span>
        </div>
      </div>

      {/* Filter and Tab Control */}
      <div className="glass-panel p-4 rounded-2xl mb-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => setStatusTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === 'pending'
                  ? 'bg-accent-amber text-[#050811] shadow-md shadow-amber-500/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Validation ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusTab('valid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === 'valid'
                  ? 'bg-accent-emerald text-[#050811] shadow-md shadow-emerald-500/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validated Profiles ({validCount})</span>
            </button>

            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === 'all'
                  ? 'bg-primary text-[#050811] shadow-md shadow-primary/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <span>All Submissions</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, stream, phone..."
              className="w-full bg-[#050811] border border-white/[0.1] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Stream, Year & Semester Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
          <div>
            <label className="text-[11px] text-text-muted block mb-1">Filter by Stream / Dept:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-[#050811] text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-text-muted block mb-1">Filter by Academic Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-[#050811] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-text-muted block mb-1">Filter by Semester (1–8):</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s} className="bg-[#050811] text-white">
                  {s === 'All' ? 'All Semesters' : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-text-secondary">Loading student submissions...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-20 text-center px-4">
            <p className="text-sm font-bold text-white mb-1">No submissions found</p>
            <p className="text-xs text-text-muted">
              {statusTab === 'pending'
                ? 'Great job! There are currently no profiles pending administrative validation.'
                : 'No student submissions matching your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-text-muted border-b border-white/[0.06] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-3">Stream & Term</th>
                  <th className="py-3.5 px-3">Phone / Contact</th>
                  <th className="py-3.5 px-3">Verification</th>
                  <th className="py-3.5 px-3">Top Interests</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {submissions.map((student) => {
                  const sortedRanks = [...(student.rankings || [])].sort((a, b) => a.rank - b.rank);
                  const top1 = sortedRanks[0] ? DOMAIN_MAP.get(sortedRanks[0].domainId)?.name : null;
                  const isActing = actionLoadingId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{student.name}</div>
                        <div className="text-[10px] text-text-muted font-mono">{student.email || 'No email provided'}</div>
                        <div className="text-[9px] text-text-muted mt-0.5">
                          {new Date(student.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      {/* Stream, Year, Semester */}
                      <td className="py-3.5 px-3">
                        <div className="text-text-primary font-medium">{student.department}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-primary font-mono">{student.year}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-text-secondary font-mono">
                            Sem {student.semester || 1}
                          </span>
                        </div>
                      </td>

                      {/* Phone Number (Automation ready) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-white text-xs">
                          <Phone className="w-3 h-3 text-accent-emerald flex-shrink-0" />
                          <span>{student.phoneNumber}</span>
                        </div>
                        <a
                          href={`https://wa.me/${student.phoneNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-primary hover:underline mt-0.5 inline-block"
                        >
                          Send WhatsApp notification →
                        </a>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3">
                        {student.verificationMethod === 'id_card_ai' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-cyan px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/25">
                              <Sparkles className="w-3 h-3" />
                              <span>AI ID Scan ({student.idCardAiVerification?.confidence || 85}%)</span>
                            </span>
                            {student.idCardUrl && (
                              <button
                                onClick={() => setInspectCardStudent(student)}
                                className="block text-[10px] text-text-secondary hover:text-white underline"
                              >
                                View ID Photo & AI Details
                              </button>
                            )}
                          </div>
                        ) : student.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-emerald px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/25">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Email OTP Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted px-2 py-0.5 rounded bg-white/[0.04]">
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Top Interests */}
                      <td className="py-3.5 px-3">
                        {top1 ? (
                          <div className="text-white font-medium text-xs truncate max-w-[150px]">
                            {top1}
                            {sortedRanks.length > 1 && (
                              <span className="text-[10px] text-text-muted block">
                                + {sortedRanks.length - 1} more ranked
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted">None</span>
                        )}
                      </td>

                      {/* Valid Status */}
                      <td className="py-3.5 px-3">
                        {student.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-emerald px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VALIDATED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Validation Button */}
                          <button
                            onClick={() => handleToggleValidation(student.id, Boolean(student.isValid))}
                            disabled={isActing}
                            title={student.isValid ? 'Invalidate profile' : 'Validate and include in public graphs'}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              student.isValid
                                ? 'bg-white/[0.06] hover:bg-accent-rose/20 text-text-secondary hover:text-accent-rose border border-white/[0.08]'
                                : 'bg-primary hover:bg-primary-hover text-[#050811] shadow-md shadow-primary/25'
                            }`}
                          >
                            {isActing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : student.isValid ? (
                              <span>Revoke</span>
                            ) : (
                              <span>Approve</span>
                            )}
                          </button>

                          {/* Edit Semester Button */}
                          <button
                            onClick={() => {
                              setEditSemesterStudent(student);
                              setNewSemesterVal(student.semester || 1);
                              setNewYearVal(student.year || '1st Year');
                            }}
                            title="Edit semester / handle repeating student"
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-text-muted hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSubmission(student.id, student.name)}
                            disabled={isActing}
                            title="Delete submission"
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-accent-rose/20 text-text-muted hover:text-accent-rose transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Inspect Physical ID Card Scan (Manual Review) */}
      {inspectCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-primary/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Manual GCECT College ID Card Inspection</span>
              </h3>
              <button
                onClick={() => setInspectCardStudent(null)}
                className="text-text-muted hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              {inspectCardStudent.idCardUrl ? (
                <div className="rounded-2xl overflow-hidden border border-white/[0.15] bg-black/40 p-2 flex items-center justify-center">
                  <img
                    src={inspectCardStudent.idCardUrl}
                    alt="GCECT Student ID Card Scan"
                    className="w-full object-contain max-h-72 rounded-xl"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.1]">
                  <p className="text-xs text-text-muted">No ID card image attached. (Registered via Email OTP)</p>
                </div>
              )}

              {/* Student Details Summary for Manual Cross-Checking */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Student Name:</span>
                  <span className="font-bold text-white">{inspectCardStudent.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">College Email:</span>
                  <span className="font-mono text-white">{inspectCardStudent.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Department / Stream:</span>
                  <span className="font-semibold text-accent-cyan">{inspectCardStudent.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Academic Year & Sem:</span>
                  <span className="font-semibold text-white">
                    {inspectCardStudent.year} • Semester {inspectCardStudent.semester || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Phone Number:</span>
                  <span className="font-mono text-accent-emerald">{inspectCardStudent.phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                  <span className="text-text-muted">Verification Method:</span>
                  <span className="text-white font-medium">
                    {inspectCardStudent.verificationMethod === 'email_otp' ? 'Institutional Email OTP' : 'Manual ID Card Photo'}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectCardStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleValidation(inspectCardStudent.id, false);
                    setInspectCardStudent(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover shadow-md shadow-primary/20"
                >
                  Approve & Validate Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Modify Semester & Year (Handles Repeat Years / Backlog edge cases) */}
      {editSemesterStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-primary/30">
            <h3 className="text-base font-bold text-white mb-1">
              Modify Academic Semester / Year
            </h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Student: <strong className="text-white">{editSemesterStudent.name}</strong> ({editSemesterStudent.department})
              <br />
              Use this to adjust semester for students repeating a year or with special academic progression.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs text-text-muted block mb-1">Select Current Semester (1–8):</label>
                <select
                  value={newSemesterVal}
                  onChange={(e) => {
                    const s = Number(e.target.value);
                    setNewSemesterVal(s);
                    // auto calculate suggested year
                    if (s <= 2) setNewYearVal('1st Year');
                    else if (s <= 4) setNewYearVal('2nd Year');
                    else if (s <= 6) setNewYearVal('3rd Year');
                    else setNewYearVal('4th Year');
                  }}
                  className="w-full bg-[#050811] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-[#050811] text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">Academic Year:</label>
                <select
                  value={newYearVal}
                  onChange={(e) => setNewYearVal(e.target.value)}
                  className="w-full bg-[#050811] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {YEARS.filter((y) => y !== 'All').map((y) => (
                    <option key={y} value={y} className="bg-[#050811] text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditSemesterStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSemester}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover shadow-md shadow-primary/20"
              >
                Save Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Advance Academic Term Confirmation (+1 Semester for everyone) */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center mb-4 text-accent-violet">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Advance Collegiate Academic Term?
            </h3>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              This action increments the semester count by <strong className="text-white">+1 for all active students</strong> across GCECT (e.g. Sem 1 becomes Sem 2, Sem 2 becomes Sem 3) and automatically rolls over their academic year.
              <br /><br />
              Students repeating a semester or year can be adjusted individually anytime from this interface.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={promoting}
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={promoting}
                onClick={handleAdvanceTerm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-violet to-primary hover:opacity-90 shadow-md shadow-violet-500/25 flex items-center gap-1.5"
              >
                {promoting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Promoting...</span>
                  </>
                ) : (
                  <span>Confirm +1 Term Advance</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
