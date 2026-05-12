#!/usr/bin/env python3
"""Generate 5 realistic hospital bill PDFs for CoveredUSA demo content."""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

OUTPUT_DIR = "/Users/frankthebot/clawd/projects/covered-usa/demo-bills"

BRAND_BLUE = colors.HexColor("#003366")
BRAND_LIGHT = colors.HexColor("#E8F0F8")
BRAND_RED = colors.HexColor("#CC0000")
GRAY = colors.HexColor("#666666")
LIGHT_GRAY = colors.HexColor("#F5F5F5")
TABLE_HEADER_BG = colors.HexColor("#003366")
TABLE_ALT = colors.HexColor("#F0F4F8")


def make_doc(filename):
    path = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(
        path,
        pagesize=letter,
        rightMargin=0.65*inch,
        leftMargin=0.65*inch,
        topMargin=0.5*inch,
        bottomMargin=0.65*inch,
    )
    return doc, path


def styles():
    s = getSampleStyleSheet()
    hospital_name = ParagraphStyle("hospital_name", parent=s["Normal"],
        fontSize=20, fontName="Helvetica-Bold", textColor=BRAND_BLUE,
        spaceAfter=2)
    hospital_sub = ParagraphStyle("hospital_sub", parent=s["Normal"],
        fontSize=9, fontName="Helvetica", textColor=GRAY, spaceAfter=1)
    header_title = ParagraphStyle("header_title", parent=s["Normal"],
        fontSize=14, fontName="Helvetica-Bold", textColor=BRAND_BLUE,
        alignment=TA_CENTER, spaceBefore=8, spaceAfter=8)
    section_label = ParagraphStyle("section_label", parent=s["Normal"],
        fontSize=9, fontName="Helvetica-Bold", textColor=BRAND_BLUE)
    section_value = ParagraphStyle("section_value", parent=s["Normal"],
        fontSize=9, fontName="Helvetica", textColor=colors.black)
    footer = ParagraphStyle("footer", parent=s["Normal"],
        fontSize=8, fontName="Helvetica", textColor=GRAY, alignment=TA_CENTER)
    notice = ParagraphStyle("notice", parent=s["Normal"],
        fontSize=8, fontName="Helvetica-Oblique", textColor=GRAY, alignment=TA_CENTER)
    warning = ParagraphStyle("warning", parent=s["Normal"],
        fontSize=8, fontName="Helvetica-Bold", textColor=BRAND_RED, alignment=TA_CENTER)
    return {
        "hospital_name": hospital_name,
        "hospital_sub": hospital_sub,
        "header_title": header_title,
        "section_label": section_label,
        "section_value": section_value,
        "footer": footer,
        "notice": notice,
        "warning": warning,
    }


def hospital_header(st, name, address, phone, website, ein=None):
    """Returns list of flowables for hospital letterhead."""
    items = [
        Paragraph(name, st["hospital_name"]),
        Paragraph(address, st["hospital_sub"]),
        Paragraph(f"Phone: {phone} | {website}", st["hospital_sub"]),
    ]
    if ein:
        items.append(Paragraph(f"EIN: {ein} | 501(c)(3) Nonprofit Organization", st["hospital_sub"]))
    items.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE, spaceAfter=6))
    return items


