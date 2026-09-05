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
        this.patients = JSON.parse(saved);
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
    return this.patients.find(p => p.id === this.activePatientId);
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
    return window.MedLensMergeEngine.createUnifiedRecord(pat.patient_info, pat.reports);
  },

  getVerificationItems: function() {
    const pat = this.getActivePatient();
    if (!pat || !pat.reports || pat.reports.length === 0) return [];
    // Get latest report
    const latestRep = pat.reports[pat.reports.length - 1];
    return window.MedLensVerificationEngine.initVerificationItems(latestRep.tests || []);
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
    return window.MedLensSummaryEngine.generateSummary(pat.patient_info, pat.reports, merged);
  },

  resetToSampleData: function() {
    localStorage.removeItem("medlens_patients_v1");
    this.patients = JSON.parse(JSON.stringify(window.MEDLENS_SAMPLE_DATA));
    this.activePatientId = this.patients[0].id;
    this.notify();
  }
};
