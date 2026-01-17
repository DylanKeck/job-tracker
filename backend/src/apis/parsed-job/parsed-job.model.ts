// backend/src/api/parsed-job/parsed-job.model.ts
import * as cheerio from "cheerio";
import { z } from "zod";

/**
 * Shape we return to the frontend AND optionally store in job.job_parsed (JSONB)
 */
export const ParsedJobSchema = z.object({
    sourceUrl: z.string().url(),

    // maps nicely to your `job` table
    title: z.string().nullable(),     // → job_role
    company: z.string().nullable(),   // → job_company
    location: z.string().nullable(),  // → job_location
    source: z.string().nullable(),    // → job_source (LinkedIn, Indeed, etc.)

    salaryMin: z.number().nullable(), // → job_salary_min
    salaryMax: z.number().nullable(), // → job_salary_max

    // extra AI/future fields – stored in job_parsed JSONB
    employmentType: z.string().nullable(), // Full-time, Contract, etc.
    remoteType: z.string().nullable(),     // Remote, Hybrid, On-site
    seniority: z.string().nullable(),      // Junior/Mid/Senior

    techStack: z.array(z.string()),        // ["React", "Node", ...]
    keywords: z.array(z.string()),         // ["React", "TypeScript", "REST"]

    descriptionRaw: z.string().nullable(), // cleaned job description
    responsibilities: z.array(z.string()), // bullet-like lines
    qualifications: z.array(z.string()),   // requirements

    rawPageText: z.string().nullable(),    // whole page text for AI prompts
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;

/**
 * Public service: given a URL, fetch and parse into a ParsedJob.
 * Controller will call this.
 */
export async function parseJobFromUrl(url: string): Promise<ParsedJob> {
    const { html, text } = await fetchPage(url);
    const structured = extractStructuredJob(html, url);

    // Here we can later call AI to enrich; for now we just normalize.
    const merged: ParsedJob = {
        sourceUrl: url,

        title: structured.title ?? null,
        company: structured.company ?? null,
        location: structured.location ?? null,
        source: structured.source ?? guessSourceFromUrl(url),

        salaryMin: structured.salaryMin ?? null,
        salaryMax: structured.salaryMax ?? null,

        employmentType: structured.employmentType ?? null,
        remoteType: structured.remoteType ?? null,
        seniority: structured.seniority ?? null,

        techStack: structured.techStack ?? [],
        keywords: structured.keywords ?? [],

        descriptionRaw: structured.descriptionRaw ?? null,
        responsibilities: structured.responsibilities ?? [],
        qualifications: structured.qualifications ?? [],

        rawPageText: text || null,
    };

    return ParsedJobSchema.parse(merged);
}

/* ---------- helpers below here can stay private to this module ---------- */

type PartialParsedJob = Partial<ParsedJob>;

async function fetchPage(url: string): Promise<{ html: string; text: string }> {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (JobTrackerBot)",
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const text = $("body").text().replace(/\s+/g, " ").trim();

    return { html, text };
}

/**
 * Try to pull structured data from JSON-LD JobPosting and meta tags.
 * No AI here; this is deterministic and cheap.
 */
function extractStructuredJob(html: string, url: string): PartialParsedJob {
    const $ = cheerio.load(html);

    const result: PartialParsedJob = {
        sourceUrl: url,
        title: null,
        company: null,
        location: null,
        source: null,

        salaryMin: null,
        salaryMax: null,

        employmentType: null,
        remoteType: null,
        seniority: null,

        techStack: [],
        keywords: [],

        descriptionRaw: null,
        responsibilities: [],
        qualifications: [],

        rawPageText: null,
    };

    // 1) JSON-LD JobPosting
    $("script[type='application/ld+json']").each((_, el) => {
        try {
            const jsonText = $(el).contents().text();
            const data = JSON.parse(jsonText);
            const items = Array.isArray(data) ? data : [data];

            for (const item of items) {
                if (!item || typeof item !== "object") continue;
                const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
                if (!types.includes("JobPosting")) continue;

                if (item.title && !result.title) result.title = String(item.title);
                if (item.hiringOrganization?.name && !result.company) {
                    result.company = String(item.hiringOrganization.name);
                }

                // Location
                const loc = item.jobLocation?.address;
                if (loc && !result.location) {
                    const city = loc.addressLocality;
                    const region = loc.addressRegion;
                    const country = loc.addressCountry;
                    result.location = [city, region, country].filter(Boolean).join(", ");
                }

                // Employment type
                if (item.employmentType && !result.employmentType) {
                    result.employmentType = String(item.employmentType);
                }

                // Description
                if (item.description && !result.descriptionRaw) {
                    result.descriptionRaw = stripHtml(String(item.description));
                }

                // Salary
                const salary = item.baseSalary ?? item.salary;
                if (salary && typeof salary === "object") {
                    const value = salary.value;
                    if (value && typeof value === "object") {
                        if (value.minValue != null) result.salaryMin = Number(value.minValue);
                        if (value.maxValue != null) result.salaryMax = Number(value.maxValue);
                        if (value.currency) (result as any).salaryCurrency = String(value.currency);
                        if (value.unitText) (result as any).salaryPeriod = String(value.unitText);
                    }
                }

                break; // first JobPosting is enough for v1
            }
        } catch {
            // ignore malformed JSON-LD
        }
    });

    // 2) Meta fallbacks
    if (!result.title) {
        const ogTitle = $("meta[property='og:title']").attr("content");
        if (ogTitle) result.title = ogTitle;
    }

    if (!result.descriptionRaw) {
        const ogDesc = $("meta[property='og:description']").attr("content");
        if (ogDesc) result.descriptionRaw = ogDesc;
    }

    if (!result.company) {
        const metaCompany = $("meta[name='company'], meta[property='og:site_name']").attr("content");
        if (metaCompany) result.company = metaCompany;
    }

    return result;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function guessSourceFromUrl(url: string): string | null {
    const lower = url.toLowerCase();
    if (lower.includes("linkedin")) return "LinkedIn";
    if (lower.includes("indeed")) return "Indeed";
    if (lower.includes("greenhouse")) return "Greenhouse";
    if (lower.includes("lever.co")) return "Lever";
    return null;
}