def patient_info_table(st, patient, dob, account, dos, insurance, policy, auth):
    data = [
        [Paragraph("PATIENT INFORMATION", st["section_label"]), "",
         Paragraph("BILLING INFORMATION", st["section_label"]), ""],
        [Paragraph("Patient Name:", st["section_label"]),
         Paragraph(patient, st["section_value"]),
         Paragraph("Account #:", st["section_label"]),
         Paragraph(account, st["section_value"])],
        [Paragraph("Date of Birth:", st["section_label"]),
         Paragraph(dob, st["section_value"]),
         Paragraph("Date of Service:", st["section_label"]),
         Paragraph(dos, st["section_value"])],
        [Paragraph("Insurance:", st["section_label"]),
         Paragraph(insurance, st["section_value"]),
         Paragraph("Policy #:", st["section_label"]),
         Paragraph(policy, st["section_value"])],
        [Paragraph("Auth #:", st["section_label"]),
         Paragraph(auth, st["section_value"]),
         "", ""],
    ]
    t = Table(data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_LIGHT),
        ("SPAN", (0, 0), (1, 0)),
        ("SPAN", (2, 0), (3, 0)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def line_items_table(st, items, note_rows=None):
    """items: list of (description, code, qty, unit_price, total, is_flagged)"""
    header = ["Description", "CPT/Rev Code", "Qty", "Unit Price", "Total"]
    data = [header]
    for i, item in enumerate(items):
        desc, code, qty, unit, total, flagged = item
        row = [desc, code, str(qty), f"${unit:,.2f}", f"${total:,.2f}"]
        data.append(row)

    col_widths = [3.0*inch, 1.2*inch, 0.5*inch, 1.0*inch, 1.0*inch]
    t = Table(data, colWidths=col_widths)

    style = [
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 0), (1, -1), "LEFT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    # Alternate row shading
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), TABLE_ALT))

    # Flag specific rows
    if note_rows:
        for ri, note in note_rows.items():
            actual_row = ri + 1  # offset for header
            style.append(("TEXTCOLOR", (0, actual_row), (0, actual_row), BRAND_RED))
            style.append(("FONTNAME", (0, actual_row), (0, actual_row), "Helvetica-Bold"))

    t.setStyle(TableStyle(style))
    return t


def totals_table(subtotal, tax_label, tax_amt, insurance_paid, balance_due):
    data = [
        ["", "", "", "Subtotal:", f"${subtotal:,.2f}"],
    ]
    if tax_amt:
        data.append(["", "", "", f"{tax_label}:", f"${tax_amt:,.2f}"])
    if insurance_paid:
        data.append(["", "", "", "Insurance Adjustment:", f"-${insurance_paid:,.2f}"])
    data.append(["", "", "", "BALANCE DUE:", f"${balance_due:,.2f}"])

    col_widths = [3.0*inch, 1.2*inch, 0.5*inch, 1.0*inch, 1.0*inch]
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (3, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (3, -1), (-1, -1), 11),
        ("TEXTCOLOR", (3, -1), (-1, -1), BRAND_RED),
        ("LINEABOVE", (3, -1), (-1, -1), 1.5, BRAND_BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


# ============================================================
# BILL 1: ER Visit with Duplicate Charges
# ============================================================
def bill_1():
    doc, path = make_doc("bill1_er_duplicate_valley_medical.pdf")
    st = styles()
    story = []

    story += hospital_header(st,
        "Valley Medical Center",
        "1200 E. McDowell Road, Phoenix, AZ 85006",
        "(602) 344-5011", "valleymedicalaz.org/billing",
        ein="86-0243710"
    )

    story.append(Paragraph("PATIENT BILLING STATEMENT", st["header_title"]))
    story.append(Spacer(1, 4))

    story.append(patient_info_table(st,
        patient="Johnson, Sarah M.",
        dob="03/14/1988",
        account="VMC-2026-0115-4492",
        dos="January 15, 2026",
        insurance="Blue Cross Blue Shield AZ — PPO",
        policy="BCBSAZ-XP4421986",
        auth="AUTH-7741992-ER"
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "ITEMIZED CHARGES — Emergency Department Visit",
        ParagraphStyle("sh", parent=styles()["section_label"], fontSize=10,
                       textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=4)
    ))

    items = [
        ("Emergency Dept Visit — Level 3 (Moderate Complexity)", "99283", 1, 3200.00, 3200.00, False),
        ("Emergency Dept Visit — Level 3 (Moderate Complexity)  *** DUPLICATE CHARGE ***", "99283", 1, 3200.00, 3200.00, True),
        ("CT Scan Abdomen/Pelvis with Contrast", "74177", 1, 4800.00, 4800.00, False),
        ("Basic Metabolic Panel (14 analytes)", "80047", 1, 380.00, 380.00, False),
        ("IV Infusion — Initial, Normal Saline 1L (each hour)", "96360", 1, 780.00, 780.00, False),
        ("Urinalysis — Automated without microscopy", "81001", 1, 220.00, 220.00, False),
    ]

    note_rows = {1: "DUPLICATE"}
    story.append(line_items_table(st, items, note_rows))
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        "⚠  LINE 2 FLAGGED: Duplicate charge for 99283 — Emergency Department Visit billed twice for same encounter.",
        ParagraphStyle("flag", parent=st["notice"], textColor=BRAND_RED, fontName="Helvetica-Bold")
    ))
    story.append(Spacer(1, 6))

    story.append(totals_table(
        subtotal=12580.00,
        tax_label=None, tax_amt=None,
        insurance_paid=None,
        balance_due=12580.00
    ))

    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Questions about this bill? Call Patient Financial Services: 1-800-344-5099 | Pay online: valleymedicalaz.org/billing",
        st["footer"]
    ))
    story.append(Paragraph(
        "Payment due within 30 days. Financial assistance available — call 1-800-344-5099 or visit valleymedicalaz.org/charity-care",
        st["footer"]
    ))
    story.append(Paragraph(
        "Valley Medical Center is a 501(c)(3) nonprofit. This bill is for hospital facility charges only. Physician charges billed separately.",
        st["notice"]
    ))

    doc.build(story)
    return path


