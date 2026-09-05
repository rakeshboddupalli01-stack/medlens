// MedLens Patient Intake Normalization & Clarification Engine

window.MedLensIntakeEngine = {
  /**
   * Normalizes intake form data or free text into the structured patient JSON schema.
   * @param {Object|string} inputData - Raw form fields or free text narrative
   * @returns {Object} Structured Patient JSON
   */
  processIntake: function(inputData) {
    let data = {};
    if (typeof inputData === 'string') {
      data = this.parseFreeTextIntake(inputData);
    } else {
      data = inputData || {};
    }

    const patient = {
      age: data.age != null ? { value: Number(data.age), source: "user_provided" } : { value: null, source: "user_provided" },
      sex: data.sex ? { value: String(data.sex).trim(), source: "user_provided" } : { value: null, source: "user_provided" },
      dob: data.dob ? { value: String(data.dob).trim(), source: "user_provided" } : { value: null, source: "user_provided" },
      symptoms: Array.isArray(data.symptoms) 
        ? data.symptoms.map(s => typeof s === 'string' ? { text: s, onset: "unspecified", source: "user_provided" } : { ...s, source: s.source || "user_provided" })
        : [],
      conditions: Array.isArray(data.conditions)
        ? data.conditions.map(c => typeof c === 'string' ? { name: c, diagnosed_year: null, source: "user_provided" } : { ...c, source: c.source || "user_provided" })
        : [],
      allergies: Array.isArray(data.allergies)
        ? data.allergies.map(a => typeof a === 'string' ? { substance: a, reaction: "unspecified", source: "user_provided" } : { ...a, source: a.source || "user_provided" })
        : [],
      medications: Array.isArray(data.medications)
        ? data.medications.map(m => typeof m === 'string' ? { name: m, frequency: "as directed", source: "user_provided" } : { ...m, source: m.source || "user_provided" })
        : [],
      surgeries: Array.isArray(data.surgeries) ? data.surgeries : [],
      family_history: Array.isArray(data.family_history) ? data.family_history : [],
      lifestyle: {
        smoking: data.lifestyle?.smoking || "unspecified",
        alcohol: data.lifestyle?.alcohol || "unspecified",
        exercise: data.lifestyle?.exercise || "unspecified"
      },
      contact: {
        phone: data.contact?.phone || null,
        email: data.contact?.email || null
      },
      missing_critical_fields: [],
      clarification_questions: []
    };

    // Calculate missing critical fields
    const missing = [];
    if (!patient.dob.value && !patient.age.value) missing.push("date_of_birth_or_age");
    if (!patient.sex.value) missing.push("sex");
    if (!patient.allergies || patient.allergies.length === 0) missing.push("known_allergies");
    if (!patient.medications || patient.medications.length === 0) missing.push("current_medications");

    patient.missing_critical_fields = missing;

    // Generate up to 3 concise clarification questions
    const questions = [];
    if (missing.includes("date_of_birth_or_age")) {
      questions.push("What is your date of birth or current age?");
    }
    if (missing.includes("sex")) {
      questions.push("What is your biological sex assigned at birth?");
    }
    if (missing.includes("known_allergies")) {
      questions.push("Do you have any known allergies to medications, foods, or latex?");
    }
    if (missing.includes("current_medications") && questions.length < 3) {
      questions.push("Are you currently taking any prescription medications, over-the-counter drugs, or supplements?");
    }
    if (patient.symptoms.some(s => s.onset === "unspecified") && questions.length < 3) {
      questions.push("When did your reported symptoms first start?");
    }

    patient.clarification_questions = questions.slice(0, 3);

    return { patient: patient };
  },

  /**
   * Helper parser for unstructured narrative text
   */
  parseFreeTextIntake: function(text) {
    const parsed = {
      symptoms: [],
      conditions: [],
      allergies: [],
      medications: []
    };

    // Simple heuristic parser for narrative text
    const ageMatch = text.match(/(\d{1,3})\s*(?:years old|year old|yo|y\/o)/i);
    if (ageMatch) parsed.age = parseInt(ageMatch[1], 10);

    if (/\bfemale\b|\bwoman\b|\bshe\b/i.test(text)) parsed.sex = "Female";
    else if (/\bmale\b|\bman\b|\bhe\b/i.test(text)) parsed.sex = "Male";

    const dobMatch = text.match(/DOB[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
    if (dobMatch) parsed.dob = dobMatch[1];

    // Detect allergies
    const allergyMatch = text.match(/(?:allergic to|allergies[:\s]+)([^\.\n]+)/i);
    if (allergyMatch) {
      allergyMatch[1].split(/,|and/).forEach(item => {
        const clean = item.trim();
        if (clean) parsed.allergies.push({ substance: clean, reaction: "reported", source: "user_provided" });
      });
    }

    // Detect medications
    const medMatch = text.match(/(?:taking|medications[:\s]+|prescribed[:\s]+)([^\.\n]+)/i);
    if (medMatch) {
      medMatch[1].split(/,|and/).forEach(item => {
        const clean = item.trim();
        if (clean) parsed.medications.push({ name: clean, frequency: "daily", source: "user_provided" });
      });
    }

    // Detect symptoms
    const symptomMatch = text.match(/(?:complaining of|symptoms[:\s]+|feels|suffering from[:\s]+)([^\.\n]+)/i);
    if (symptomMatch) {
      symptomMatch[1].split(/,|and/).forEach(item => {
        const clean = item.trim();
        if (clean) parsed.symptoms.push({ text: clean, onset: "recent", source: "user_provided" });
      });
    }

    return parsed;
  }
};
