import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/15oVvMev4APIW-6xNdh2igbjRGHzS6HJ9SV0KQnEbYD0/edit?usp=sharing";

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function extractDriveFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:id=|\/d\/|file\/d\/)([\w-]{25,})/i);
  return match ? match[1] : null;
}

function formatThaiDate(rawTimestamp: string): string {
  if (!rawTimestamp) return "-";
  try {
    // raw format e.g. "13/7/2026, 7:48:37" or "2026-07-13 07:48:37"
    const cleaned = rawTimestamp.trim().replace(/^"|"$/g, "");
    const parts = cleaned.split(",");
    if (parts.length >= 1) {
      const dateParts = parts[0].trim().split("/");
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, "0");
        const monthNum = parseInt(dateParts[1], 10);
        const year = dateParts[2];
        
        const thaiMonths = [
          "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];
        const monthName = thaiMonths[monthNum - 1] || dateParts[1];
        const timePart = parts[1] ? parts[1].trim() : "";
        
        return `${day} ${monthName} ${year} ${timePart}`.trim();
      }
    }
    return cleaned;
  } catch {
    return rawTimestamp;
  }
}

async function fetchSpreadsheetReports(sheetUrlInput: string = DEFAULT_SHEET_URL) {
  const spreadsheetId = extractSpreadsheetId(sheetUrlInput) || "15oVvMev4APIW-6xNdh2igbjRGHzS6HJ9SV0KQnEbYD0";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

  const response = await fetch(csvUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ (HTTP Status: ${response.status})`);
  }

  const csvText = await response.text();

  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (!rows || rows.length < 2) {
    return {
      reports: [],
      summary: {
        totalSubmissions: 0,
        totalSchools: 0,
        totalPlcReports: 0,
        totalSteamReports: 0,
        bothReportsCount: 0,
        groupStats: [],
        lastFetched: new Date().toISOString(),
        sheetUrl: sheetUrlInput,
      }
    };
  }

  // Header is row[0]: ["ประทับเวลา", "โรงเรียน", "กลุ่มโรงเรียน", "แบบรายงานผลการสร้างชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC)", "แบบรายงานการจัดการเรียนรู้เชิงรุกตามแนวทางสะตีมศึกษา"]
  const dataRows = rows.slice(1);
  const reportsMap = new Map<string, any>();

  dataRows.forEach((row, index) => {
    if (!row || row.length < 2) return;
    
    const timestamp = (row[0] || "").trim();
    const schoolName = (row[1] || "").trim();
    const schoolGroup = (row[2] || "").trim() || "ไม่ระบุกลุ่ม";
    const plcUrl = (row[3] || "").trim();
    const steamUrl = (row[4] || "").trim();

    if (!schoolName) return;

    const plcFileId = extractDriveFileId(plcUrl);
    const steamFileId = extractDriveFileId(steamUrl);

    const hasPlc = Boolean(plcUrl && plcUrl.length > 5);
    const hasSteam = Boolean(steamUrl && steamUrl.length > 5);

    let completionStatus: 'complete' | 'plc_only' | 'steam_only' | 'incomplete' = 'incomplete';
    if (hasPlc && hasSteam) {
      completionStatus = 'complete';
    } else if (hasPlc) {
      completionStatus = 'plc_only';
    } else if (hasSteam) {
      completionStatus = 'steam_only';
    }

    const reportObj = {
      id: `report-${index + 1}`,
      timestamp,
      formattedDate: formatThaiDate(timestamp),
      schoolName,
      schoolGroup,
      plcUrl: plcUrl || null,
      plcFileId,
      plcThumbnailUrl: plcFileId ? `https://drive.google.com/thumbnail?id=${plcFileId}&sz=w1000` : null,
      plcPreviewUrl: plcFileId ? `https://drive.google.com/file/d/${plcFileId}/preview` : null,
      plcViewUrl: plcUrl || (plcFileId ? `https://drive.google.com/file/d/${plcFileId}/view` : null),
      steamUrl: steamUrl || null,
      steamFileId,
      steamThumbnailUrl: steamFileId ? `https://drive.google.com/thumbnail?id=${steamFileId}&sz=w1000` : null,
      steamPreviewUrl: steamFileId ? `https://drive.google.com/file/d/${steamFileId}/preview` : null,
      steamViewUrl: steamUrl || (steamFileId ? `https://drive.google.com/file/d/${steamFileId}/view` : null),
      hasPlc,
      hasSteam,
      completionStatus,
    };

    // If same school submitted multiple times, keep latest or keep all with unique IDs
    reportsMap.set(reportObj.id, reportObj);
  });

  const reports = Array.from(reportsMap.values());

  // Calculate Group Statistics
  const groupStatsMap = new Map<string, { group: string; total: number; plcCount: number; steamCount: number; bothCount: number }>();

  let totalPlc = 0;
  let totalSteam = 0;
  let bothCount = 0;

  reports.forEach((item) => {
    if (item.hasPlc) totalPlc++;
    if (item.hasSteam) totalSteam++;
    if (item.hasPlc && item.hasSteam) bothCount++;

    const grp = item.schoolGroup;
    if (!groupStatsMap.has(grp)) {
      groupStatsMap.set(grp, { group: grp, total: 0, plcCount: 0, steamCount: 0, bothCount: 0 });
    }
    const stat = groupStatsMap.get(grp)!;
    stat.total += 1;
    if (item.hasPlc) stat.plcCount += 1;
    if (item.hasSteam) stat.steamCount += 1;
    if (item.hasPlc && item.hasSteam) stat.bothCount += 1;
  });

  const groupStats = Array.from(groupStatsMap.values()).sort((a, b) => b.total - a.total);
  const uniqueSchools = new Set(reports.map(r => r.schoolName)).size;

  const summary = {
    totalSubmissions: reports.length,
    totalSchools: uniqueSchools,
    totalPlcReports: totalPlc,
    totalSteamReports: totalSteam,
    bothReportsCount: bothCount,
    groupStats,
    lastFetched: new Date().toISOString(),
    sheetUrl: sheetUrlInput,
  };

  return { reports, summary };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint to fetch sheet data
  app.get("/api/reports", async (req, res) => {
    try {
      const sheetUrlParam = (req.query.sheetUrl as string) || DEFAULT_SHEET_URL;
      const data = await fetchSpreadsheetReports(sheetUrlParam);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error fetching sheet data:", error);
      res.status(500).json({
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheets"
      });
    }
  });

  // Proxy endpoint for Google Drive file thumbnails
  app.get("/api/drive-proxy", async (req, res) => {
    try {
      const fileId = req.query.fileId as string;
      if (!fileId) {
        return res.status(400).send("Missing fileId");
      }
      
      const targetUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      const imgRes = await fetch(targetUrl);

      if (!imgRes.ok) {
        return res.status(imgRes.status).send("Failed to fetch Google Drive thumbnail");
      }

      const contentType = imgRes.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache 1 day

      const arrayBuffer = await imgRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Proxy error:", err);
      res.status(500).send("Error proxying image");
    }
  });

  // In-memory store for evaluations on the server
  let serverEvaluations: Record<string, any> = {};

  // API Endpoint to fetch server evaluations
  app.get("/api/evaluations", (req, res) => {
    res.json({ success: true, evaluations: serverEvaluations });
  });

  // API Endpoint to save evaluation in real-time and push to Google Sheets Webhook
  app.post("/api/evaluations", async (req, res) => {
    try {
      const { evaluation, webhookUrl } = req.body;
      if (!evaluation || !evaluation.schoolName) {
        return res.status(400).json({ success: false, error: "ข้อมูลการประเมินไม่ถูกต้อง" });
      }

      // 1. Update server persistent memory
      const cleanName = evaluation.schoolName.trim().replace(/^โรงเรียน/g, '').replace(/\s+/g, '').toLowerCase();
      const cleanGroup = (evaluation.schoolGroup || '').trim().replace(/^กลุ่มโรงเรียน/g, '').replace(/^กลุ่ม/g, '').replace(/\s+/g, '').toLowerCase();

      const evalObj = {
        ...evaluation,
        updatedAt: new Date().toISOString(),
      };

      serverEvaluations[evaluation.schoolName] = evalObj;
      serverEvaluations[evaluation.schoolName.trim()] = evalObj;
      serverEvaluations[cleanName] = evalObj;
      if (cleanGroup) {
        serverEvaluations[`${cleanName}_${cleanGroup}`] = evalObj;
      }

      let webhookSynced = false;
      let webhookError = null;

      // 2. Real-time post to Google Sheets Webhook / Apps Script if provided
      const targetWebhook = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (targetWebhook && targetWebhook.startsWith("http")) {
        try {
          const payload = {
            timestamp: new Date().toISOString(),
            schoolName: evaluation.schoolName,
            schoolGroup: evaluation.schoolGroup || "กลุ่มโรงเรียน",
            aiTotalScore: evaluation.aiTotalScore ?? 20,
            aiQualityLevel: evaluation.aiQualityLevel ?? "ดีเยี่ยม",
            userTotalScore: evaluation.totalScore ?? 20,
            userQualityLevel: evaluation.qualityLevel ?? "ดีเยี่ยม",
            evaluatorName: evaluation.evaluatorName || "ผู้รับผิดชอบ",
            evaluatorNotes: evaluation.evaluatorNotes || "",
            scores: evaluation.scores || {},
          };

          const sheetRes = await fetch(targetWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (sheetRes.ok) {
            webhookSynced = true;
          } else {
            webhookError = `HTTP Status: ${sheetRes.status}`;
          }
        } catch (syncErr: any) {
          console.error("Webhook sync error:", syncErr);
          webhookError = syncErr.message || "ไม่สามารถเชื่อมต่อ Google Sheet Webhook ได้";
        }
      }

      res.json({
        success: true,
        evaluation: serverEvaluations[evaluation.schoolName],
        webhookSynced,
        webhookError,
      });
    } catch (err: any) {
      console.error("Save evaluation error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
