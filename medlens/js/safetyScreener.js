// MedLens AI Safety Guardrail & Screener Engine

window.MedLensSafetyScreener = {
  /**
   * Screens draft text or summary for unsafe clinical statements.
   * @param {string} draftText - The raw proposed text or summary
   * @returns {Object} Safety Audit JSON matching exact specification
   */
  screenText: function(draftText) {
    if (!draftText) {
      return { safe: true, issues: [], rewritten_response: "" };
    }

    const issues = [];
    let rewritten = draftText;

    // 1. Check for Diagnostic Statements
    const diagRegex = /\b(?:you have|diagnosed with|you are suffering from|this proves|indicates you have|you suffer from)\s+([A-Za-z0-9\s]+)/gi;
    if (diagRegex.test(draftText)) {
      issues.push("diagnostic_statement");
      rewritten = rewritten.replace(
        diagRegex,
        "laboratory findings show values relative to reference bounds for $1"
      );
    }

    // 2. Check for Treatment / Medication Advice
    const rxRegex = /\b(?:start taking|you should take|prescribe|take 500|take \d+mg|begin medication|start metformin|start insulin)\b/gi;
    if (rxRegex.test(draftText)) {
      issues.push("treatment_advice");
      rewritten = rewritten.replace(
        rxRegex,
        "discuss medical treatment options with your healthcare provider"
      );
    }

    // 3. Check for Dosage Changes
    const dosageRegex = /\b(?:increase your|decrease your|stop taking|double your dosage|adjust dose)\b/gi;
    if (dosageRegex.test(draftText)) {
      issues.push("dosage_changes");
      rewritten = rewritten.replace(
        dosageRegex,
        "consult your physician before altering any prescription medication"
      );
    }

    // 4. Check for Definitive Causal Claims
    const causalRegex = /\b(?:this proves|definitively confirms|without doubt|guarantees)\b/gi;
    if (causalRegex.test(draftText)) {
      issues.push("definitive_causal_claim");
      rewritten = rewritten.replace(
        causalRegex,
        "is consistent with laboratory measurements"
      );
    }

    // 5. Check for Invented Reference Ranges (e.g. stating ranges without report backing)
    if (/\b(?:standard range is|normal range for everyone is)\b/gi.test(draftText)) {
      issues.push("invented_reference_range");
      rewritten = rewritten.replace(
        /\b(?:standard range is|normal range for everyone is)\b/gi,
        "reference range printed on the source report is"
      );
    }

    const isSafe = issues.length === 0;

    return {
      safe: isSafe,
      issues: Array.from(new Set(issues)),
      rewritten_response: rewritten
    };
  }
};
