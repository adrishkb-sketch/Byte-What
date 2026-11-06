import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { DomainId } from '@/types';
import { getComplementarityScore } from '@/data/complementarity-matrix';

const CreateProfileSchema = z.object({
  anonymousSessionId: z.string().min(5),
  displayName: z.string().min(2).max(40),
  bio: z.string().max(200).optional(),
  discoverable: z.boolean().default(true),
  primaryDomains: z.array(z.string()).min(1),
  secondaryDomains: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get('domain') as DomainId | null;
    const currentSessionId = searchParams.get('sessionId');

    let profiles = await Repository.getDiscoverableProfiles();

    // If a domain filter is active
    if (domainFilter) {
      profiles = profiles.filter(
        (p) => p.primaryDomains.includes(domainFilter) || p.secondaryDomains.includes(domainFilter)
      );
    }

    // If current session is passed, calculate match/complementarity scores
    const currentResults = currentSessionId ? await Repository.getResults(currentSessionId) : null;
    const currentPrimary = currentResults?.primaryInterests.map((p) => p.domainId) || [];

    const enhanced = profiles.map((p) => {
      let matchScore = 70; // baseline
      if (currentPrimary.length > 0) {
        // Compute overlap or complementarity
        let totalComp = 0;
        let count = 0;
        for (const myDom of currentPrimary) {
          for (const theirDom of p.primaryDomains) {
            totalComp += getComplementarityScore(myDom, theirDom);
            count++;
          }
        }
        matchScore = Math.round((totalComp / (count || 1)) * 100);
      }

      return {
        ...p,
        matchScore,
      };
    });

    enhanced.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: enhanced,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateProfileSchema.parse(body);

    const profile = await Repository.upsertProfile({
      anonymousSessionId: data.anonymousSessionId,
      displayName: data.displayName,
      bio: data.bio,
      discoverable: data.discoverable,
      primaryDomains: data.primaryDomains as DomainId[],
      secondaryDomains: data.secondaryDomains as DomainId[],
      skills: data.skills,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

