// MedLens Pre-loaded Sample Patient Profiles & Reports

window.MEDLENS_SAMPLE_DATA = [
  {
    id: "pat_sarah_jenkins",
    name: "Sarah Jenkins",
    patient_info: {
      age: { value: 48, source: "user_provided" },
      sex: { value: "Female", source: "user_provided" },
      dob: { value: "1978-04-12", source: "user_provided" },
      symptoms: [
        { text: "Fatigue & sluggishness", onset: "3 months", source: "user_provided" },
        { text: "Occasional dizziness when standing", onset: "2 weeks", source: "user_provided" }
      ],
      conditions: [
        { name: "Type 2 Diabetes Mellitus", diagnosed_year: 2021, source: "user_provided" },
        { name: "Essential Hypertension", diagnosed_year: 2019, source: "user_provided" },
        { name: "Hypothyroidism", diagnosed_year: 2022, source: "user_provided" }
      ],
      allergies: [
        { substance: "Penicillin", reaction: "Skin rash & pruritus", source: "user_provided" }
      ],
      medications: [
        { name: "Metformin 500mg", frequency: "twice daily with meals", source: "user_provided" },
        { name: "Levothyroxine 75mcg", frequency: "once daily in morning", source: "user_provided" },
        { name: "Amlodipine 5mg", frequency: "once daily in evening", source: "user_provided" }
      ],
      surgeries: [
        { procedure: "Laparoscopic Cholecystectomy", year: 2017, source: "user_provided" }
      ],
      family_history: [
        { relation: "Mother", condition: "Type 2 Diabetes" },
        { relation: "Father", condition: "Hypertension & Myocardial Infarction" }
      ],
      lifestyle: {
        smoking: "Never",
        alcohol: "Occasional (1 glass wine/week)",
        exercise: "Walking 20 mins, 3x/week"
      },
      contact: {
        phone: "+1 (555) 234-5678",
        email: "sarah.j78@example.com"
      },
      missing_critical_fields: [],
      clarification_questions: [
        "Have you missed any doses of Levothyroxine recently?",
        "Are you experiencing any numbness or tingling in your hands or feet?"
      ]
    },
    reports: [
      {
        id: "rep_2026_08_10",
        report_meta: {
          lab_name: "City Central Diagnostics",
          patient_id: "MRN-884920",
          patient_name: "Sarah Jenkins",
          collection_date: "2026-08-10",
          report_date: "2026-08-11",
          source_pages: [1, 2],
          file_name: "LabReport_Aug2026_CityCentral.pdf"
        },
        raw_text: `CITY CENTRAL DIAGNOSTICS - CLINICAL LABORATORY REPORT
Patient Name: Sarah Jenkins | DOB: 04/12/1978 | Sex: F | MRN: MRN-884920
Collection Date: 2026-08-10 08:15 AM | Report Date: 2026-08-11 10:30 AM
Ordering Physician: Dr. Robert Vance, MD

COMPLETE BLOOD COUNT (CBC) & METABOLIC PANEL
Test Name              Result      Unit       Reference Range    Flag
-------------------------------------------------------------------------
Hemoglobin             11.2        g/dL       12.0–16.0          LOW
Hematocrit             34.1        %          36.0–48.0          LOW
WBC Count              6.8         10^3/uL    4.5–11.0           NORMAL
Platelet Count         245         10^3/uL    150–450            NORMAL
Glucose, Fasting       142         mg/dL      70–99              HIGH
HbA1c (Glycated Hb)    7.4         %          4.0–5.6            HIGH
Serum Creatinine       0.9         mg/dL      0.6–1.1            NORMAL
eGFR                   88          mL/min     >60                NORMAL
Sodium                 138         mEq/L      135–145            NORMAL
Potassium              4.2         mEq/L      3.5–5.0            NORMAL

THYROID & VITAMIN PANEL
Test Name              Result      Unit       Reference Range    Flag
-------------------------------------------------------------------------
TSH (Thyrotropin)      4.8         uIU/mL     0.4–4.2            HIGH
Free T4                1.0         ng/dL      0.8–1.8            NORMAL
25-OH Vitamin D        18          ng/mL      30–100             LOW
Vitamin B12            410         pg/mL      None Printed       UNKNOWN

OBSERVATIONS & LAB NOTES:
Fasting status confirmed (10 hours). Hemolyzed sample: No. Vitamin B12 reference range not established on this assay lot.`,
        tests: [
          {
            test_name: "Hemoglobin",
            value: 11.2,
            unit: "g/dL",
            reference_range: { low: 12.0, high: 16.0, text: "12.0–16.0" },
            interpretation: "low",
            specimen: "Whole Blood",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Hematology", snippet: "Hemoglobin 11.2 g/dL (12.0–16.0) LOW" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "Hematocrit",
            value: 34.1,
            unit: "%",
            reference_range: { low: 36.0, high: 48.0, text: "36.0–48.0" },
            interpretation: "low",
            specimen: "Whole Blood",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Hematology", snippet: "Hematocrit 34.1 % (36.0–48.0) LOW" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "WBC Count",
            value: 6.8,
            unit: "10^3/uL",
            reference_range: { low: 4.5, high: 11.0, text: "4.5–11.0" },
            interpretation: "normal",
            specimen: "Whole Blood",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Hematology", snippet: "WBC Count 6.8 10^3/uL (4.5–11.0) NORMAL" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "Glucose, Fasting",
            value: 142,
            unit: "mg/dL",
            reference_range: { low: 70, high: 99, text: "70–99" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Metabolic Panel", snippet: "Glucose, Fasting 142 mg/dL (70–99) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "HbA1c (Glycated Hb)",
            value: 7.4,
            unit: "%",
            reference_range: { low: 4.0, high: 5.6, text: "4.0–5.6" },
            interpretation: "high",
            specimen: "Whole Blood",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Metabolic Panel", snippet: "HbA1c (Glycated Hb) 7.4 % (4.0–5.6) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "Serum Creatinine",
            value: 0.9,
            unit: "mg/dL",
            reference_range: { low: 0.6, high: 1.1, text: "0.6–1.1" },
            interpretation: "normal",
            specimen: "Serum",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 1, section: "Metabolic Panel", snippet: "Serum Creatinine 0.9 mg/dL (0.6–1.1) NORMAL" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "TSH (Thyrotropin)",
            value: 4.8,
            unit: "uIU/mL",
            reference_range: { low: 0.4, high: 4.2, text: "0.4–4.2" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 2, section: "Thyroid Panel", snippet: "TSH (Thyrotropin) 4.8 uIU/mL (0.4–4.2) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "25-OH Vitamin D",
            value: 18,
            unit: "ng/mL",
            reference_range: { low: 30, high: 100, text: "30–100" },
            interpretation: "low",
            specimen: "Serum",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 2, section: "Vitamin Panel", snippet: "25-OH Vitamin D 18 ng/mL (30–100) LOW" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "Vitamin B12",
            value: 410,
            unit: "pg/mL",
            reference_range: null,
            interpretation: "unknown",
            specimen: "Serum",
            collection_datetime: "2026-08-10T08:15:00",
            result_datetime: "2026-08-11T10:30:00",
            status: "Final",
            source: { page: 2, section: "Vitamin Panel", snippet: "Vitamin B12 410 pg/mL None Printed" },
            confidence: "medium",
            flags: ["missing_reference_range"]
          }
        ],
        observations: [
          "Reference range missing for Vitamin B12 in report; preserved as null.",
          "Fasting sample confirmed (10h)."
        ],
        inconsistencies: []
      },
      {
        id: "rep_2026_05_12",
        report_meta: {
          lab_name: "Apex Clinical Pathology",
          patient_id: "MRN-884920",
          patient_name: "Sarah Jenkins",
          collection_date: "2026-05-12",
          report_date: "2026-05-13",
          source_pages: [1],
          file_name: "Apex_May2026_Labs.pdf"
        },
        raw_text: `APEX CLINICAL PATHOLOGY - LAB RESULTS
Patient: Sarah Jenkins | Collection Date: 2026-05-12

Glucose, Fasting       128 mg/dL (70-99) HIGH
HbA1c (Glycated Hb)    6.8 % (4.0-5.6) HIGH
TSH (Thyrotropin)      3.2 uIU/mL (0.4-4.2) NORMAL
Hemoglobin             12.4 g/dL (12.0-16.0) NORMAL
LDL Cholesterol        135 mg/dL (<100) HIGH
HDL Cholesterol        45 mg/dL (>40) NORMAL
Triglycerides          160 mg/dL (<150) HIGH`,
        tests: [
          {
            test_name: "Glucose, Fasting",
            value: 128,
            unit: "mg/dL",
            reference_range: { low: 70, high: 99, text: "70–99" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-05-12T09:00:00",
            result_datetime: "2026-05-13T11:00:00",
            status: "Final",
            source: { page: 1, section: "Metabolic", snippet: "Glucose, Fasting 128 mg/dL (70-99) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "HbA1c (Glycated Hb)",
            value: 6.8,
            unit: "%",
            reference_range: { low: 4.0, high: 5.6, text: "4.0–5.6" },
            interpretation: "high",
            specimen: "Whole Blood",
            collection_datetime: "2026-05-12T09:00:00",
            result_datetime: "2026-05-13T11:00:00",
            status: "Final",
            source: { page: 1, section: "Metabolic", snippet: "HbA1c (Glycated Hb) 6.8 % (4.0-5.6) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "TSH (Thyrotropin)",
            value: 3.2,
            unit: "uIU/mL",
            reference_range: { low: 0.4, high: 4.2, text: "0.4–4.2" },
            interpretation: "normal",
            specimen: "Serum",
            collection_datetime: "2026-05-12T09:00:00",
            result_datetime: "2026-05-13T11:00:00",
            status: "Final",
            source: { page: 1, section: "Endocrinology", snippet: "TSH (Thyrotropin) 3.2 uIU/mL (0.4-4.2) NORMAL" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "Hemoglobin",
            value: 12.4,
            unit: "g/dL",
            reference_range: { low: 12.0, high: 16.0, text: "12.0–16.0" },
            interpretation: "normal",
            specimen: "Whole Blood",
            collection_datetime: "2026-05-12T09:00:00",
            result_datetime: "2026-05-13T11:00:00",
            status: "Final",
            source: { page: 1, section: "Hematology", snippet: "Hemoglobin 12.4 g/dL (12.0-16.0) NORMAL" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "LDL Cholesterol",
            value: 135,
            unit: "mg/dL",
            reference_range: { low: 0, high: 100, text: "<100" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-05-12T09:00:00",
            result_datetime: "2026-05-13T11:00:00",
            status: "Final",
            source: { page: 1, section: "Lipids", snippet: "LDL Cholesterol 135 mg/dL (<100) HIGH" },
            confidence: "high",
            flags: []
          }
        ],
        observations: [],
        inconsistencies: []
      }
    ]
  },
  {
    id: "pat_marcus_vance",
    name: "Marcus Vance",
    patient_info: {
      age: { value: 56, source: "user_provided" },
      sex: { value: "Male", source: "user_provided" },
      dob: { value: "1970-09-15", source: "user_provided" },
      symptoms: [
        { text: "Chest tightness during vigorous exertion", onset: "1 month", source: "user_provided" }
      ],
      conditions: [
        { name: "Coronary Artery Disease", diagnosed_year: 2023, source: "user_provided" },
        { name: "Hyperlipidemia", diagnosed_year: 2020, source: "user_provided" }
      ],
      allergies: [
        { substance: "Sulfonamides (Sulfa)", reaction: "Urticaria / Hives", source: "user_provided" }
      ],
      medications: [
        { name: "Atorvastatin 40mg", frequency: "once daily at bedtime", source: "user_provided" },
        { name: "Aspirin 81mg", frequency: "once daily", source: "user_provided" },
        { name: "Lisinopril 10mg", frequency: "once daily", source: "user_provided" }
      ],
      surgeries: [],
      family_history: [
        { relation: "Father", condition: "Coronary Artery Disease at age 52" }
      ],
      lifestyle: {
        smoking: "Former smoker (Quit 2018)",
        alcohol: "Moderate (2 beers/week)",
        exercise: "Light walking"
      },
      contact: {
        phone: "+1 (555) 987-6543",
        email: "marcus.vance@example.com"
      },
      missing_critical_fields: [],
      clarification_questions: [
        "Does the chest tightness radiate to your arm, neck, or jaw?",
        "Have you needed sublingual nitroglycerin recently?"
      ]
    },
    reports: [
      {
        id: "rep_marcus_2026_08_28",
        report_meta: {
          lab_name: "St. Jude Cardiac Center Labs",
          patient_id: "MRN-449102",
          patient_name: "Marcus Vance",
          collection_date: "2026-08-28",
          report_date: "2026-08-28",
          source_pages: [1],
          file_name: "StJude_CardiacPanel_Aug2026.pdf"
        },
        raw_text: `ST. JUDE CARDIAC CENTER - LABORATORY REPORT
Patient: Marcus Vance | MRN: MRN-449102 | DOB: 09/15/1970
Collection: 2026-08-28 07:30 AM | Report: 2026-08-28 12:00 PM

CARDIAC BIOMARKERS & LIPID PROFILE
Test Name              Result      Unit       Reference Range    Flag
-------------------------------------------------------------------------
Troponin I             <0.01       ng/mL      <0.04              NORMAL
hs-CRP                 3.1         mg/L       <1.0               HIGH
Total Cholesterol      210         mg/dL      <200               HIGH
LDL Cholesterol        142         mg/dL      <100               HIGH
HDL Cholesterol        38          mg/dL      >40                LOW
Triglycerides          185         mg/dL      <150               HIGH`,
        tests: [
          {
            test_name: "Troponin I",
            value: 0.01,
            unit: "ng/mL",
            reference_range: { low: 0, high: 0.04, text: "<0.04" },
            interpretation: "normal",
            specimen: "Serum",
            collection_datetime: "2026-08-28T07:30:00",
            result_datetime: "2026-08-28T12:00:00",
            status: "Final",
            source: { page: 1, section: "Cardiac Markers", snippet: "Troponin I <0.01 ng/mL (<0.04) NORMAL" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "hs-CRP",
            value: 3.1,
            unit: "mg/L",
            reference_range: { low: 0, high: 1.0, text: "<1.0" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-08-28T07:30:00",
            result_datetime: "2026-08-28T12:00:00",
            status: "Final",
            source: { page: 1, section: "Inflammatory", snippet: "hs-CRP 3.1 mg/L (<1.0) HIGH" },
            confidence: "high",
            flags: []
          },
          {
            test_name: "LDL Cholesterol",
            value: 142,
            unit: "mg/dL",
            reference_range: { low: 0, high: 100, text: "<100" },
            interpretation: "high",
            specimen: "Serum",
            collection_datetime: "2026-08-28T07:30:00",
            result_datetime: "2026-08-28T12:00:00",
            status: "Final",
            source: { page: 1, section: "Lipids", snippet: "LDL Cholesterol 142 mg/dL (<100) HIGH" },
            confidence: "high",
            flags: []
          }
        ],
        observations: [],
        inconsistencies: []
      }
    ]
  }
];