# ============================================================
# BILL 2: Surgery with Unbundled Charges
# ============================================================
def bill_2():
    doc, path = make_doc("bill2_surgery_unbundled_mercy_general.pdf")
    st = styles()
    story = []

    story += hospital_header(st,
        "Mercy General Hospital",
        "4001 J Street, Sacramento, CA 95819",
        "(916) 453-4545", "mercygeneral.org/billing",
        ein="94-1521522"
    )

    story.append(Paragraph("PATIENT BILLING STATEMENT", st["header_title"]))
    story.append(Spacer(1, 4))

    story.append(patient_info_table(st,
        patient="Chen, Robert K.",
        dob="07/22/1971",
        account="MGH-2026-0203-8831",
        dos="February 3, 2026",
        insurance="Aetna Choice POS II",
        policy="AET-HMO-3394871-CA",
        auth="AUTH-0033-ORTH-SURG"
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "ITEMIZED CHARGES — Outpatient Surgery: Knee Arthroscopy",
        ParagraphStyle("sh", parent=styles()["section_label"], fontSize=10,
                       textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=4)
    ))

    items = [
        ("Knee Arthroscopy w/ Meniscus Repair, Right Knee", "29881", 1, 8900.00, 8900.00, False),
        ("Surgical Tray & Instrument Setup Fee  *** SHOULD BE BUNDLED ***", "SURG-TRAY", 1, 2400.00, 2400.00, True),
        ("Anesthesia Setup & Preparation Fee  *** SHOULD BE BUNDLED ***", "ANES-PREP", 1, 1800.00, 1800.00, True),
        ("Recovery Room Monitoring — 2 hours post-op", "REV-0710", 1, 950.00, 950.00, False),
        ("Knee Arthroscopy — Hospital Facility Fee", "REV-0360", 1, 4200.00, 4200.00, False),
        ("X-ray Knee 2 Views — Post-operative", "73560", 1, 890.00, 890.00, False),
    ]

    note_rows = {1: "UNBUNDLED", 2: "UNBUNDLED"}
    story.append(line_items_table(st, items, note_rows))
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        "⚠  LINES 2-3 FLAGGED: 'Surgical Tray Setup' and 'Anesthesia Setup' are non-covered, unbundled charges. "
        "Per CMS guidelines, these costs are included in the primary surgical procedure code (29881) and cannot be billed separately.",
        ParagraphStyle("flag", parent=st["notice"], textColor=BRAND_RED, fontName="Helvetica-Bold")
    ))
    story.append(Spacer(1, 6))

    story.append(totals_table(
        subtotal=19140.00,
        tax_label=None, tax_amt=None,
        insurance_paid=None,
        balance_due=19140.00
    ))

    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Questions about this bill? Call Patient Billing: 1-800-453-4500 | Pay online: mercygeneral.org/billing",
        st["footer"]
    ))
    story.append(Paragraph(
        "Payment due within 30 days of statement date. Payment plans available — call 1-800-453-4500.",
        st["footer"]
    ))
    story.append(Paragraph(
        "Mercy General Hospital is a 501(c)(3) nonprofit Catholic health system. Physician/anesthesia charges billed separately.",
        st["notice"]
    ))

    doc.build(story)
    return path


