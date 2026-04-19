import { z } from "zod";

export const generateRequestSchema = z.object({
  templateId: z
    .string()
    .min(1, "Template is required"),
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(120, "Project name must be under 120 characters")
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, "Only letters, numbers, spaces, hyphens and dots allowed"),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #1a6cf6)"),
  userDescription: z
    .string()
    .max(600, "Keep it under 600 characters")
    .optional()
    .default(""),
  dataFile: z.string().optional(),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;

export function validateGenerateRequest(data: unknown): 
  | { ok: true; data: GenerateRequestInput }
  | { ok: false; errors: Record<string, string> }
{
  const result = generateRequestSchema.safeParse(data);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });
    return { ok: false, errors: fieldErrors };
  }
  return { ok: true, data: result.data };
}
