// MedLens Medical Report Comparison & Delta Tracking Engine

window.MedLensComparisonEngine = {
  /**
   * Compares a current/latest report against a prior report.
   * @param {Object} currentReport - The current/latest extracted report
   * @param {Object} previousReport - The prior extracted report
   * @returns {Array} List of comparison objects matching specified schema
   */
  compareReports: function(currentReport, previousReport) {
    if (!currentReport || !previousReport) return [];

    const comparisons = [];
    const currTests = currentReport.tests || [];
    const prevTests = previousReport.tests || [];

    const prevMap = {};
    prevTests.forEach(t => {
      prevMap[t.test_name.toLowerCase().trim()] = t;
    });

    currTests.forEach(curr => {
      const key = curr.test_name.toLowerCase().trim();
      const prev = prevMap[key];

      if (prev) {
        let delta = null;
        let direction = "steady";
        let note = "";

        // Check for unit mismatch
        if (curr.unit !== prev.unit) {
          note = `Unit mismatch between reports: current is '${curr.unit}', previous was '${prev.unit}'. Delta computed directly.`;
        }

        if (typeof curr.value === 'number' && typeof prev.value === 'number') {
          delta = parseFloat((curr.value - prev.value).toFixed(2));
          if (delta > 0.001) direction = "up";
          else if (delta < -0.001) direction = "down";
          else direction = "steady";
        }

        // Status change classification
        let statusChange = "unchanged";
        const currInterp = curr.interpretation || "unknown";
        const prevInterp = prev.interpretation || "unknown";

        if (prevInterp === 'normal' && currInterp === 'high') statusChange = "normal_to_high";
        else if (prevInterp === 'normal' && currInterp === 'low') statusChange = "normal_to_low";
        else if (prevInterp === 'high' && currInterp === 'normal') statusChange = "high_to_normal";
        else if (prevInterp === 'low' && currInterp === 'normal') statusChange = "low_to_normal";
        else if (prevInterp === 'high' && currInterp === 'high') statusChange = "remains_high";
        else if (prevInterp === 'low' && currInterp === 'low') statusChange = "remains_low";
        else statusChange = "steady_normal";

        // Build factual note
        if (!note) {
          if (curr.reference_range && curr.reference_range.text) {
            if (currInterp === 'high') {
              note = `Value ${curr.value} ${curr.unit} exceeds upper bound ${curr.reference_range.high} of report's range ${curr.reference_range.text}.`;
            } else if (currInterp === 'low') {
              note = `Value ${curr.value} ${curr.unit} is below lower bound ${curr.reference_range.low} of report's range ${curr.reference_range.text}.`;
            } else {
              note = `Value ${curr.value} ${curr.unit} is within report's reference range ${curr.reference_range.text}.`;
            }
          } else {
            note = `Reference range not printed on current report; comparison remains factual numerical delta.`;
          }
        }

        comparisons.push({
          test: curr.test_name,
          current: {
            value: curr.value,
            unit: curr.unit,
            date: currentReport.report_meta?.collection_date || currentReport.report_meta?.report_date || "Current",
            range: curr.reference_range ? curr.reference_range.text : "None printed",
            interpretation: currInterp
          },
          previous: {
            value: prev.value,
            unit: prev.unit,
            date: previousReport.report_meta?.collection_date || previousReport.report_meta?.report_date || "Previous",
            range: prev.reference_range ? prev.reference_range.text : "None printed",
            interpretation: prevInterp
          },
          delta: delta,
          direction: direction,
          status_change: statusChange,
          note: note
        });
      }
    });

    return comparisons;
  }
};
