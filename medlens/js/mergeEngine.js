// MedLens Structured Record Merge & Unified Timeline Engine

window.MedLensMergeEngine = {
  /**
   * Merges patient intake JSON and reports array into a unified structured medical record.
   * @param {Object} patientIntake - Patient intake object ({ patient: ... })
   * @param {Array} reports - Array of extracted report objects
   * @returns {Object} Unified Structured Medical Record
   */
  createUnifiedRecord: function(patientIntake, reports) {
    const patient = patientIntake?.patient || patientIntake || {};
    const reportsList = Array.isArray(reports) ? reports : [];

    // 1. Build Timeline of Events
    const timeline = [];

    // Add Patient Intake event
    timeline.push({
      date: patient.dob?.value || "Current",
      type: "Patient Intake",
      title: "Patient Profile & Intake Form Registered",
      summary: `${patient.age?.value || 'N/A'}y/o ${patient.sex?.value || 'Patient'}, ${patient.conditions?.length || 0} active conditions, ${patient.allergies?.length || 0} allergies.`,
      source: "user_provided",
      source_link: "intake_form"
    });

    // Add Surgeries to Timeline
    if (Array.isArray(patient.surgeries)) {
      patient.surgeries.forEach(s => {
        timeline.push({
          date: s.year ? `${s.year}-01-01` : "Past",
          type: "Surgical History",
          title: s.procedure,
          summary: `Surgical procedure recorded for year ${s.year || 'unspecified'}.`,
          source: "user_provided",
          source_link: "intake_surgeries"
        });
      });
    }

    // Add Lab Reports to Timeline
    reportsList.forEach(rep => {
      const meta = rep.report_meta || {};
      const abnormalCount = (rep.tests || []).filter(t => t.interpretation === 'low' || t.interpretation === 'high').length;
      timeline.push({
        date: meta.collection_date || meta.report_date || "2026-08-10",
        type: "Laboratory Report",
        title: meta.lab_name || "Diagnostic Laboratory Report",
        summary: `Processed ${(rep.tests || []).length} lab tests (${abnormalCount} abnormal values flagged).`,
        source: "ai_extracted",
        source_link: meta.file_name || rep.id || "report_source"
      });
    });

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Group & Deduplicate Lab Tests with Trend Analysis
    const testGroups = {};

    // Sort reports by collection date ascending so we can build trends chronologically
    const sortedReports = [...reportsList].sort((a, b) => {
      const dA = new Date(a.report_meta?.collection_date || a.report_meta?.report_date || "2000-01-01");
      const dB = new Date(b.report_meta?.collection_date || b.report_meta?.report_date || "2000-01-01");
      return dA - dB;
    });

    sortedReports.forEach(rep => {
      const reportDate = rep.report_meta?.collection_date || rep.report_meta?.report_date || "2026-08-10";
      const labName = rep.report_meta?.lab_name || "Diagnostic Lab";

      (rep.tests || []).forEach(test => {
        const key = test.test_name.toLowerCase().trim();

        if (!testGroups[key]) {
          testGroups[key] = {
            test_name: test.test_name,
            category: test.source?.section || "General Labs",
            unit: test.unit,
            history: [],
            latest: null,
            trend_direction: "steady", // "up", "down", "steady"
            delta: null,
            has_missing_range: false
          };
        }

        const entry = {
          date: reportDate,
          value: test.value,
          unit: test.unit,
          reference_range: test.reference_range,
          interpretation: test.interpretation,
          lab_name: labName,
          snippet: test.source?.snippet,
          confidence: test.confidence,
          source_provenance: "ai_extracted"
        };

        // Avoid duplicate entry on same date with identical value
        const existingOnDate = testGroups[key].history.find(h => h.date === reportDate && h.value === test.value);
        if (!existingOnDate) {
          testGroups[key].history.push(entry);
        }

        if (test.reference_range === null) {
          testGroups[key].has_missing_range = true;
        }
      });
    });

    // Compute trends and latest values
    Object.values(testGroups).forEach(group => {
      // Sort history by date ascending
      group.history.sort((a, b) => new Date(a.date) - new Date(b.date));
      group.latest = group.history[group.history.length - 1];

      if (group.history.length >= 2) {
        const prev = group.history[group.history.length - 2];
        const latestVal = group.latest.value;
        const prevVal = prev.value;

        if (typeof latestVal === 'number' && typeof prevVal === 'number') {
          const diff = parseFloat((latestVal - prevVal).toFixed(2));
          group.delta = diff;
          if (diff > 0.05) group.trend_direction = "up";
          else if (diff < -0.05) group.trend_direction = "down";
          else group.trend_direction = "steady";
        }
      }
    });

    // 3. Compile Data Quality Flags
    const dataQualityFlags = [];
    if (patient.missing_critical_fields?.length > 0) {
      dataQualityFlags.push({
        type: "missing_fields",
        message: `Missing critical patient demographic/intake fields: ${patient.missing_critical_fields.join(', ')}`
      });
    }

    reportsList.forEach(rep => {
      (rep.inconsistencies || []).forEach(inc => {
        dataQualityFlags.push({
          type: "inconsistency",
          message: `Inconsistency in ${rep.report_meta?.lab_name}: ${inc}`
        });
      });

      (rep.tests || []).forEach(t => {
        if (t.confidence === 'low' || t.confidence === 'medium') {
          dataQualityFlags.push({
            type: "low_confidence",
            message: `Extraction confidence for test '${t.test_name}' is ${t.confidence.toUpperCase()}`
          });
        }
      });
    });

    return {
      patient_overview: patient,
      timeline: timeline,
      lab_test_groups: Object.values(testGroups),
      reports_count: reportsList.length,
      data_quality_flags: dataQualityFlags,
      provenance_summary: {
        user_provided_count: (patient.conditions?.length || 0) + (patient.allergies?.length || 0) + (patient.medications?.length || 0),
        ai_extracted_count: reportsList.reduce((acc, r) => acc + (r.tests?.length || 0), 0),
        ai_generated_count: 1
      }
    };
  }
};
