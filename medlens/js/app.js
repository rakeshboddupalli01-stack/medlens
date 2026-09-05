// MedLens Main UI Controller & View Renderer

document.addEventListener("DOMContentLoaded", function() {
  window.MedLensState.init();
  window.MedLensApp.init();
});

window.MedLensApp = {
  init: function() {
    this.bindGlobalEvents();
    this.renderHeader();
    this.renderSidebar();
    this.renderCurrentView();

    // Subscribe to state updates
    window.MedLensState.subscribe(() => {
      this.renderHeader();
      this.renderCurrentView();
    });
  },

  bindGlobalEvents: function() {
    // Theme toggle
    const themeBtn = document.getElementById("btn-toggle-theme");
    if (themeBtn) {
      themeBtn.onclick = () => {
        const body = document.body;
        const current = body.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", next);
        themeBtn.textContent = next === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
      };
    }

    // New patient button
    const newPatBtn = document.getElementById("btn-new-patient");
    if (newPatBtn) {
      newPatBtn.onclick = () => {
        const name = prompt("Enter new patient full name:", "Jane Doe");
        if (name && name.trim()) {
          window.MedLensState.createPatient(name.trim(), {});
          window.MedLensState.setActiveTab("intake");
        }
      };
    }

    // Reset data button
    const resetBtn = document.getElementById("btn-reset-data");
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm("Reset MedLens state to default pre-loaded sample patient records?")) {
          window.MedLensState.resetToSampleData();
        }
      };
    }
  },

  renderHeader: function() {
    const patSelect = document.getElementById("patient-select");
    if (!patSelect) return;

    patSelect.innerHTML = "";
    (window.MedLensState.patients || []).forEach(pat => {
      const opt = document.createElement("option");
      opt.value = pat.id;
      opt.textContent = `${pat.name} (${pat.patient_info?.age?.value || 'N/A'}y/o ${pat.patient_info?.sex?.value || ''})`;
      if (pat.id === window.MedLensState.activePatientId) {
        opt.selected = true;
      }
      patSelect.appendChild(opt);
    });

    patSelect.onchange = (e) => {
      window.MedLensState.setActivePatient(e.target.value);
    };
  },

  renderSidebar: function() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      const tab = item.getAttribute("data-tab");
      if (tab === window.MedLensState.activeTab) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }

      item.onclick = (e) => {
        e.preventDefault();
        window.MedLensState.setActiveTab(tab);
        navItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
      };
    });
  },

  renderCurrentView: function() {
    const main = document.getElementById("view-container");
    if (!main) return;

    const activeTab = window.MedLensState.activeTab;
    const pat = window.MedLensState.getActivePatient();

    if (!pat) {
      main.innerHTML = `<div class="card"><h3>No Patient Selected</h3><p>Please select or create a patient.</p></div>`;
      return;
    }

    switch (activeTab) {
      case "dashboard":
        this.renderDashboardView(main, pat);
        break;
      case "intake":
        this.renderIntakeView(main, pat);
        break;
      case "ocr":
        this.renderReportOCRView(main, pat);
        break;
      case "record":
        this.renderStructuredRecordView(main, pat);
        break;
      case "verification":
        this.renderVerificationView(main, pat);
        break;
      case "comparison":
        this.renderComparisonView(main, pat);
        break;
      case "summary":
        this.renderSummaryView(main, pat);
        break;
      default:
        this.renderDashboardView(main, pat);
    }
  },

  /* ---------------- DASHBOARD VIEW ---------------- */
  renderDashboardView: function(container, pat) {
    const merged = window.MedLensState.getMergedRecord() || {};
    const reports = pat.reports || [];
    const latestRep = reports[reports.length - 1];

    let totalTests = 0;
    let abnormalTests = 0;
    (reports || []).forEach(r => {
      (r.tests || []).forEach(t => {
        totalTests++;
        if (t.interpretation === 'low' || t.interpretation === 'high') abnormalTests++;
      });
    });

    container.innerHTML = `
      <div class="safety-banner">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <div>
          <strong>MedLens Clinical Intelligence Safety Notice:</strong> All laboratory reference ranges are preserved verbatim from source reports. MedLens organizes medical data for review and does NOT provide medical diagnosis or treatment recommendations.
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Patient Profile</span>
            <span class="badge badge-user">Intake Verified</span>
          </div>
          <h2 style="font-size:1.3rem; margin-bottom:0.5rem;">${pat.name}</h2>
          <p style="color:var(--text-muted); font-size:0.875rem;">Age: <strong>${pat.patient_info?.age?.value || 'N/A'}</strong> | Sex: <strong>${pat.patient_info?.sex?.value || 'N/A'}</strong></p>
          <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.25rem;">DOB: <strong>${pat.patient_info?.dob?.value || 'N/A'}</strong></p>

          <div style="margin-top:1rem; border-top:1px solid var(--border-color); padding-top:0.75rem;">
            <div style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">ACTIVE CONDITIONS</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.4rem;">
              ${(pat.patient_info?.conditions || []).map(c => `<span class="badge badge-unknown">${typeof c === 'string' ? c : c.name} (${c.diagnosed_year || 'History'})</span>`).join('') || '<span style="font-size:0.8rem; color:var(--text-muted)">None listed</span>'}
            </div>
          </div>

          <div style="margin-top:0.75rem;">
            <div style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">KNOWN ALLERGIES</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.4rem;">
              ${(pat.patient_info?.allergies || []).map(a => `<span class="badge badge-high">${typeof a === 'string' ? a : a.substance + ': ' + (a.reaction || 'Reported')}</span>`).join('') || '<span style="font-size:0.8rem; color:var(--text-muted)">No known allergies</span>'}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Clinical Record Stats</span>
            <span class="badge badge-ai-extracted">${reports.length} Reports Loaded</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.5rem;">
            <div style="background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); text-align:center;">
              <div style="font-size:1.8rem; font-weight:800; color:var(--accent-cyan);">${totalTests}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">TOTAL EXTRACTED TESTS</div>
            </div>
            <div style="background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); text-align:center;">
              <div style="font-size:1.8rem; font-weight:800; color:var(--accent-rose);">${abnormalTests}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">OUT-OF-RANGE VALUES</div>
            </div>
          </div>

          <div style="margin-top:1rem; font-size:0.85rem;">
            <div style="font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">PROVENANCE SUMMARY</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
              <span>User-Provided Data Points:</span>
              <span class="badge badge-user">${merged.provenance_summary?.user_provided_count || 0}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
              <span>AI-Extracted Lab Values:</span>
              <span class="badge badge-ai-extracted">${merged.provenance_summary?.ai_extracted_count || 0}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>AI Safety Summaries:</span>
              <span class="badge badge-ai-generated">1</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Intake Data Quality & Clarifications</span>
            <span class="badge badge-low">${(pat.patient_info?.clarification_questions || []).length} Open Questions</span>
          </div>
          ${(pat.patient_info?.clarification_questions || []).length > 0 ? `
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">Targeted clarification questions generated for clinician/patient review:</div>
            <ul style="padding-left:1.2rem; font-size:0.85rem; line-height:1.5;">
              ${(pat.patient_info?.clarification_questions || []).map(q => `<li style="margin-bottom:0.4rem; color:var(--text-main);">${q}</li>`).join('')}
            </ul>
          ` : `<p style="font-size:0.85rem; color:var(--accent-emerald);">All critical patient intake fields are complete.</p>`}
        </div>
      </div>

      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Latest Laboratory Panel Highlights</span>
          <button class="btn btn-secondary btn-sm" onclick="window.MedLensState.setActiveTab('record')">View Full Record →</button>
        </div>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result Value</th>
                <th>Verbatim Reference Range</th>
                <th>Status</th>
                <th>Source Provenance</th>
              </tr>
            </thead>
            <tbody>
              ${(latestRep?.tests || []).map(t => `
                <tr>
                  <td><strong>${t.test_name}</strong></td>
                  <td>${t.value} ${t.unit}</td>
                  <td><code>${t.reference_range ? t.reference_range.text : 'None Printed (null)'}</code></td>
                  <td><span class="badge badge-${t.interpretation || 'unknown'}">${(t.interpretation || 'unknown').toUpperCase()}</span></td>
                  <td><span class="badge badge-ai-extracted">Page ${t.source?.page || 1}: ${t.source?.section || 'Lab'}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="5">No reports processed yet. Upload a lab report in OCR Processing view.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ---------------- INTAKE FORM VIEW ---------------- */
  renderIntakeView: function(container, pat) {
    const info = pat.patient_info || {};

    const formatArray = (arr, key) => {
      if (!Array.isArray(arr)) return "";
      return arr.map(item => typeof item === 'string' ? item : (item[key] || item.text || item.name || item.substance || String(item))).join(', ');
    };

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Patient Intake & Demographic Form</span>
          <span class="badge badge-user">Source: User Provided</span>
        </div>
        <form id="form-patient-intake">
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" name="name" value="${pat.name}">
            </div>
            <div class="form-group">
              <label>Age</label>
              <input type="number" class="form-control" name="age" value="${info.age?.value || ''}">
            </div>
            <div class="form-group">
              <label>Biological Sex</label>
              <select class="form-control" name="sex">
                <option value="Female" ${info.sex?.value === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Male" ${info.sex?.value === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Other" ${info.sex?.value === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Date of Birth (YYYY-MM-DD)</label>
              <input type="text" class="form-control" name="dob" value="${info.dob?.value || ''}" placeholder="1978-04-12">
            </div>
            <div class="form-group">
              <label>Contact Phone / Email</label>
              <input type="text" class="form-control" name="phone" value="${info.contact?.phone || ''}" placeholder="+1 (555) 000-0000">
            </div>
          </div>

          <div class="form-group">
            <label>Current Symptoms (comma separated)</label>
            <textarea class="form-control" name="symptoms" rows="2">${formatArray(info.symptoms, 'text')}</textarea>
          </div>

          <div class="form-group">
            <label>Existing Medical Conditions (comma separated)</label>
            <textarea class="form-control" name="conditions" rows="2">${formatArray(info.conditions, 'name')}</textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Known Allergies (comma separated)</label>
              <input type="text" class="form-control" name="allergies" value="${formatArray(info.allergies, 'substance')}">
            </div>
            <div class="form-group">
              <label>Current Medications & Dosages (comma separated)</label>
              <input type="text" class="form-control" name="medications" value="${formatArray(info.medications, 'name')}">
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Save & Normalize Intake Data</button>
        </form>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Critical Missing Field Auditor</span>
          </div>
          ${(info.missing_critical_fields || []).length > 0 ? `
            <div class="badge badge-high" style="margin-bottom:0.75rem;">${info.missing_critical_fields.length} Missing Critical Fields</div>
            <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--accent-rose);">
              ${info.missing_critical_fields.map(m => `<li style="margin-bottom:0.3rem;">${m}</li>`).join('')}
            </ul>
          ` : `<p style="font-size:0.85rem; color:var(--accent-emerald);">✓ All required critical fields (DOB, Sex, Allergies, Meds) are populated.</p>`}
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Clarification Question Generator</span>
            <span class="badge badge-ai-gen">Max 3 Concise Questions</span>
          </div>
          <ul style="padding-left:1.2rem; font-size:0.85rem; line-height:1.5;">
            ${(info.clarification_questions || []).map(q => `<li style="margin-bottom:0.4rem;">${q}</li>`).join('') || '<li>No open clarification questions needed.</li>'}
          </ul>
        </div>
      </div>
    `;

    document.getElementById("form-patient-intake").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const updated = {
        age: fd.get("age"),
        sex: fd.get("sex"),
        dob: fd.get("dob"),
        symptoms: fd.get("symptoms").split(',').map(s => s.trim()).filter(Boolean),
        conditions: fd.get("conditions").split(',').map(c => c.trim()).filter(Boolean),
        allergies: fd.get("allergies").split(',').map(a => a.trim()).filter(Boolean),
        medications: fd.get("medications").split(',').map(m => m.trim()).filter(Boolean),
        contact: { phone: fd.get("phone") }
      };

      pat.name = fd.get("name") || pat.name;
      window.MedLensState.updateIntake(pat.id, updated);
      alert("Patient intake data normalized & saved successfully!");
    };
  },

  /* ---------------- MEDICAL REPORT OCR VIEW ---------------- */
  renderReportOCRView: function(container, pat) {
    const reports = pat.reports || [];

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Medical Report Processing & OCR Extraction</span>
          <span class="badge badge-ai-extracted">Verbatim Reference-Range Engine</span>
        </div>
        
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
          Upload a PDF/Image lab report or paste raw text below. MedLens extracts test names, numeric values, units, and <strong>verbatim reference ranges</strong>. Missing reference ranges are set to <code>null</code> without guessing.
        </p>

        <form id="form-upload-report">
          <div class="form-group">
            <label>Upload File (PDF / TXT / Image)</label>
            <input type="file" class="form-control" id="file-report-input" accept=".pdf,.txt,.png,.jpg,.jpeg">
          </div>

          <div class="form-group">
            <label>Or Paste Raw Medical Report Text / OCR Content</label>
            <textarea class="form-control" id="text-report-input" rows="8" placeholder="Paste laboratory test report content here..."></textarea>
          </div>

          <div style="display:flex; gap:1rem;">
            <button type="submit" class="btn btn-primary">Process & Extract Report Data</button>
            <button type="button" class="btn btn-secondary" id="btn-load-sample-ocr">Load Sample Lab Report Text</button>
          </div>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Processed Laboratory Reports (${reports.length})</span>
        </div>

        ${reports.map(rep => `
          <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <div>
                <strong>${rep.report_meta?.lab_name || 'Lab Report'}</strong>
                <span style="font-size:0.8rem; color:var(--text-muted); margin-left:0.5rem;">Date: ${rep.report_meta?.collection_date || 'Unknown'} | MRN: ${rep.report_meta?.patient_id || 'N/A'}</span>
              </div>
              <button class="btn btn-danger btn-sm" onclick="window.MedLensState.deleteReport('${pat.id}', '${rep.id}')">Delete</button>
            </div>

            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Result Value</th>
                    <th>Verbatim Reference Range</th>
                    <th>Interpretation</th>
                    <th>Confidence</th>
                    <th>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  ${(rep.tests || []).map(t => `
                    <tr>
                      <td><strong>${t.test_name}</strong></td>
                      <td>${t.value} ${t.unit}</td>
                      <td><code>${t.reference_range ? t.reference_range.text : 'null (None Printed)'}</code></td>
                      <td><span class="badge badge-${t.interpretation || 'unknown'}">${(t.interpretation || 'unknown').toUpperCase()}</span></td>
                      <td><span class="badge badge-user">${(t.confidence || 'high').toUpperCase()}</span></td>
                      <td>${t.flags?.length > 0 ? t.flags.map(f => `<span class="badge badge-high">${f}</span>`).join(' ') : 'None'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('') || '<p style="font-size:0.85rem; color:var(--text-muted);">No lab reports processed yet for this patient.</p>'}
      </div>
    `;

    document.getElementById("btn-load-sample-ocr").onclick = () => {
      document.getElementById("text-report-input").value = `METRO DIAGNOSTIC PATHOLOGY REPORT
Patient Name: ${pat.name} | Collection Date: 2026-09-01
COMPLETE BLOOD COUNT & METABOLIC PANEL
Hemoglobin             10.8 g/dL (12.0–16.0) LOW
Glucose, Fasting       138 mg/dL (70–99) HIGH
HbA1c (Glycated Hb)    7.1 % (4.0–5.6) HIGH
TSH (Thyrotropin)      4.9 uIU/mL (0.4–4.2) HIGH
Vitamin D 25-OH        22 ng/mL (30–100) LOW
Serum Creatinine       1.0 mg/dL (0.6–1.1) NORMAL
Vitamin B12            380 pg/mL None Printed UNKNOWN`;
    };

    document.getElementById("form-upload-report").onsubmit = (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("file-report-input");
      const textInput = document.getElementById("text-report-input").value;

      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          window.MedLensState.addReportToPatient(pat.id, evt.target.result, file.name);
          alert(`Report file '${file.name}' extracted successfully!`);
        };
        reader.readAsText(file);
      } else if (textInput.trim()) {
        window.MedLensState.addReportToPatient(pat.id, textInput, "Pasted_Report.txt");
        alert("Pasted report content extracted successfully!");
      } else {
        alert("Please select a file or paste report text first.");
      }
    };
  },

  /* ---------------- STRUCTURED RECORD & TIMELINE VIEW ---------------- */
  renderStructuredRecordView: function(container, pat) {
    const merged = window.MedLensState.getMergedRecord() || {};

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Structured Medical Record & Chronological Timeline</span>
          <div>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Export PDF / Print</button>
          </div>
        </div>

        <div style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1rem;">
          Unified patient medical record combining user intake details and multi-report laboratory findings with provenance tracking.
        </div>

        <div class="view-tabs">
          <div class="view-tab active" id="tab-btn-timeline">Chronological Timeline</div>
          <div class="view-tab" id="tab-btn-labs">Laboratory Panels & Trends</div>
          <div class="view-tab" id="tab-btn-flags">Data Quality & Inconsistencies</div>
        </div>

        <div id="subview-timeline" class="subview-content">
          <div class="timeline">
            ${(merged.timeline || []).map(item => `
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="timeline-date">${item.date}</span>
                    <span class="badge badge-${item.source === 'user_provided' ? 'user' : 'ai-extracted'}">${item.source}</span>
                  </div>
                  <div class="timeline-title">${item.title}</div>
                  <div class="timeline-summary">${item.summary}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="subview-labs" class="subview-content" style="display:none;">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Latest Value</th>
                  <th>Trend Arrow</th>
                  <th>Reference Range (Verbatim)</th>
                  <th>Historical Count</th>
                  <th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                ${(merged.lab_test_groups || []).map(group => {
                  let trendIcon = '<span class="trend-arrow-steady">→</span>';
                  if (group.trend_direction === 'up') trendIcon = '<span class="trend-arrow-up">↑ (+ ' + group.delta + ')</span>';
                  else if (group.trend_direction === 'down') trendIcon = '<span class="trend-arrow-down">↓ (' + group.delta + ')</span>';

                  return `
                    <tr>
                      <td><strong>${group.test_name}</strong></td>
                      <td>${group.category}</td>
                      <td>${group.latest?.value} ${group.unit}</td>
                      <td>${trendIcon}</td>
                      <td><code>${group.latest?.reference_range ? group.latest.reference_range.text : 'null'}</code></td>
                      <td>${group.history.length} visit(s)</td>
                      <td><span class="badge badge-ai-extracted">ai_extracted</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div id="subview-flags" class="subview-content" style="display:none;">
          ${(merged.data_quality_flags || []).length > 0 ? `
            <div class="dashboard-grid">
              ${merged.data_quality_flags.map(f => `
                <div class="card" style="border-left:4px solid var(--accent-rose);">
                  <div class="badge badge-high" style="margin-bottom:0.5rem;">${f.type.toUpperCase()}</div>
                  <p style="font-size:0.875rem; color:var(--text-main);">${f.message}</p>
                </div>
              `).join('')}
            </div>
          ` : `<p style="font-size:0.875rem; color:var(--accent-emerald);">No data quality issues or low confidence items detected.</p>`}
        </div>
      </div>
    `;

    // Subview tabs switcher
    const tabTimeline = document.getElementById("tab-btn-timeline");
    const tabLabs = document.getElementById("tab-btn-labs");
    const tabFlags = document.getElementById("tab-btn-flags");

    const viewTimeline = document.getElementById("subview-timeline");
    const viewLabs = document.getElementById("subview-labs");
    const viewFlags = document.getElementById("subview-flags");

    tabTimeline.onclick = () => {
      tabTimeline.classList.add("active");
      tabLabs.classList.remove("active");
      tabFlags.classList.remove("active");
      viewTimeline.style.display = "block";
      viewLabs.style.display = "none";
      viewFlags.style.display = "none";
    };

    tabLabs.onclick = () => {
      tabLabs.classList.add("active");
      tabTimeline.classList.remove("active");
      tabFlags.classList.remove("active");
      viewLabs.style.display = "block";
      viewTimeline.style.display = "none";
      viewFlags.style.display = "none";
    };

    tabFlags.onclick = () => {
      tabFlags.classList.add("active");
      tabTimeline.classList.remove("active");
      tabLabs.classList.remove("active");
      viewFlags.style.display = "block";
      viewTimeline.style.display = "none";
      viewLabs.style.display = "none";
    };
  },

  /* ---------------- HUMAN VERIFICATION VIEW ---------------- */
  renderVerificationView: function(container, pat) {
    const verifItems = window.MedLensState.getVerificationItems();

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Human Verification & Side-by-Side Review Drawer</span>
          <span class="badge badge-user">Audit Trail Active</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">
          Compare extracted structured data fields against original source report snippets. Verify, edit, or flag items for human review with automatic audit logging.
        </p>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Source Snippet vs Extracted Value</th>
                <th>Confidence</th>
                <th>Action State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${verifItems.map(item => `
                <tr>
                  <td><strong>${item.field}</strong></td>
                  <td>
                    <div style="font-size:0.75rem; color:var(--text-muted);">SOURCE: <code>"${item.source_snippet}"</code></div>
                    <div style="font-size:0.9rem; font-weight:700; color:var(--accent-cyan); margin-top:0.2rem;">EXTRACTED: ${item.corrected_value != null ? item.corrected_value : item.extracted_value} ${item.unit}</div>
                  </td>
                  <td><span class="badge badge-user">${(item.confidence || 'high').toUpperCase()}</span></td>
                  <td>
                    ${item.human_action === 'accepted' ? '<span class="badge badge-normal">ACCEPTED</span>' : ''}
                    ${item.human_action === 'corrected' ? '<span class="badge badge-high">CORRECTED</span>' : ''}
                    ${item.human_action === 'flagged' ? '<span class="badge badge-low">FLAGGED</span>' : ''}
                    ${!item.human_action ? '<span class="badge badge-unknown">UNREVIEWED</span>' : ''}
                  </td>
                  <td>
                    <div style="display:flex; gap:0.4rem;">
                      <button class="btn btn-success btn-sm" onclick="window.MedLensApp.verifyAction('${item.id}', 'accept')">Accept</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.MedLensApp.verifyAction('${item.id}', 'correct')">Correct</button>
                      <button class="btn btn-danger btn-sm" onclick="window.MedLensApp.verifyAction('${item.id}', 'flag')">Flag</button>
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="5">No extracted tests available for review. Upload a report in OCR Processing.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  verifyAction: function(itemId, action) {
    const verifItems = window.MedLensState.getVerificationItems();
    const item = verifItems.find(i => i.id === itemId);
    if (!item) return;

    if (action === 'correct') {
      const currentVal = item.corrected_value != null ? item.corrected_value : item.extracted_value;
      const newVal = prompt(`Enter corrected value for ${item.field}:`, currentVal);
      if (newVal != null && !isNaN(parseFloat(newVal))) {
        window.MedLensState.applyVerificationAction(itemId, 'correct', { corrected_value: parseFloat(newVal), reason: "Manual clinician correction" });
        alert(`Field ${item.field} updated to ${newVal}. Audit log recorded.`);
        this.renderCurrentView();
      }
    } else if (action === 'accept') {
      window.MedLensState.applyVerificationAction(itemId, 'accept');
      alert(`Verified ${item.field} as correct.`);
      this.renderCurrentView();
    } else if (action === 'flag') {
      window.MedLensState.applyVerificationAction(itemId, 'flag', { reason: "Requires second reviewer" });
      alert(`Flagged ${item.field} for review.`);
      this.renderCurrentView();
    }
  },

  /* ---------------- REPORT COMPARISON VIEW ---------------- */
  renderComparisonView: function(container, pat) {
    const comparisons = window.MedLensState.getComparisonData();

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">Report Comparison & Delta Tracking Engine</span>
          <span class="badge badge-ai-extracted">Multi-Visit Delta</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">
          Compares current report against previous historical reports for the same patient. Delta values and direction arrows are calculated while preserving each report's verbatim reference range.
        </p>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Analyte / Test</th>
                <th>Current Visit (${comparisons[0]?.current?.date || 'Latest'})</th>
                <th>Previous Visit (${comparisons[0]?.previous?.date || 'Prior'})</th>
                <th>Delta & Direction</th>
                <th>Status Transition</th>
                <th>Factual Observation Note</th>
              </tr>
            </thead>
            <tbody>
              ${comparisons.map(c => {
                let dirBadge = '<span class="trend-arrow-steady">→ (0)</span>';
                if (c.direction === 'up') dirBadge = `<span class="trend-arrow-up">↑ (+${c.delta})</span>`;
                else if (c.direction === 'down') dirBadge = `<span class="trend-arrow-down">↓ (${c.delta})</span>`;

                return `
                  <tr>
                    <td><strong>${c.test}</strong></td>
                    <td>
                      <div><strong>${c.current.value} ${c.current.unit}</strong></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">Range: <code>${c.current.range}</code></div>
                    </td>
                    <td>
                      <div><strong>${c.previous.value} ${c.previous.unit}</strong></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">Range: <code>${c.previous.range}</code></div>
                    </td>
                    <td>${dirBadge}</td>
                    <td><span class="badge badge-${c.status_change.includes('high') ? 'high' : 'normal'}">${c.status_change}</span></td>
                    <td style="font-size:0.8rem;">${c.note}</td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="6">At least 2 laboratory reports are required to perform comparative delta tracking.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ---------------- AI SUMMARY & SAFETY SCREENER VIEW ---------------- */
  renderSummaryView: function(container, pat) {
    const summaryData = window.MedLensState.getSummaryData() || {};
    const audit = summaryData?.safety_audit || {};

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <span class="card-title">AI Patient-Friendly Summary</span>
          <span class="badge badge-ai-gen">Word Count: ${summaryData?.word_count || 0}</span>
        </div>

        <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; font-size:0.95rem; line-height:1.7; color:var(--text-main); white-space:pre-wrap; margin-bottom:1.25rem;">
${summaryData?.text || 'No summary available.'}
        </div>

        <div class="dashboard-grid">
          <div class="card" style="background:rgba(16, 185, 129, 0.05); border:1px solid var(--status-normal-border);">
            <div class="card-header">
              <span class="card-title" style="color:var(--accent-emerald);">AI Safety Guardrail Audit</span>
              <span class="badge badge-${audit.safe ? 'normal' : 'high'}">${audit.safe ? 'PASSED 100%' : 'ISSUES REWRITTEN'}</span>
            </div>
            <ul style="font-size:0.85rem; line-height:1.5; color:var(--text-main);">
              <li>✓ Diagnostic Statements: <strong>None detected / Rewritten</strong></li>
              <li>✓ Treatment / Rx Advice: <strong>None detected / Rewritten</strong></li>
              <li>✓ Dosage Changes: <strong>None detected / Rewritten</strong></li>
              <li>✓ Verbatim Reference Range Protection: <strong>Active</strong></li>
            </ul>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Non-Clinical Action Plan</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
              Share this structured summary with your healthcare provider. Your physician will review lab trends, evaluate missing baseline values, and provide clinical guidance.
            </p>
          </div>
        </div>
      </div>
    `;
  }
};