# ============================================================
# BILL 3: Simple ER Bill (Clean — just overcharging)
# ============================================================
def bill_3():
    doc, path = make_doc("bill3_er_simple_stlukes_kc.pdf")
    st = styles()
    story = []

    story += hospital_header(st,
        "St. Luke's Hospital",
        "4401 Wornall Road, Kansas City, MO 64111",
        "(816) 932-2000", "saintlukeskc.org/billing",
        ein="44-0546437"
    )

    story.append(Paragraph("PATIENT BILLING STATEMENT", st["header_title"]))
    story.append(Spacer(1, 4))

    story.append(patient_info_table(st,
        patient="Garcia, Maria E.",
        dob="11/05/1962",
        account="SLH-2026-0308-2217",
        dos="March 8, 2026",
        insurance="UnitedHealthcare Choice Plus",
        policy="UHC-CP-1188743-MO",
        auth="AUTH-8829-ER-CARD"
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "ITEMIZED CHARGES — Emergency Department Visit",
        ParagraphStyle("sh", parent=styles()["section_label"], fontSize=10,
                       textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=4)
    ))

    items = [
        ("Emergency Dept Visit — Level 2 (Low-Moderate Complexity)", "99282", 1, 1850.00, 1850.00, False),
        ("Chest X-ray — 2 Views (PA & Lateral)", "71046", 1, 2400.00, 2400.00, False),
        ("Electrocardiogram (EKG) — Interpretation & Report", "93010", 1, 680.00, 680.00, False),
        ("Troponin I — Quantitative (Cardiac)", "84484", 1, 890.00, 890.00, False),
    ]

    story.append(line_items_table(st, items))
    story.append(Spacer(1, 6))

    story.append(totals_table(
        subtotal=5820.00,
        tax_label=None, tax_amt=None,
        insurance_paid=None,
        balance_due=5820.00
    ))

    story.append(Spacer(1, 12))

    # Add Medicare comparison note
    note_style = ParagraphStyle("note_box", parent=st["notice"],
        fontSize=8.5, textColor=colors.HexColor("#444444"),
        borderWidth=1, borderColor=BRAND_BLUE,
        borderPadding=8, backColor=BRAND_LIGHT)
    story.append(Paragraph(
        "For reference: Medicare reimbursement rates for these services total approximately $160.  "
        "This bill represents charges approximately 36× the Medicare benchmark.",
        note_style
    ))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Questions about this bill? Call Patient Financial Services: 1-800-932-2099 | Pay online: saintlukeskc.org/billing",
        st["footer"]
    ))
    story.append(Paragraph(
        "Financial assistance may be available. Apply at saintlukeskc.org/financial-assistance or call 1-800-932-2099.",
        st["footer"]
    ))
    story.append(Paragraph(
        "St. Luke's Health System is a 501(c)(3) nonprofit. Physician services billed separately by St. Luke's Medical Group.",
        st["notice"]
    ))

    doc.build(story)
    return path


