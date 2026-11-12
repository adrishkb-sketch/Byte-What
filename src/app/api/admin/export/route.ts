import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';
import * as XLSX from 'xlsx';
import { DOMAIN_MAP } from '@/data/domains';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || undefined;
    const year = searchParams.get('year') || undefined;
    const semester = searchParams.get('semester') || undefined;
    const status = searchParams.get('status') || 'all';

    let isValidFilter: boolean | 'all' = 'all';
    if (status === 'pending') isValidFilter = false;
    else if (status === 'valid') isValidFilter = true;

    const list = await Repository.getStudentSubmissions({
      department,
      year,
      semester,
      isValid: isValidFilter,
    });

    // Format rows for Excel
    const rows = list.map((student, idx) => {
      // Find top domains
      const sortedRanks = [...student.rankings].sort((a, b) => a.rank - b.rank);
      const top1 = sortedRanks[0] ? `${DOMAIN_MAP.get(sortedRanks[0].domainId)?.name || sortedRanks[0].domainId} (Rank ${sortedRanks[0].rank})` : 'N/A';
      const top2 = sortedRanks[1] ? `${DOMAIN_MAP.get(sortedRanks[1].domainId)?.name || sortedRanks[1].domainId} (Rank ${sortedRanks[1].rank})` : 'N/A';
      const top3 = sortedRanks[2] ? `${DOMAIN_MAP.get(sortedRanks[2].domainId)?.name || sortedRanks[2].domainId} (Rank ${sortedRanks[2].rank})` : 'N/A';

      const allRankingsFormatted = sortedRanks
        .map((r) => `${DOMAIN_MAP.get(r.domainId)?.name || r.domainId} [Rank ${r.rank}]`)
        .join('; ');

      return {
        'SL No': idx + 1,
        'Student ID': student.id,
        'Full Name': student.name,
        'Email Address': student.email || 'N/A',
        'Phone Number': student.phoneNumber,
        'Department / Stream': student.department,
        'Academic Year': student.year,
        'Semester': `Semester ${student.semester || 1}`,
        'Verified Student': student.isVerified ? 'YES' : 'NO',
        'Verification Method': student.verificationMethod || 'N/A',
        'Admin Validation': student.isValid ? 'VALIDATED' : 'PENDING_APPROVAL',
        'Top 1 Priority': top1,
        'Top 2 Priority': top2,
        'Top 3 Priority': top3,
        'All Priority Rankings': allRankingsFormatted,
        'Submission Date': new Date(student.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },  // SL No
      { wch: 20 }, // Student ID
      { wch: 24 }, // Name
      { wch: 28 }, // Email
      { wch: 16 }, // Phone
      { wch: 30 }, // Dept
      { wch: 14 }, // Year
      { wch: 12 }, // Semester
      { wch: 16 }, // Verified
      { wch: 20 }, // Verification Method
      { wch: 20 }, // Admin Validation
      { wch: 25 }, // Top 1
      { wch: 25 }, // Top 2
      { wch: 25 }, // Top 3
      { wch: 50 }, // All Rankings
      { wch: 22 }, // Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ByteMonk Students');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `ByteMonk_Students_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export Excel data' },
      { status: 500 }
    );
  }
}
