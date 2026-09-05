// MedLens Human Verification & Audit Logging Engine

window.MedLensVerificationEngine = {
  /**
   * Transforms an array of extracted tests into human verification items.
   * @param {Array} tests - Array of extracted lab tests from report
   * @returns {Array} List of verification row objects matching exact schema
   */
  initVerificationItems: function(tests) {
    if (!Array.isArray(tests)) return [];

    return tests.map((t, idx) => ({
      id: `verif_${idx}_${t.test_name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      field: `${t.test_name}.value`,
      test_name: t.test_name,
      extracted_value: t.value,
      unit: t.unit,
      reference_range: t.reference_range ? t.reference_range.text : "None printed",
      source_snippet: t.source?.snippet || `${t.test_name} ${t.value} ${t.unit}`,
      confidence: t.confidence || "high",
      human_action: null, // "accepted", "corrected", "flagged"
      corrected_value: null,
      corrected_range: null,
      audit: []
    }));
  },

  /**
   * Applies a human verification action (Accept, Correct, Flag) with audit logging.
   * @param {Object} item - Verification item object
   * @param {string} action - "accept", "correct", or "flag"
   * @param {Object} edits - { corrected_value, corrected_range, reason, user_name }
   */
  applyAction: function(item, action, edits = {}) {
    const user = edits.user_name || "Clinician / Reviewer";
    const timestamp = new Date().toISOString();

    if (action === "accept") {
      item.human_action = "accepted";
      item.audit.push({
        timestamp: timestamp,
        user: user,
        action: "Accepted verified extraction",
        details: `Confirmed value ${item.extracted_value} ${item.unit} matches source snippet.`
      });
    } else if (action === "correct") {
      item.human_action = "corrected";
      const oldVal = item.extracted_value;
      const newVal = edits.corrected_value != null ? edits.corrected_value : oldVal;
      item.corrected_value = newVal;

      if (edits.corrected_range != null) {
        item.corrected_range = edits.corrected_range;
      }

      item.audit.push({
        timestamp: timestamp,
        user: user,
        action: "Corrected field value",
        old_value: oldVal,
        new_value: newVal,
        reason: edits.reason || "Manual OCR discrepancy correction",
        details: `Field ${item.field} updated from ${oldVal} to ${newVal}.`
      });
    } else if (action === "flag") {
      item.human_action = "flagged";
      item.audit.push({
        timestamp: timestamp,
        user: user,
        action: "Flagged for second reviewer",
        reason: edits.reason || "Source snippet unclear or missing reference range",
        details: `Item flagged for medical director re-examination.`
      });
    }

    return item;
  }
};
