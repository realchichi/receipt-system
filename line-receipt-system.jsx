import { useState, useRef } from "react";

const COLORS = {
  green: "#06C755",
  greenDark: "#04A044",
  bg: "#F0F4F0",
  white: "#FFFFFF",
  dark: "#1A1A2E",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
  red: "#EF4444",
};

const style = {
  app: {
    fontFamily: "'Noto Sans Thai', 'Sarabun', sans-serif",
    background: COLORS.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenDark} 100%)`,
    padding: "16px 20px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 12px rgba(6,199,85,0.3)",
  },
  headerLogo: {
    width: 40, height: 40,
    background: "#fff",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22,
  },
  headerTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  headerSub: { fontSize: 12, opacity: 0.85 },
  tabs: {
    display: "flex",
    background: "#fff",
    borderBottom: `2px solid ${COLORS.lightGray}`,
  },
  tab: (active) => ({
    flex: 1, padding: "12px 0", border: "none",
    background: "transparent", cursor: "pointer",
    fontSize: 14, fontWeight: active ? 700 : 400,
    color: active ? COLORS.green : COLORS.gray,
    borderBottom: active ? `3px solid ${COLORS.green}` : "3px solid transparent",
    transition: "all 0.2s",
    fontFamily: "inherit",
  }),
  body: { padding: 16, flex: 1, overflowY: "auto" },
  card: {
    background: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 14, fontWeight: 700, color: COLORS.dark,
    marginBottom: 12, display: "flex", alignItems: "center", gap: 6,
  },
  label: { fontSize: 12, color: COLORS.gray, marginBottom: 4, display: "block" },
  input: {
    width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.lightGray}`,
    borderRadius: 10, fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", transition: "border 0.2s",
    color: COLORS.dark,
  },
  row: { display: "flex", gap: 8, marginBottom: 12 },
  btn: (variant = "primary", small = false) => ({
    background: variant === "primary" ? `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`
      : variant === "danger" ? COLORS.red
      : variant === "outline" ? "transparent"
      : "#f3f4f6",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#fff" : variant === "outline" ? COLORS.green : COLORS.dark,
    border: variant === "outline" ? `1.5px solid ${COLORS.green}` : "none",
    borderRadius: 10, padding: small ? "6px 12px" : "12px 20px",
    fontSize: small ? 12 : 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.2s",
    boxShadow: variant === "primary" ? "0 4px 12px rgba(6,199,85,0.3)" : "none",
  }),
  itemRow: {
    background: "#F9FAFB", borderRadius: 10, padding: "10px 12px",
    marginBottom: 8, border: `1px solid ${COLORS.lightGray}`,
  },
  badge: (color) => ({
    display: "inline-flex", alignItems: "center",
    background: color + "15", color: color,
    border: `1px solid ${color}40`,
    borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
  }),
};

// คำนวณราคาสินค้า: จำนวนหน่วย * น้ำหนักต่อหน่วย * ราคาต่อน้ำหนัก
function calcItemTotal(item) {
  const qty = Number(item.qty) || 0;
  const weightPerUnit = Number(item.weightPerUnit) || 0;
  const pricePerWeight = Number(item.pricePerWeight) || 0;
  return qty * weightPerUnit * pricePerWeight;
}

