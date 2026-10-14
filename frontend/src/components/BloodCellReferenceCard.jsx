import React from "react";
import "./BloodCellReferenceCard.css";

const sections = [
  {
    title: "RED BLOOD CELLS (RBC)",
    icon: "🩸",
    accent: "#FEE2E2",
    lowTitle: "Low RBC",
    lowItems: [
      "Iron Deficiency Anemia",
      "Vitamin B12 Deficiency",
      "Folate Deficiency",
      "Aplastic Anemia",
      "Chronic Kidney Disease",
      "Bone Marrow Disorders",
    ],
    highTitle: "High RBC",
    highItems: [
      "Polycythemia Vera",
      "Chronic Lung Disease",
      "Dehydration",
    ],
  },
  {
    title: "WHITE BLOOD CELLS (WBC)",
    icon: "⚪",
    accent: "#DBEAFE",
    lowTitle: "Low WBC",
    lowItems: [
      "Viral Infections",
      "Bone Marrow Suppression",
      "Aplastic Anemia",
      "Autoimmune Disorders",
      "Chemotherapy Effects",
    ],
    highTitle: "High WBC",
    highItems: [
      "Bacterial Infections",
      "Leukemia",
      "Inflammatory Disorders",
      "Stress Response",
    ],
  },
  {
    title: "PLATELETS",
    icon: "🟣",
    accent: "#E9D5FF",
    lowTitle: "Low Platelets",
    lowItems: [
      "Dengue Fever",
      "Immune Thrombocytopenia (ITP)",
      "Bone Marrow Disorders",
      "Leukemia",
      "Liver Disease",
    ],
    highTitle: "High Platelets",
    highItems: [
      "Essential Thrombocythemia",
      "Chronic Inflammation",
      "Iron Deficiency",
      "Recovery After Infection",
    ],
  },
];

export default function BloodCellReferenceCard() {
  return (
    <div className="health-reference-card">
      <div className="health-reference-card-header">
        <div className="health-reference-card-title">🩺 Blood Cell Clinical Reference</div>
        <div className="health-reference-card-subtitle">
          Common Conditions Associated with Blood Cell Abnormalities
        </div>
      </div>

      <div className="health-reference-card-body">
        {sections.map((section) => (
          <div className="health-reference-section" key={section.title}>
            <div
              className="health-reference-section-header"
              style={{ backgroundColor: section.accent }}
            >
              <span className="health-reference-section-icon">{section.icon}</span>
              <span>{section.title}</span>
            </div>

            <div className="health-reference-pillbox">
              <div className="health-reference-subheading">
                <span className="health-reference-badge low">🔻</span>
                <span>{section.lowTitle}</span>
              </div>
              <ul>
                {section.lowItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="health-reference-pillbox">
              <div className="health-reference-subheading">
                <span className="health-reference-badge high">🔺</span>
                <span>{section.highTitle}</span>
              </div>
              <ul>
                {section.highItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="health-reference-card-footer">
        <div className="health-reference-footer-title">Reference Information</div>
        <p>
          Blood cell abnormalities may be associated with various clinical
          conditions. Final diagnosis should always be based on comprehensive
          laboratory findings and physician evaluation.
        </p>
      </div>
    </div>
  );
}