# ============================================================
# BILL 4: Hospital Stay (Inpatient)
# ============================================================
def bill_4():
    doc, path = make_doc("bill4_inpatient_northwestern_memorial.pdf")
    st = styles()
    story = []

    story += hospital_header(st,
        "Northwestern Memorial Hospital",
        "251 E. Huron Street, Chicago, IL 60611",
        "(312) 926-2000", "nm.org/billing",
        ein="36-2167060"
    )

    story.append(Paragraph("INPATIENT BILLING STATEMENT", st["header_title"]))
    story.append(Spacer(1, 4))

    # Slightly different layout for inpatient — add admission/discharge
    adm_data = [
        [Paragraph("PATIENT INFORMATION", st["section_label"]), "",
         Paragraph("ADMISSION INFORMATION", st["section_label"]), ""],
        [Paragraph("Patient Name:", st["section_label"]),
         Paragraph("Williams, David R.", st["section_value"]),
         Paragraph("Account #:", st["section_label"]),
         Paragraph("NMH-2026-0401-6634", st["section_value"])],
        [Paragraph("Date of Birth:", st["section_label"]),
         Paragraph("09/19/1955", st["section_value"]),
         Paragraph("Admission Date:", st["section_label"]),
         Paragraph("April 1, 2026", st["section_value"])],
        [Paragraph("Insurance:", st["section_label"]),
         Paragraph("Cigna Open Access Plus", st["section_value"]),
         Paragraph("Discharge Date:", st["section_label"]),
         Paragraph("April 3, 2026", st["section_value"])],
        [Paragraph("Policy #:", st["section_label"]),
         Paragraph("CIG-OAP-2281447-IL", st["section_value"]),
         Paragraph("Length of Stay:", st["section_label"]),
         Paragraph("3 Days", st["section_value"])],
        [Paragraph("Auth #:", st["section_label"]),
         Paragraph("AUTH-1102-IP-NEURO", st["section_value"]),
         Paragraph("Admitting Dx:", st["section_label"]),
         Paragraph("R51.9 — Headache, unspecified", st["section_value"])],
    ]
    adm_t = Table(adm_data, colWidths=[1.2*inch, 2.3*inch, 1.3*inch, 2.2*inch])
    adm_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_LIGHT),
        ("SPAN", (0, 0), (1, 0)),
        ("SPAN", (2, 0), (3, 0)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(adm_t)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "ITEMIZED CHARGES — Inpatient Hospitalization",
        ParagraphStyle("sh", parent=styles()["section_label"], fontSize=10,
                       textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=4)
    ))

    items = [
        ("Room & Board — Semi-Private Room (3 days @ $4,200/day)", "REV-0120", 3, 4200.00, 12600.00, False),
        ("ICU/Step-down Monitoring — Continuous Telemetry", "REV-0200", 1, 4200.00, 4200.00, False),
        ("Hospital Physician Daily Visit — Attending (×3)", "99232", 3, 700.00, 2100.00, False),
        ("Complete Blood Count w/ Differential (×3)", "85025", 3, 296.67, 890.00, False),
        ("Comprehensive Metabolic Panel — 14 analytes (×2)", "80053", 2, 370.00, 740.00, False),
        ("MRI Brain without & with Contrast", "70553", 1, 6800.00, 6800.00, False),
        ("IV Medications — Antibiotic Infusion (daily ×3)", "REV-0258", 3, 1133.33, 3400.00, False),
    ]

    story.append(line_items_table(st, items))
    story.append(Spacer(1, 6))

    story.append(totals_table(
        subtotal=30730.00,
        tax_label=None, tax_amt=None,
        insurance_paid=None,
        balance_due=30730.00
    ))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Questions about this bill? Call Patient Financial Services: 1-800-926-2099 | Pay online: nm.org/mybill",
        st["footer"]
    ))
    story.append(Paragraph(
        "Itemized bill available upon request. Billing disputes must be submitted in writing within 90 days.",
        st["footer"]
    ))
    story.append(Paragraph(
        "Northwestern Memorial Hospital is a 501(c)(3) nonprofit academic medical center. Physician fees billed separately.",
        st["notice"]
    ))

    doc.build(story)
    return path


