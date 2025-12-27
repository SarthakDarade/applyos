
export const escapeLatex = (str) => {
    if (typeof str !== 'string') return '';
    let processed = str
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/"/g, "''");

    // Support for Bold (**text**)
    processed = processed.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}');

    // Support for Italic (*text*)
    // Use negative lookbehind logic or simple greedy matching?
    // Since we processed ** first, *text* should be safe mostly.
    // We use [^*] to ensure we don't match across multiple items unintentionally if possible
    processed = processed.replace(/\*([^*]+?)\*/g, '\\textit{$1}');

    return processed;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Assume basic string for now, or use date-fns if needed
    return dateString;
};
