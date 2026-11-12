import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

const UpdateSchema = z.object({
  isValid: z.boolean().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  year: z.string().optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    if (data.isValid !== undefined) {
      await Repository.validateStudentProfile(id, data.isValid, data.adminNotes);
    }

    if (data.semester !== undefined) {
      await Repository.updateStudentSemester(id, data.semester, data.year);
    }

    return NextResponse.json({
      success: true,
      message: 'Student record updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await Repository.deleteStudentSubmission(id);
    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete submission' },
      { status: 400 }
    );
  }
}
