export interface StepDSAMetadata {
  title?: string;
  language?: string;
  category?: string;
  input?: any;
  stage?: string;
  pointers?: string[];
  [key: string]: any;
}

export interface StepDSAParsedFile {
  metadata: StepDSAMetadata;
  code: string;
  rawContent: string;
}

/**
 * Parses raw text from a .stepdsa file into structured metadata and unescaped code.
 * Follows standard frontmatter format (--- metadata --- code).
 * Zero npm dependencies, pure native string/regex parsing.
 */
export function parseStepDSAFile(fileContent: string): StepDSAParsedFile {
  if (!fileContent || !fileContent.trim()) {
    return {
      metadata: {},
      code: '',
      rawContent: fileContent || '',
    };
  }

  const trimmed = fileContent.trim();
  const frontmatterMatch = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!frontmatterMatch) {
    return {
      metadata: {},
      code: fileContent,
      rawContent: fileContent,
    };
  }

  const rawYaml = frontmatterMatch[1];
  const code = frontmatterMatch[2] || '';
  const metadata: StepDSAMetadata = {};

  // Simple key-value regex line parser supporting strings, numbers, booleans, and JSON arrays/objects
  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let valStr = line.slice(colonIdx + 1).trim();

    if (!key) continue;

    // Try parsing as JSON (arrays [1, 2], booleans true/false, numbers, strings with quotes)
    try {
      metadata[key] = JSON.parse(valStr);
    } catch {
      // If JSON.parse fails, strip wrapping quotes or preserve as string
      if (
        (valStr.startsWith('"') && valStr.endsWith('"')) ||
        (valStr.startsWith("'") && valStr.endsWith("'"))
      ) {
        valStr = valStr.slice(1, -1);
      }
      metadata[key] = valStr;
    }
  }

  return {
    metadata,
    code,
    rawContent: fileContent,
  };
}