// =============== RECEIPT PREVIEW ===============
function ReceiptPreview({ data, onClose, onShare }) {
  const receiptRef = useRef();
  const total = data.items.reduce((s, i) => s + calcItemTotal(i), 0);
  const tax = data.taxRate ? total * (data.taxRate / 100) : 0;
  const grand = total + tax - (data.discount || 0);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head>
        <title>ใบเสร็จ ${data.receiptNo}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Sarabun', sans-serif; background: #f5f5f5; padding: 20px; }
          .receipt { background: #fff; max-width: 400px; margin: 0 auto; padding: 30px; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 32px; margin-bottom: 8px; }
          .company { font-size: 18px; font-weight: 700; color: #1A1A2E; }
          .sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
          .badge { background: #06C75520; color: #06C755; border: 1px solid #06C75540; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 700; display: inline-block; margin-top: 8px; }
          .divider { border: none; border-top: 1.5px dashed #E5E7EB; margin: 16px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .info-label { color: #6B7280; }
          .info-val { font-weight: 600; color: #1A1A2E; }
          .items-header { display: flex; font-size: 11px; color: #6B7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .item-row { display: flex; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #F3F4F6; flex-wrap: wrap; }
          .item-name { flex: 1; color: #1A1A2E; font-weight: 600; min-width: 100%; margin-bottom: 2px; }
          .item-detail { color: #6B7280; flex: 1; font-size: 11px; }
          .item-total { width: 80px; text-align: right; font-weight: 700; font-size: 13px; }
          .summary { margin-top: 12px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
          .summary-row.grand { font-size: 16px; font-weight: 700; color: #06C755; border-top: 2px solid #E5E7EB; padding-top: 8px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #9CA3AF; }
          .footer .heart { color: #06C755; }
        </style>
      </head><body>
        <div class="receipt">
          <div class="header">
            <div class="logo">🏪</div>
            <div class="company">${data.companyName || "ร้านค้าของเรา"}</div>
            ${data.companyAddress ? `<div class="sub">${data.companyAddress}</div>` : ""}
            ${data.companyPhone ? `<div class="sub">โทร: ${data.companyPhone}</div>` : ""}
            <span class="badge">✓ ใบเสร็จรับเงิน</span>
          </div>
          <hr class="divider"/>
          <div class="info-grid">
            <div><div class="info-label">เลขที่ใบเสร็จ</div><div class="info-val">${data.receiptNo}</div></div>
            <div><div class="info-label">วันที่</div><div class="info-val">${data.date}</div></div>
            <div><div class="info-label">ลูกค้า</div><div class="info-val">${data.customerName || "-"}</div></div>
            <div><div class="info-label">การชำระ</div><div class="info-val">${data.payMethod}</div></div>
          </div>
          <hr class="divider"/>
          <div class="items-header">
            <span style="flex:1">รายการ</span>
            <span style="width:80px;text-align:right">รวม</span>
          </div>
          ${data.items.map(i => {
            const t = calcItemTotal(i);
            const unitLabel = i.unitLabel || "หน่วย";
            const weightLabel = i.weightLabel || "กก.";
            return `
            <div class="item-row">
              <span class="item-name">${i.name}</span>
              <span class="item-detail">${i.qty} ${unitLabel} × ${Number(i.weightPerUnit).toLocaleString()} ${weightLabel} × ฿${Number(i.pricePerWeight).toLocaleString()}/${weightLabel}</span>
              <span class="item-total">฿${t.toLocaleString()}</span>
            </div>`;
          }).join("")}
          <div class="summary">
            <div class="summary-row"><span>ยอดรวม</span><span>฿${total.toLocaleString()}</span></div>
            ${data.discount ? `<div class="summary-row"><span>ส่วนลด</span><span style="color:#EF4444">-฿${Number(data.discount).toLocaleString()}</span></div>` : ""}
            ${data.taxRate ? `<div class="summary-row"><span>ภาษี ${data.taxRate}%</span><span>฿${tax.toLocaleString("th", {minimumFractionDigits: 2})}</span></div>` : ""}
            <div class="summary-row grand"><span>ยอดสุทธิ</span><span>฿${grand.toLocaleString("th", {minimumFractionDigits: 2})}</span></div>
          </div>
          ${data.note ? `<hr class="divider"/><div style="font-size:12px;color:#6B7280">หมายเหตุ: ${data.note}</div>` : ""}
          <div class="footer">ขอบคุณที่ใช้บริการ <span class="heart">♥</span><br/>${data.companyName || ""}</div>
        </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", flexDirection: "column", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onClose} style={{ ...style.btn("ghost", true), padding: "6px 10px" }}>← กลับ</button>
        <span style={{ fontWeight: 700, flex: 1 }}>ตัวอย่างใบเสร็จ</span>
        <button onClick={handlePrint} style={style.btn("outline", true)}>🖨️ พิมพ์</button>
        <button onClick={onShare} style={style.btn("primary", true)}>📤 ส่ง Line</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#E5E7EB" }}>
        <div ref={receiptRef} style={{ background: "#fff", maxWidth: 380, margin: "0 auto", borderRadius: 16, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          {/* Receipt Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏪</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.dark }}>{data.companyName || "ร้านค้าของเรา"}</div>
            {data.companyAddress && <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>{data.companyAddress}</div>}
            {data.companyPhone && <div style={{ fontSize: 12, color: COLORS.gray }}>โทร: {data.companyPhone}</div>}
            <span style={{ ...style.badge(COLORS.green), marginTop: 8, fontSize: 11 }}>✓ ใบเสร็จรับเงิน</span>
          </div>
          <div style={{ borderTop: `1.5px dashed ${COLORS.lightGray}`, margin: "16px 0" }} />
          {/* Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, fontSize: 12 }}>
            {[["เลขที่", data.receiptNo], ["วันที่", data.date], ["ลูกค้า", data.customerName || "-"], ["ชำระโดย", data.payMethod]].map(([l, v]) => (
              <div key={l}><div style={{ color: COLORS.gray }}>{l}</div><div style={{ fontWeight: 700, color: COLORS.dark, fontSize: 13 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ borderTop: `1.5px dashed ${COLORS.lightGray}`, margin: "16px 0" }} />
          {/* Items */}
          <div style={{ display: "flex", fontSize: 10, color: COLORS.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
            <span style={{ flex: 1 }}>รายการ</span>
            <span style={{ width: 72, textAlign: "right" }}>รวม</span>
          </div>
          {data.items.map((item, i) => {
            const itemTotal = calcItemTotal(item);
            const unitLabel = item.unitLabel || "หน่วย";
            const weightLabel = item.weightLabel || "กก.";
            return (
              <div key={i} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid #F3F4F6` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ flex: 1, color: COLORS.dark, fontWeight: 700, fontSize: 13 }}>{item.name}</span>
                  <span style={{ width: 72, textAlign: "right", fontWeight: 700, fontSize: 13 }}>฿{itemTotal.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 2 }}>
                  {item.qty} {unitLabel} × {Number(item.weightPerUnit).toLocaleString()} {weightLabel} × ฿{Number(item.pricePerWeight).toLocaleString()}/{weightLabel}
                </div>
              </div>
            );
          })}
          {/* Summary */}
          <div style={{ marginTop: 12 }}>
            {[["ยอดรวม", `฿${total.toLocaleString()}`],
              ...(data.discount ? [["ส่วนลด", `-฿${Number(data.discount).toLocaleString()}`, COLORS.red]] : []),
              ...(data.taxRate ? [[`VAT ${data.taxRate}%`, `฿${tax.toLocaleString("th", { minimumFractionDigits: 2 })}`]] : []),
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", color: c || COLORS.dark }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: COLORS.green, borderTop: `2px solid ${COLORS.lightGray}`, paddingTop: 8, marginTop: 6 }}>
              <span>ยอดสุทธิ</span><span>฿{grand.toLocaleString("th", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {data.note && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, fontSize: 12, color: COLORS.gray }}>
              📝 {data.note}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#9CA3AF" }}>
            ขอบคุณที่ใช้บริการ <span style={{ color: COLORS.green }}>♥</span>
            {data.companyName && <><br />{data.companyName}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== SHARE MODAL ===============
function ShareModal({ data, onClose }) {
  const total = data.items.reduce((s, i) => s + calcItemTotal(i), 0);
  const tax = data.taxRate ? total * (data.taxRate / 100) : 0;
  const grand = total + tax - (data.discount || 0);

  const text = `🧾 *ใบเสร็จรับเงิน*\n` +
    `${data.companyName ? `🏪 ${data.companyName}\n` : ""}` +
    `━━━━━━━━━━━━━━\n` +
    `📋 เลขที่: ${data.receiptNo}\n` +
    `📅 วันที่: ${data.date}\n` +
    `👤 ลูกค้า: ${data.customerName || "-"}\n` +
    `━━━━━━━━━━━━━━\n` +
    data.items.map(i => {
      const t = calcItemTotal(i);
      const unitLabel = i.unitLabel || "หน่วย";
      const weightLabel = i.weightLabel || "กก.";
      return `• ${i.name}\n  ${i.qty} ${unitLabel} × ${Number(i.weightPerUnit).toLocaleString()} ${weightLabel} × ฿${Number(i.pricePerWeight).toLocaleString()}/${weightLabel} = ฿${t.toLocaleString()}`;
    }).join("\n") +
    `\n━━━━━━━━━━━━━━\n` +
    (data.discount ? `💸 ส่วนลด: -฿${Number(data.discount).toLocaleString()}\n` : "") +
    (data.taxRate ? `📊 VAT ${data.taxRate}%: ฿${tax.toLocaleString("th", { minimumFractionDigits: 2 })}\n` : "") +
    `💚 *ยอดสุทธิ: ฿${grand.toLocaleString("th", { minimumFractionDigits: 2 })}*\n` +
    `💳 ชำระโดย: ${data.payMethod}\n` +
    (data.note ? `📝 หมายเหตุ: ${data.note}\n` : "") +
    `\nขอบคุณที่ใช้บริการ 🙏`;

  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", borderRadius: "20px 20px 0 0", padding: 24 }}>
        <div style={{ width: 40, height: 4, background: COLORS.lightGray, borderRadius: 2, margin: "0 auto 20px" }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📤 ส่งใบเสร็จผ่าน LINE</h3>
        <div style={{ background: "#F0FFF4", border: `1px solid #BBF7D0`, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12, whiteSpace: "pre-wrap", color: COLORS.dark, maxHeight: 200, overflowY: "auto", fontFamily: "monospace" }}>
          {text}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ ...style.btn("ghost"), flex: 1 }}>ยกเลิก</button>
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 2, textDecoration: "none" }}>
            <button style={{ ...style.btn("primary"), width: "100%", fontSize: 15 }}>
              💬 เปิด LINE แชร์
            </button>
          </a>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: COLORS.gray, marginTop: 10 }}>
          * จะเปิด LINE เพื่อให้เลือกส่งให้ลูกค้า
        </p>
      </div>
    </div>
  );
}

// =============== HISTORY TAB ===============
function HistoryTab({ history, onView }) {
  if (history.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.gray }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>ยังไม่มีประวัติใบเสร็จ</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>สร้างใบเสร็จแรกของคุณได้เลย</div>
    </div>
  );
  return (
    <div>
      {history.map((r, i) => {
        const total = r.items.reduce((s, x) => s + calcItemTotal(x), 0);
        const tax = r.taxRate ? total * (r.taxRate / 100) : 0;
        const grand = total + tax - (r.discount || 0);
        return (
          <div key={i} style={style.card} onClick={() => onView(r)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, color: COLORS.dark }}>{r.receiptNo}</div>
                <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>{r.customerName || "ไม่ระบุลูกค้า"} · {r.date}</div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>{r.items.length} รายการ · {r.payMethod}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.green }}>฿{grand.toLocaleString("th", { minimumFractionDigits: 2 })}</div>
                <span style={style.badge(COLORS.green)}>✓ ออกแล้ว</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============== SETTINGS TAB ===============
function SettingsTab({ settings, onChange }) {
  return (
    <div>
      <div style={style.card}>
        <div style={style.cardTitle}>🏪 ข้อมูลร้านค้า</div>
        {[["ชื่อร้าน / บริษัท", "companyName", "text", "เช่น ร้านนภัสสร"],
          ["ที่อยู่", "companyAddress", "text", "เช่น 123 ถ.นิมมาน เชียงใหม่"],
          ["เบอร์โทร", "companyPhone", "tel", "เช่น 081-234-5678"],
          ["เลขประจำตัวผู้เสียภาษี", "taxId", "text", "เช่น 0123456789012"]].map(([l, k, t, p]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={style.label}>{l}</label>
            <input value={settings[k] || ""} onChange={e => onChange(k, e.target.value)}
              type={t} placeholder={p} style={style.input} />
          </div>
        ))}
      </div>
      <div style={style.card}>
        <div style={style.cardTitle}>⚙️ ค่าเริ่มต้น</div>
        <div style={{ marginBottom: 12 }}>
          <label style={style.label}>อัตราภาษี VAT (%)</label>
          <input value={settings.defaultTax || ""} onChange={e => onChange("defaultTax", e.target.value)}
            type="number" placeholder="เช่น 7" style={style.input} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={style.label}>รูปแบบเลขที่ใบเสร็จ</label>
          <input value={settings.receiptFormat || ""} onChange={e => onChange("receiptFormat", e.target.value)}
            placeholder="เช่น INV-2024-001" style={style.input} />
        </div>
        <div>
          <label style={style.label}>ข้อความขอบคุณ</label>
          <input value={settings.thankMessage || ""} onChange={e => onChange("thankMessage", e.target.value)}
            placeholder="ขอบคุณที่ใช้บริการ" style={style.input} />
        </div>
      </div>

      {/* Unit Labels */}
      <div style={style.card}>
        <div style={style.cardTitle}>📐 ชื่อหน่วยที่ใช้</div>
        <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
          ปรับชื่อหน่วยให้ตรงกับสินค้าของคุณ เช่น ลัง / กล่อง / ถุง / ชิ้น
        </div>
        <div style={style.row}>
          <div style={{ flex: 1 }}>
            <label style={style.label}>หน่วยนับ (จำนวน)</label>
            <input value={settings.unitLabel || ""} onChange={e => onChange("unitLabel", e.target.value)}
              placeholder="เช่น ลัง / กล่อง / ชิ้น" style={style.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={style.label}>หน่วยน้ำหนัก / ขนาด</label>
            <input value={settings.weightLabel || ""} onChange={e => onChange("weightLabel", e.target.value)}
              placeholder="เช่น กก. / ลิตร / เมตร" style={style.input} />
          </div>
        </div>
      </div>

      <div style={{ ...style.card, background: "#F0FFF4", border: `1px solid #BBF7D0` }}>
        <div style={style.cardTitle}>💬 วิธีใช้งาน</div>
        <div style={{ fontSize: 13, color: COLORS.dark, lineHeight: 1.7 }}>
          1. ตั้งค่าข้อมูลร้านค้าและหน่วยที่ใช้ในแท็บนี้<br/>
          2. ไปที่ "สร้างใบเสร็จ" กรอกข้อมูลสินค้า<br/>
          3. ราคาจะคำนวณจาก จำนวน × น้ำหนักต่อหน่วย × ราคาต่อหน่วยน้ำหนัก<br/>
          4. กด "ดูตัวอย่าง" เพื่อตรวจสอบ<br/>
          5. กด "📤 ส่ง Line" เพื่อแชร์ให้ลูกค้าผ่าน LINE
        </div>
      </div>
    </div>
  );
}

// =============== MAIN APP ===============
export default function App() {
  const today = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" });
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    companyName: "", companyAddress: "", companyPhone: "",
    defaultTax: "7", receiptFormat: "INV",
    unitLabel: "ลัง", weightLabel: "กก.",
  });
  const [counter, setCounter] = useState(1);

  const [form, setForm] = useState({
    receiptNo: "INV-001",
    date: today,
    customerName: "",
    customerPhone: "",
    payMethod: "เงินสด",
    taxRate: "",
    discount: "",
    note: "",
    items: [{ name: "", qty: 1, weightPerUnit: "", pricePerWeight: "" }],
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: "", qty: 1, weightPerUnit: "", pricePerWeight: "" }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const unitLabel = settings.unitLabel || "หน่วย";
  const weightLabel = settings.weightLabel || "กก.";

  const total = form.items.reduce((s, i) => s + calcItemTotal(i), 0);
  const tax = form.taxRate ? total * (form.taxRate / 100) : 0;
  const grand = total + tax - (Number(form.discount) || 0);

  const handlePreview = () => {
    const valid = form.items.every(i => i.name && i.weightPerUnit && i.pricePerWeight);
    if (!valid) return alert("กรุณากรอกชื่อสินค้า น้ำหนักต่อหน่วย และราคาต่อ" + weightLabel + "ให้ครบ");
    setPreview({
      ...form,
      items: form.items.map(i => ({ ...i, unitLabel, weightLabel })),
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
    });
  };

  const handleIssue = () => {
    const valid = form.items.every(i => i.name && i.weightPerUnit && i.pricePerWeight);
    if (!valid) return alert("กรุณากรอกข้อมูลสินค้าให้ครบ");
    const newReceipt = {
      ...form,
      items: form.items.map(i => ({ ...i, unitLabel, weightLabel })),
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
    };
    setHistory(h => [newReceipt, ...h]);
    const next = counter + 1;
    setCounter(next);
    setForm(f => ({
      ...f,
      receiptNo: `${settings.receiptFormat || "INV"}-${String(next).padStart(3, "0")}`,
      customerName: "", customerPhone: "", discount: "", note: "",
      items: [{ name: "", qty: 1, weightPerUnit: "", pricePerWeight: "" }],
    }));
    alert("✅ ออกใบเสร็จเรียบร้อย!");
    setTab(1);
  };

  const setSetting = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div style={style.app}>
        {/* Header */}
        <div style={style.header}>
          <div style={style.headerLogo}>💚</div>
          <div>
            <div style={style.headerTitle}>ระบบออกใบเสร็จ</div>
            <div style={style.headerSub}>LINE OA Receipt System</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={style.tabs}>
          {["📝 สร้างใบเสร็จ", "📋 ประวัติ", "⚙️ ตั้งค่า"].map((t, i) => (
            <button key={i} style={style.tab(tab === i)} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        <div style={style.body}>
          {/* ===== TAB 0: CREATE ===== */}
          {tab === 0 && (
            <>
              {settings.companyName && (
                <div style={{ background: `linear-gradient(135deg, ${COLORS.green}15, ${COLORS.green}08)`, border: `1px solid ${COLORS.green}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span>🏪</span><span style={{ fontWeight: 700, color: COLORS.dark }}>{settings.companyName}</span>
                  {settings.companyPhone && <span style={{ color: COLORS.gray }}>· {settings.companyPhone}</span>}
                </div>
              )}

              {/* Receipt Info */}
              <div style={style.card}>
                <div style={style.cardTitle}>📋 ข้อมูลใบเสร็จ</div>
                <div style={style.row}>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>เลขที่ใบเสร็จ</label>
                    <input value={form.receiptNo} onChange={e => setField("receiptNo", e.target.value)} style={style.input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>วันที่</label>
                    <input value={form.date} onChange={e => setField("date", e.target.value)} style={style.input} />
                  </div>
                </div>
                <label style={style.label}>ชื่อลูกค้า</label>
                <input value={form.customerName} onChange={e => setField("customerName", e.target.value)} placeholder="เช่น คุณสมชาย" style={{ ...style.input, marginBottom: 10 }} />
                <label style={style.label}>วิธีชำระเงิน</label>
                <select value={form.payMethod} onChange={e => setField("payMethod", e.target.value)}
                  style={{ ...style.input, appearance: "none" }}>
                  {["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code", "พร้อมเพย์"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Items */}
              <div style={style.card}>
                <div style={{ ...style.cardTitle, justifyContent: "space-between" }}>
                  <span>🛒 รายการสินค้า</span>
                  <button onClick={addItem} style={style.btn("outline", true)}>+ เพิ่ม</button>
                </div>

                {form.items.map((item, i) => {
                  const itemTotal = calcItemTotal(item);
                  return (
                    <div key={i} style={style.itemRow}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.green }}>รายการที่ {i + 1}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 16 }}>✕</button>
                        )}
                      </div>

                      <label style={style.label}>ชื่อสินค้า / บริการ</label>
                      <input value={item.name} onChange={e => setItem(i, "name", e.target.value)}
                        placeholder="เช่น ส้มสายน้ำผึ้ง" style={{ ...style.input, marginBottom: 8 }} />

                      {/* Row 1: จำนวน + น้ำหนักต่อหน่วย */}
                      <div style={style.row}>
                        <div style={{ flex: 1 }}>
                          <label style={style.label}>จำนวน ({unitLabel})</label>
                          <input type="number" value={item.qty} onChange={e => setItem(i, "qty", e.target.value)}
                            min={1} placeholder="0" style={style.input} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={style.label}>{weightLabel} ต่อ {unitLabel}</label>
                          <input type="number" value={item.weightPerUnit} onChange={e => setItem(i, "weightPerUnit", e.target.value)}
                            placeholder="0" style={style.input} />
                        </div>
                      </div>

                      {/* Row 2: ราคาต่อหน่วยน้ำหนัก */}
                      <div style={{ marginBottom: 8 }}>
                        <label style={style.label}>ราคาต่อ {weightLabel} (฿)</label>
                        <input type="number" value={item.pricePerWeight} onChange={e => setItem(i, "pricePerWeight", e.target.value)}
                          placeholder="0.00" style={style.input} />
                      </div>

                      {/* สูตรคำนวณ */}
                      {item.name && item.weightPerUnit && item.pricePerWeight ? (
                        <div style={{ background: `${COLORS.green}10`, borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
                          <div style={{ color: COLORS.gray, marginBottom: 2 }}>
                            {item.qty} {unitLabel} × {Number(item.weightPerUnit).toLocaleString()} {weightLabel} × ฿{Number(item.pricePerWeight).toLocaleString()}/{weightLabel}
                          </div>
                          <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 14 }}>
                            = ฿{itemTotal.toLocaleString("th", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: COLORS.gray, fontStyle: "italic" }}>
                          กรอกข้อมูลเพื่อดูยอดรวม
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div style={style.card}>
                <div style={style.cardTitle}>💰 สรุปยอด</div>
                <div style={style.row}>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>ส่วนลด (฿)</label>
                    <input type="number" value={form.discount} onChange={e => setField("discount", e.target.value)}
                      placeholder="0" style={style.input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>VAT (%)</label>
                    <input type="number" value={form.taxRate} onChange={e => setField("taxRate", e.target.value)}
                      placeholder="7" style={style.input} />
                  </div>
                </div>
                <label style={style.label}>หมายเหตุ</label>
                <input value={form.note} onChange={e => setField("note", e.target.value)}
                  placeholder="เช่น ชำระภายใน 30 วัน" style={{ ...style.input, marginBottom: 12 }} />
                {/* Total display */}
                <div style={{ background: `linear-gradient(135deg, ${COLORS.green}12, ${COLORS.green}06)`, borderRadius: 12, padding: "12px 16px", border: `1px solid ${COLORS.green}25` }}>
                  {[["ยอดรวม", `฿${total.toLocaleString()}`],
                    ...(form.discount ? [["ส่วนลด", `-฿${Number(form.discount).toLocaleString()}`, COLORS.red]] : []),
                    ...(form.taxRate ? [[`VAT ${form.taxRate}%`, `฿${tax.toLocaleString("th", { minimumFractionDigits: 2 })}`]] : []),
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: c || COLORS.dark }}><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: COLORS.green, borderTop: `1px dashed ${COLORS.green}40`, paddingTop: 8, marginTop: 4 }}>
                    <span>ยอดสุทธิ</span><span>฿{grand.toLocaleString("th", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button onClick={handlePreview} style={{ ...style.btn("outline"), flex: 1 }}>👁️ ดูตัวอย่าง</button>
                <button onClick={handleIssue} style={{ ...style.btn("primary"), flex: 2 }}>✅ ออกใบเสร็จ</button>
              </div>
            </>
          )}

          {/* ===== TAB 1: HISTORY ===== */}
          {tab === 1 && <HistoryTab history={history} onView={(r) => { setPreview(r); }} />}

          {/* ===== TAB 2: SETTINGS ===== */}
          {tab === 2 && <SettingsTab settings={settings} onChange={setSetting} />}
        </div>

        {/* Preview Modal */}
        {preview && (
          <ReceiptPreview
            data={preview}
            onClose={() => setPreview(null)}
            onShare={() => setShowShare(true)}
          />
        )}

        {/* Share Modal */}
        {showShare && preview && (
          <ShareModal data={preview} onClose={() => setShowShare(false)} />
        )}
      </div>
    </>
  );
}
