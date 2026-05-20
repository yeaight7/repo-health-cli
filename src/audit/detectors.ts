export function hasMarkdownHeading(text: string | undefined, keywords: string[]): boolean {
  if (!text) {
    return false;
  }

  return text
    .split(/\r?\n/)
    .some((line) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
      if (!match) {
        return false;
      }

      const heading = match[2].toLowerCase();
      return keywords.some((keyword) => heading.includes(keyword));
    });
}

export function hasCodeExample(text: string | undefined): boolean {
  if (!text) {
    return false;
  }

  return hasMarkdownHeading(text, ["example"]) || /```[\s\S]*?(repo-health|npm|node|tsx)[\s\S]*?```/i.test(text);
}

export function hasStatusIndicator(text: string | undefined): boolean {
  if (!text) {
    return false;
  }

  return /!\[[^\]]*]\([^)]*\)/.test(text) || /\[[^\]]*(build|ci|test|status|license)[^\]]*]\([^)]*\)/i.test(text);
}

export function hasDemoReference(text: string | undefined): boolean {
  if (!text) {
    return false;
  }

  return hasMarkdownHeading(text, ["demo", "screenshot"]) || /(screenshot|demo|gif|\.gif|\.png|\.jpg|asciinema|loom|youtube)/i.test(text);
}

export function hasBroadWorkflowPermissions(workflowText: string): boolean {
  return /^\s*permissions:\s*write-all\s*$/im.test(workflowText) || /^\s*contents:\s*write\s*$/im.test(workflowText);
}

export function isReleaseWorkflow(fileName: string, workflowText: string): boolean {
  return /release|publish/i.test(fileName) || /\bnpm\s+publish\b/i.test(workflowText) || /\bgh\s+release\b/i.test(workflowText) || /^\s*release:\s*$/im.test(workflowText);
}
