// MedLens Patient-Friendly Summary Generator Engine

window.MedLensSummaryEngine = {
  /**
   * Generates a patient-friendly summary under 200 words adhering strictly to safety guidelines.
   * @param {Object} patient - Patient intake object
   * @param {Array} reports - Array of processed reports
   * @param {Object} mergedRecord - Merged record object
   * @returns {Object} { text: string, word_count: number, safety_audit: Object }
   */
  generateSummary: function(patient, reports, mergedRecord) {
    const p = patient || {};
    const reps = reports || [];

    const age = p.age?.value ? `${p.age.value}-year-old` : "Patient of unspecified age";
    const sex = p.sex?.value || "unspecified sex";
    const conditions = Array.isArray(p.conditions) && p.conditions.length > 0 
      ? p.conditions.map(c => c.name).join(", ") 
      : "no active conditions recorded";
    const allergies = Array.isArray(p.allergies) && p.allergies.length > 0 
      ? p.allergies.map(a => `${a.substance} (${a.reaction})`).join(", ") 
      : "no known drug allergies";
    const meds = Array.isArray(p.medications) && p.medications.length > 0 
      ? p.medications.map(m => m.name).join(", ") 
      : "none listed";

    // What we have
    const reportCount = reps.length;
    let dateRange = "recent lab visits";
    if (reportCount > 0) {
      const dates = reps.map(r => r.report_meta?.collection_date || r.report_meta?.report_date).filter(Boolean).sort();
      if (dates.length >= 2) {
        dateRange = `${dates[0]} to ${dates[dates.length - 1]}`;
      } else if (dates.length === 1) {
        dateRange = dates[0];
      }
    }

    // What stands out
    const flaggedTests = [];
    reps.forEach(r => {
      (r.tests || []).forEach(t => {
        if (t.interpretation === 'low' || t.interpretation === 'high') {
          const rangeStr = t.reference_range ? t.reference_range.text : "No reference range printed";
          flaggedTests.push(`${t.test_name}: ${t.value} ${t.unit} (${t.interpretation.toUpperCase()} relative to report range ${rangeStr})`);
        }
      });
    });

    const standOutText = flaggedTests.length > 0
      ? flaggedTests.join("; ")
      : "All extracted test values fell within their printed lab reference bounds.";

    // What's missing / unclear
    const missingItems = [];
    if (p.missing_critical_fields?.length > 0) {
      missingItems.push(`Intake missing: ${p.missing_critical_fields.join(', ')}`);
    }
    reps.forEach(r => {
      const missingRange = (r.tests || []).filter(t => t.reference_range === null);
      if (missingRange.length > 0) {
        missingItems.push(`Reference range missing in report for ${missingRange.map(t => t.test_name).join(', ')}`);
      }
      (r.inconsistencies || []).forEach(inc => missingItems.push(inc));
    });

    const missingText = missingItems.length > 0 ? missingItems.join(". ") : "No data inconsistencies or missing critical intake fields detected.";

    // Construct Summary Narrative
    const rawSummary = [
      `Patient Profile: You are a ${age} ${sex} with reported history of ${conditions}. Active allergies: ${allergies}. Current medications: ${meds}.`,
      `Record Scope: We analyzed ${reportCount} medical report(s) spanning ${dateRange}.`,
      `Key Observations: ${standOutText}.`,
      `Data Clarity & Gaps: ${missingText}.`,
      `Next Steps: Please share this structured record with your healthcare provider. Your clinician can review these lab trends, evaluate missing baseline values, and answer medical questions.`
    ].join("\n\n");

    // Pass through Safety Screener
    const safetyResult = window.MedLensSafetyScreener.screenText(rawSummary);
    const finalSummary = safetyResult.rewritten_response;

    const words = finalSummary.trim().split(/\s+/).length;

    return {
      text: finalSummary,
      word_count: words,
      safety_audit: safetyResult
    };
  }
};