# ============================================================
# BILL 5: Outpatient Procedure — Colonoscopy
# ============================================================
def bill_5():
    doc, path = make_doc("bill5_colonoscopy_mount_sinai.pdf")
    st = styles()
    story = []

    story += hospital_header(st,
        "The Mount Sinai Hospital",
        "1 Gustave L. Levy Place, New York, NY 10029",
        "(212) 241-6500", "mountsinai.org/billing",
        ein="13-1740114"
    )

    story.append(Paragraph("PATIENT BILLING STATEMENT", st["header_title"]))
    story.append(Spacer(1, 4))

    story.append(patient_info_table(st,
        patient="Lee, Jennifer A.",
        dob="05/30/1975",
        account="MSH-2026-0422-9917",
        dos="April 22, 2026",
        insurance="Empire BlueCross BlueShield",
        policy="EMP-PPO-7723481-NY",
        auth="AUTH-5591-GI-SCOPE"
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "ITEMIZED CHARGES — Outpatient Procedure: Colonoscopy w/ Biopsy",
        ParagraphStyle("sh", parent=styles()["section_label"], fontSize=10,
                       textColor=BRAND_BLUE, spaceBefore=4, spaceAfter=4)
    ))

    items = [
        ("Colonoscopy — Flexible, with Biopsy (single or multiple sites)", "45380", 1, 4200.00, 4200.00, False),
        ("Pathology Examination — Surgical Specimen Level IV", "88305", 1, 890.00, 890.00, False),
        ("Anesthesia — Lower Intestinal Endoscopy (45 min)", "00810", 1, 2100.00, 2100.00, False),
        ("Recovery Room Monitoring — 1 hour post-procedure", "REV-0710", 1, 680.00, 680.00, False),
        ("Hemoglobin A1c — Pre-procedure Lab", "83036", 1, 340.00, 340.00, False),
    ]

    story.append(line_items_table(st, items))
    story.append(Spacer(1, 6))

    story.append(totals_table(
        subtotal=8210.00,
        tax_label=None, tax_amt=None,
        insurance_paid=None,
        balance_due=8210.00
    ))

    story.append(Spacer(1, 10))

    compare_data = [
        [Paragraph("MEDICARE RATE COMPARISON", ParagraphStyle("ch", parent=st["section_label"],
            fontSize=9, textColor=BRAND_BLUE)), "", "", "", ""],
        ["Colonoscopy (45380)", "Medicare: $207", "Billed: $4,200", "Markup:", "20.3×"],
        ["Pathology (88305)", "Medicare: $89", "Billed: $890", "Markup:", "10.0×"],
        ["Anesthesia (00810)", "Medicare: $112", "Billed: $2,100", "Markup:", "18.8×"],
        ["Recovery Room", "Medicare: ~$85", "Billed: $680", "Markup:", "8.0×"],
        ["A1c Lab (83036)", "Medicare: $13", "Billed: $340", "Markup:", "26.2×"],
        [Paragraph("TOTAL", ParagraphStyle("tb", fontName="Helvetica-Bold", fontSize=9)),
         "Medicare: $506", "Billed: $8,210",
         Paragraph("Avg Markup:", ParagraphStyle("tb", fontName="Helvetica-Bold", fontSize=9)),
         Paragraph("16.2×", ParagraphStyle("tb", fontName="Helvetica-Bold", fontSize=9, textColor=BRAND_RED))],
    ]
    comp_t = Table(compare_data, colWidths=[1.8*inch, 1.3*inch, 1.3*inch, 1.0*inch, 1.3*inch])
    comp_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_LIGHT),
        ("SPAN", (0, 0), (-1, 0)),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
        ("BACKGROUND", (0, -1), (-1, -1), BRAND_LIGHT),
        ("LINEABOVE", (0, -1), (-1, -1), 1, BRAND_BLUE),
    ]))
    story.append(comp_t)

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Questions about this bill? Call Patient Revenue Services: 1-800-241-6700 | Pay online: mountsinai.org/billing",
        st["footer"]
    ))
    story.append(Paragraph(
        "Financial assistance available through the Mount Sinai Advantage program. Call 1-800-241-6700 to apply.",
        st["footer"]
    ))
    story.append(Paragraph(
        "The Mount Sinai Hospital is a 501(c)(3) nonprofit. This statement covers facility charges only — physician fees billed separately.",
        st["notice"]
    ))

    doc.build(story)
    return path


if __name__ == "__main__":
    print("Generating demo hospital bills...")
    paths = []
    for fn, label in [
        (bill_1, "Bill 1: ER Duplicate Charges — Valley Medical Center"),
        (bill_2, "Bill 2: Surgery Unbundled — Mercy General"),
        (bill_3, "Bill 3: Simple ER — St. Luke's KC"),
        (bill_4, "Bill 4: Inpatient Stay — Northwestern Memorial"),
        (bill_5, "Bill 5: Colonoscopy — Mount Sinai"),
    ]:
        path = fn()
        size = os.path.getsize(path)
        paths.append((label, path, size))
        print(f"  [OK] {label}")
        print(f"       {path} ({size:,} bytes)")

    print("\nAll 5 bills generated successfully.")
    for label, path, size in paths:
        fname = os.path.basename(path)
        print(f"  {fname} — {size:,} bytes")
