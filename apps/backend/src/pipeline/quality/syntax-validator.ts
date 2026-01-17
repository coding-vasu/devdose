import { ValidationResult } from "./types";
import * as ts from "typescript";

export class SyntaxValidator {
  /**
   * Validate JavaScript/TypeScript code
   */
  validateJavaScript(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Use TypeScript compiler to validate syntax
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.CommonJS,
          noEmit: true,
        },
        reportDiagnostics: true,
      });

      if (result.diagnostics && result.diagnostics.length > 0) {
        for (const diagnostic of result.diagnostics) {
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            "\n"
          );

          if (diagnostic.category === ts.DiagnosticCategory.Error) {
            errors.push(message);
          } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
            warnings.push(message);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Syntax error: ${error}`],
        warnings: [],
      };
    }
  }

  /**
   * Validate CSS code (basic validation)
   */
  validateCSS(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic CSS validation - check for balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push("Unbalanced braces in CSS");
    }

    // Check for basic CSS syntax patterns
    if (!code.match(/[.#\w\s]+\s*{[\s\S]*}/)) {
      warnings.push("CSS may not follow standard syntax");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate HTML code (basic validation)
   */
  validateHTML(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic HTML validation - check for balanced tags
    const openTags = code.match(/<(\w+)[^>]*>/g) || [];
    const closeTags = code.match(/<\/(\w+)>/g) || [];

    // Self-closing tags
    const selfClosing = ["img", "br", "hr", "input", "meta", "link"];

    const openTagNames = openTags
      .map((tag) => tag.match(/<(\w+)/)?.[1])
      .filter((name) => name && !selfClosing.includes(name));

    const closeTagNames = closeTags.map((tag) => tag.match(/<\/(\w+)>/)?.[1]);

    if (openTagNames.length !== closeTagNames.length) {
      warnings.push("Potentially unbalanced HTML tags");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate code based on language
   */
  validate(code: string, language: string): ValidationResult {
    switch (language.toLowerCase()) {
      case "javascript":
      case "typescript":
      case "jsx":
      case "tsx":
        return this.validateJavaScript(code);
      case "css":
      case "scss":
        return this.validateCSS(code);
      case "html":
        return this.validateHTML(code);
      default:
        // For unknown languages, assume valid
        return {
          isValid: true,
          errors: [],
          warnings: [],
        };
    }
  }
}
