// MedLens Central State Management & Persistence Store

window.MedLensState = {
  activePatientId: "pat_sarah_jenkins",
  patients: [],
  activeTab: "dashboard", // "dashboard", "intake", "ocr", "record", "verification", "comparison", "summary"
  listeners: [],

  init: function() {
    // Load from LocalStorage if exists, otherwise fallback to sample data
    const saved = localStorage.getItem("medlens_patients_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.patients = parsed;
        } else {
          this.patients = JSON.parse(JSON.stringify(window.MEDLENS_SAMPLE_DATA));
        }
      } catch(e) {
        console.error("Failed to parse saved MedLens state, loading sample data", e);
        this.patients = JSON.parse(JSON.stringify(window.MEDLENS_SAMPLE_DATA));
      }
    } else {
      this.patients = JSON.parse(JSON.stringify(window.MEDLENS_SAMPLE_DATA));
    }

    if (!this.getActivePatient()) {
      this.activePatientId = this.patients[0]?.id || "";
    }
  },

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  notify: function() {
    this.saveState();
    this.listeners.forEach(fn => fn(this));
  },

  saveState: function() {
    try {
      localStorage.setItem("medlens_patients_v1", JSON.stringify(this.patients));
    } catch(e) {
      console.error("Could not save to LocalStorage", e);
    }
  },

  getActivePatient: function() {
    return this.patients.find(p => p.id === this.activePatientId) || this.patients[0];
  },

  setActivePatient: function(patientId) {
    this.activePatientId = patientId;
    this.notify();
  },

  setActiveTab: function(tabName) {
    this.activeTab = tabName;
    this.notify();
  },

  createPatient: function(name, rawIntake) {
    const processed = window.MedLensIntakeEngine.processIntake(rawIntake);
    const newId = "pat_" + Date.now();
    const newPat = {
      id: newId,
      name: name || "New Patient",
      patient_info: processed.patient,
      reports: []
    };
    this.patients.push(newPat);
    this.activePatientId = newId;
    this.notify();
    return newPat;
  },

  updateIntake: function(patientId, updatedInfo) {
    const pat = this.patients.find(p => p.id === patientId);
    if (pat) {
      const processed = window.MedLensIntakeEngine.processIntake(updatedInfo);
      pat.patient_info = processed.patient;
      this.notify();
    }
  },

  addReportToPatient: function(patientId, reportText, fileName) {
    const pat = this.patients.find(p => p.id === patientId);
    if (!pat) return null;

    const extractedReport = window.MedLensReportParser.parseReport(reportText, fileName);
    extractedReport.id = "rep_" + Date.now();
    extractedReport.report_meta.patient_name = pat.name;
    extractedReport.verification_items = window.MedLensVerificationEngine.initVerificationItems(extractedReport.tests || []);

    pat.reports.push(extractedReport);
    this.notify();
    return extractedReport;
  },

  deleteReport: function(patientId, reportId) {
    const pat = this.patients.find(p => p.id === patientId);
    if (pat) {
      pat.reports = pat.reports.filter(r => r.id !== reportId);
      this.notify();
    }
  },

  getMergedRecord: function() {
    const pat = this.getActivePatient();
    if (!pat) return null;
    return window.MedLensMergeEngine.createUnifiedRecord(pat.patient_info, pat.reports || []);
  },

  getVerificationItems: function() {
    const pat = this.getActivePatient();
    if (!pat || !pat.reports || pat.reports.length === 0) return [];
    // Get latest report
    const latestRep = pat.reports[pat.reports.length - 1];
    if (!latestRep.verification_items || latestRep.verification_items.length === 0) {
      latestRep.verification_items = window.MedLensVerificationEngine.initVerificationItems(latestRep.tests || []);
    }
    return latestRep.verification_items;
  },

  applyVerificationAction: function(itemId, action, edits = {}) {
    const verifItems = this.getVerificationItems();
    const item = verifItems.find(i => i.id === itemId);
    if (item) {
      window.MedLensVerificationEngine.applyAction(item, action, edits);
      
      // Update the extracted test value in report tests if corrected
      if (action === 'correct' && edits.corrected_value != null) {
        const pat = this.getActivePatient();
        const latestRep = pat?.reports?.[pat.reports.length - 1];
        if (latestRep) {
          const test = (latestRep.tests || []).find(t => t.test_name === item.test_name);
          if (test) {
            test.value = edits.corrected_value;
            // Recalculate interpretation if range exists
            if (test.reference_range && test.reference_range.high) {
              if (test.value > test.reference_range.high) test.interpretation = 'high';
              else if (test.value < test.reference_range.low) test.interpretation = 'low';
              else test.interpretation = 'normal';
            }
          }
        }
      }

      this.notify();
    }
    return item;
  },

  getComparisonData: function() {
    const pat = this.getActivePatient();
    if (!pat || !pat.reports || pat.reports.length < 2) return [];
    const sorted = [...pat.reports].sort((a, b) => {
      const dA = new Date(a.report_meta?.collection_date || a.report_meta?.report_date || "2000-01-01");
      const dB = new Date(b.report_meta?.collection_date || b.report_meta?.report_date || "2000-01-01");
      return dA - dB;
    });
    return window.MedLensComparisonEngine.compareReports(sorted[sorted.length - 1], sorted[sorted.length - 2]);
  },

  getSummaryData: function() {
    const pat = this.getActivePatient();
    if (!pat) return null;
    const merged = this.getMergedRecord();
    return window.MedLensSummaryEngine.generateSummary(pat.patient_info, pat.reports || [], merged);
  },

  resetToSampleData: function() {
    localStorage.removeItem("medlens_patients_v1");
    this.patients = JSON.parse(JSON.stringify(window.MEDLENS_SAMPLE_DATA));
    this.activePatientId = this.patients[0].id;
    this.notify();
  }
};
