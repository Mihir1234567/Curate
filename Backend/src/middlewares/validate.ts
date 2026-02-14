import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

interface FieldRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "array";
  min?: number;
  max?: number;
  maxLength?: number;
}

export const validate = (rules: FieldRule[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type === "string" && typeof value !== "string") {
        errors.push(`${rule.field} must be a string`);
      }

      if (rule.type === "number" && typeof value !== "number") {
        errors.push(`${rule.field} must be a number`);
      }

      if (rule.type === "array" && !Array.isArray(value)) {
        errors.push(`${rule.field} must be an array`);
      }

      if (
        rule.min !== undefined &&
        typeof value === "number" &&
        value < rule.min
      ) {
        errors.push(`${rule.field} must be at least ${rule.min}`);
      }

      if (
        rule.max !== undefined &&
        typeof value === "number" &&
        value > rule.max
      ) {
        errors.push(`${rule.field} must be at most ${rule.max}`);
      }

      if (
        rule.maxLength !== undefined &&
        typeof value === "string" &&
        value.length > rule.maxLength
      ) {
        errors.push(
          `${rule.field} must be at most ${rule.maxLength} characters`,
        );
      }
    }

    if (errors.length > 0) {
      throw new ApiError(400, errors.join("; "));
    }

    next();
  };
};
