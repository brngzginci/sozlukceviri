import fs from 'fs';
import path from 'path';

const xlsxContent = fs.readFileSync(path.resolve('node_modules/xlsx/dist/xlsx.full.min.js'), 'utf-8');

const html = `<!DOCTYPE html>
<html lang="tr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hızlı Ofis Sözlük &amp; Çeviri (Masaüstü)</title>
  <style>
    /* Modern Reset & Embedded Styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    :root {
      --bg: #09090b;
      --card-bg: #18181b;
      --card-border: #27272a;
      --text-main: #f4f4f5;
      --text-muted: #a1a1aa;
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-bg: rgba(16, 185, 129, 0.1);
      --font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body.light {
      --bg: #f4f4f5;
      --card-bg: #ffffff;
      --card-border: #e4e4e7;
      --text-main: #09090b;
      --text-muted: #71717a;
      --primary: #059669;
      --primary-hover: #047857;
      --primary-bg: rgba(5, 150, 105, 0.1);
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s, color 0.2s;
    }

    /* Sticky Top Bar */
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 40;
      background-color: rgba(24, 24, 27, 0.95);
      border-bottom: 1px solid var(--card-border);
      backdrop-filter: blur(8px);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    body.light .top-bar {
      background-color: rgba(255, 255, 255, 0.95);
    }
    .top-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .brand-badge {
      background-color: #059669;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .brand-title {
      font-weight: 700;
      font-size: 14px;
      display: none;
    }
    @media (min-width: 640px) {
      .brand-title { display: inline-block; }
    }
    .excel-status-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-bg);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--primary);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .excel-status-btn:hover {
      background: rgba(16, 185, 129, 0.2);
    }
    .excel-count-pill {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 12px;
    }

    /* Quick Search in Top Bar */
    .top-search-wrap {
      flex: 1;
      max-width: 480px;
      position: relative;
    }
    .top-search-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 13px;
      color: var(--text-main);
      outline: none;
      transition: all 0.2s;
    }
    body.light .top-search-input {
      background: #f4f4f5;
    }
    .top-search-input:focus {
      border-color: var(--primary);
      background: var(--card-bg);
    }

    /* Top Bar Action Buttons */
    .action-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-main);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    body.light .btn-outline:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .icon-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    /* Main Container */
    .main-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px 16px;
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Helper Ribbon */
    .helper-ribbon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .direction-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 5px 12px;
      border-radius: 8px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
    }
    .auto-clear-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-bg);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    /* 2 HUGE BLOCKS GRID */
    .grid-blocks {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      align-items: stretch;
    }
    @media (min-width: 900px) {
      .grid-blocks {
        grid-template-columns: 1fr 1fr;
      }
    }

    /* HUGE CARD */
    .huge-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
      position: relative;
    }
    .huge-card-header {
      padding: 12px 18px;
      border-bottom: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-label-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary);
    }
    .huge-card-body {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .huge-textarea {
      width: 100%;
      height: 100%;
      min-height: 220px;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      color: var(--text-main);
      font-size: 26px;
      line-height: 1.35;
      font-weight: 600;
      font-family: inherit;
    }
    .huge-textarea::placeholder {
      color: rgba(161, 161, 170, 0.4);
    }
    @media (min-width: 640px) {
      .huge-textarea {
        font-size: 32px;
      }
    }
    .huge-card-footer {
      padding: 10px 18px;
      border-top: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.02);
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* OUTPUT CARD SPECIFICS */
    .output-card {
      cursor: pointer;
      user-select: none;
    }
    .output-card:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15);
    }
    .output-card.copied {
      border-color: var(--primary) !important;
      background-color: rgba(16, 185, 129, 0.08) !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3) !important;
    }
    .output-text {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.5px;
      color: var(--text-main);
      word-break: break-word;
    }
    @media (min-width: 640px) {
      .output-text {
        font-size: 42px;
      }
    }
    .output-empty {
      color: rgba(161, 161, 170, 0.4);
      font-size: 16px;
      text-align: center;
      font-weight: 500;
    }
    .copy-pill {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .output-card:hover .copy-pill {
      background: var(--primary);
      color: #ffffff;
    }
    .copy-pill.done {
      background: #059669 !important;
      color: #ffffff !important;
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      margin-top: 8px;
    }
    .meaning-pills-wrap {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .meaning-pill {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--card-border);
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .meaning-pill:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    /* Modal Backdrop */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-backdrop.active {
      display: flex;
    }
    .modal-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      max-width: 540px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      padding: 14px 20px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-size: 13px;
    }
    .modal-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background: rgba(255, 255, 255, 0.02);
    }
    .form-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-main);
      font-size: 13px;
      outline: none;
    }
    body.light .form-input {
      background: #f4f4f5;
    }
    .form-input:focus {
      border-color: var(--primary);
    }
    label {
      font-weight: 600;
      margin-bottom: 4px;
      display: block;
      font-size: 12px;
      color: var(--text-main);
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--card-border);
      padding: 12px 16px;
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- STICKY TOP BAR -->
  <header class="top-bar">
    <div class="top-bar-inner">
      <div class="brand-section">
        <span class="brand-badge">TR</span>
        <span class="brand-title">Ofis Sözlük</span>
        
        <button id="openExcelModalBtn" class="excel-status-btn" title="Excel dosyasını değiştir veya yükle">
          <span>📗 <span id="currentFileName">Hazır Sözlük</span></span>
          <span id="termCountBadge" class="excel-count-pill">15 Terim</span>
        </button>
      </div>

      <div class="top-search-wrap">
        <input type="text" id="topSearchInput" class="top-search-input" placeholder="Hızlı arama / metin girişi (ESC ile sil)...">
      </div>

      <div class="action-group">
        <button id="openAddTermModalBtn" class="btn btn-primary">
          <span>+ Yeni Terim</span>
        </button>
        <button id="exportExcelBtn" class="btn btn-outline" title="Güncel Excel dosyasını indir">
          <span>📥 Excel İndir</span>
        </button>
        <button id="themeToggleBtn" class="icon-btn" title="Açık/Koyu Tema">
          <span id="themeIcon">☀️</span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN VIEW -->
  <main class="main-content">
    
    <div class="helper-ribbon">
      <button id="toggleDirectionBtn" class="direction-pill">
        <span>⇄</span>
        <span id="directionLabel">Otomatik Algıla (EN ↔ TR)</span>
      </button>

      <div class="auto-clear-tag">
        <span>✓ Çıktıya tıklayınca kopyalar ve iki alanı otomatik temizler</span>
      </div>
    </div>

    <!-- 2 HUGE BLOCKS -->
    <div class="grid-blocks">
      
      <!-- INPUT BLOCK -->
      <div class="huge-card" id="inputCard">
        <div class="huge-card-header">
          <div class="card-label">
            <span class="card-label-dot"></span>
            <span id="inputLabelText">İngilizce Metin Girişi</span>
            <span id="pasteToast" style="display:none; color:#10b981; font-weight:700; margin-left:8px;">Panodan yapıştırıldı ✓</span>
          </div>

          <div style="display:flex; gap:6px;">
            <button id="pasteBtn" class="btn btn-primary" style="padding:4px 8px; font-size:11px;">
              📋 Panodan Yapıştır
            </button>
            <button id="clearInputBtn" class="icon-btn" style="padding:4px 8px; font-size:11px;" title="Temizle">
              ✕
            </button>
          </div>
        </div>

        <div class="huge-card-body">
          <textarea id="mainTextarea" class="huge-textarea" placeholder="İngilizce metni buraya yapıştırın veya yazın..."></textarea>
        </div>

        <div class="huge-card-footer">
          <span>Klavyeden <strong>Ctrl + V</strong> yapabilir veya butona basabilirsiniz.</span>
          <span id="charCount" style="font-family:monospace; font-weight:600;">0 karakter</span>
        </div>
      </div>

      <!-- OUTPUT BLOCK -->
      <div class="huge-card output-card" id="outputCard" title="Tıklayarak kopyalayın">
        <div class="huge-card-header">
          <div class="card-label">
            <span class="card-label-dot"></span>
            <span id="outputLabelText">Türkçe Karşılık (Excel)</span>
            <span id="matchTypeBadge" class="copy-pill" style="display:none; margin-left:8px;"></span>
          </div>

          <div>
            <span id="copyPill" class="copy-pill">
              📋 Tıkla Kopyala &amp; Sıfırla
            </span>
          </div>
        </div>

        <div class="huge-card-body">
          <div id="outputText" class="output-text" style="display:none;"></div>
          <div id="outputEmpty" class="output-empty">
            Sol kutuya metin yapıştırdığınızda karşılığı anında burada kocaman belirir.
          </div>

          <div id="outputMeta" style="display:none;">
            <div id="sourceReminder" style="color:var(--text-muted); font-size:12px; margin-top:8px;"></div>
            <div id="meaningPills" class="meaning-pills-wrap"></div>
          </div>
        </div>

        <div class="huge-card-footer">
          <span>Yazıya tıklayınca panoya kopyalar ve bir sonraki kelime için alanı boşaltır.</span>
          <span id="copiedToast" style="display:none; color:#10b981; font-weight:700;">✓ Kopyalandı &amp; Temizlendi!</span>
        </div>
      </div>

    </div>

  </main>

  <!-- EXCEL MODAL -->
  <div id="excelModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:700;">📗 Excel Sözlük Dosyası Yükle</h3>
        <button id="closeExcelModal" class="icon-btn">✕</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--text-muted);">
          Bilgisayarınızdaki <strong>.xlsx, .xls veya .csv</strong> sözlük dosyasını seçin. Dosyanız tarayıcının yerel hafızasına kaydedilir ve her açılışta hatırlanır.
        </p>

        <div style="border:2px dashed var(--card-border); padding:24px; border-radius:12px; text-align:center;">
          <input type="file" id="excelFileInput" accept=".xlsx, .xls, .csv" style="display:none;">
          <button type="button" class="btn btn-primary" onclick="document.getElementById('excelFileInput').click()">
            📁 Excel Dosyası Seç
          </button>
          <div id="selectedFileName" style="margin-top:8px; font-weight:600; font-size:12px;"></div>
        </div>

        <div id="mappingSection" style="display:none;">
          <div style="margin-bottom:8px;">
            <label>İngilizce Metin Sütunu:</label>
            <select id="sourceColSelect" class="form-input"></select>
          </div>
          <div>
            <label>Türkçe Karşılık Sütunu:</label>
            <select id="targetColSelect" class="form-input"></select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="saveExcelMappingBtn" class="btn btn-primary" style="display:none;">Bu Sözlüğü Kaydet</button>
        <button class="btn btn-outline" onclick="document.getElementById('excelModal').classList.remove('active')">Kapat</button>
      </div>
    </div>
  </div>

  <!-- ADD TERM MODAL -->
  <div id="addTermModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:700;">➕ Yeni Terim Ekle</h3>
        <button class="icon-btn" onclick="document.getElementById('addTermModal').classList.remove('active')">✕</button>
      </div>
      <div class="modal-body">
        <div>
          <label>İngilizce Metin:</label>
          <input type="text" id="newSourceInput" class="form-input" placeholder="Örn: Action Item">
        </div>
        <div>
          <label>Türkçe Karşılığı:</label>
          <input type="text" id="newTargetInput" class="form-input" placeholder="Örn: Aksiyon Maddesi / Yapılacak İş">
        </div>
        <div>
          <label>Kategori (Opsiyonel):</label>
          <input type="text" id="newCatInput" class="form-input" placeholder="Örn: Toplantı">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="document.getElementById('addTermModal').classList.remove('active')">İptal</button>
        <button id="saveNewTermBtn" class="btn btn-primary">Sözlüğe Kaydet</button>
      </div>
    </div>
  </div>

  <footer>
    <span>%100 Çevrimdışı &bull; Yönetici İzni Gerekmez &bull; Excel Bilgisayarınızda Saklanır</span>
  </footer>

  <!-- EMBEDDED SHEETJS SCRIPT (No module, runs everywhere!) -->
  <script>
    ${xlsxContent}
  </script>

  <!-- PURE JAVASCRIPT APPLICATION LOGIC (No type="module", runs directly from file:///) -->
  <script>
    // Initial Dictionary
    let dictionary = [
      { s: 'action item', t: 'Aksiyon Maddesi / Yapılacak İş', origS: 'Action Item', origT: 'Aksiyon Maddesi / Yapılacak İş', cat: 'Toplantı' },
      { s: 'approve', t: 'Onaylamak', origS: 'Approve', origT: 'Onaylamak', cat: 'İş Akışı' },
      { s: 'pending approval', t: 'Onay Bekliyor', origS: 'Pending Approval', origT: 'Onay Bekliyor', cat: 'Durum' },
      { s: 'deliverable', t: 'Teslim Edilecek Çıktı', origS: 'Deliverable', origT: 'Teslim Edilecek Çıktı', cat: 'Proje' },
      { s: 'due date', t: 'Son Teslim Tarihi', origS: 'Due Date', origT: 'Son Teslim Tarihi', cat: 'Zaman Planı' },
      { s: 'invoice', t: 'Fatura', origS: 'Invoice', origT: 'Fatura', cat: 'Finans' },
      { s: 'purchase order', t: 'Satın Alma Siparişi (PO)', origS: 'Purchase Order', origT: 'Satın Alma Siparişi (PO)', cat: 'Satın Alma' },
      { s: 'follow up', t: 'Takip Etmek / Gelişmeleri İzlemek', origS: 'Follow up', origT: 'Takip Etmek / Gelişmeleri İzlemek', cat: 'İletişim' },
      { s: 'out of office', t: 'Ofis Dışında (İzinli / Görevli)', origS: 'Out of Office', origT: 'Ofis Dışında (İzinli / Görevli)', cat: 'Durum' },
      { s: 'quarterly report', t: 'Üç Aylık Faaliyet Raporu', origS: 'Quarterly Report', origT: 'Üç Aylık Faaliyet Raporu', cat: 'Raporlama' },
      { s: 'stakeholder', t: 'Paydaş / İlgili Taraf', origS: 'Stakeholder', origT: 'Paydaş / İlgili Taraf', cat: 'Yönetim' },
      { s: 'turnaround time', t: 'Geri Dönüş Süresi (TAT)', origS: 'Turnaround Time', origT: 'Geri Dönüş Süresi (TAT)', cat: 'Metrikler' },
      { s: 'work in progress', t: 'Devam Eden Çalışma (WIP)', origS: 'Work in Progress', origT: 'Devam Eden Çalışma (WIP)', cat: 'Durum' },
      { s: 'scope of work', t: 'İş Kapsamı (SOW)', origS: 'Scope of Work', origT: 'İş Kapsamı (SOW)', cat: 'Sözleşme' },
      { s: 'benchmark', t: 'Kıyaslama Ölçütü', origS: 'Benchmark', origT: 'Kıyaslama Ölçütü', cat: 'Analiz' }
    ];

    let currentFileName = 'Temel Ofis Sözlüğü (Hazır)';
    let searchDirection = 'auto'; // 'auto', 'en-tr', 'tr-en'
    let activeResult = null;
    let parsedWorkbook = null;

    // DOM Elements
    const mainTextarea = document.getElementById('mainTextarea');
    const topSearchInput = document.getElementById('topSearchInput');
    const outputCard = document.getElementById('outputCard');
    const outputText = document.getElementById('outputText');
    const outputEmpty = document.getElementById('outputEmpty');
    const outputMeta = document.getElementById('outputMeta');
    const sourceReminder = document.getElementById('sourceReminder');
    const meaningPills = document.getElementById('meaningPills');
    const matchTypeBadge = document.getElementById('matchTypeBadge');
    const copyPill = document.getElementById('copyPill');
    const copiedToast = document.getElementById('copiedToast');
    const pasteToast = document.getElementById('pasteToast');
    const charCount = document.getElementById('charCount');
    const termCountBadge = document.getElementById('termCountBadge');
    const currentFileNameSpan = document.getElementById('currentFileName');
    const directionLabel = document.getElementById('directionLabel');

    // Normalization helper (TR & EN lowercased & stripped)
    function normalize(str) {
      if (!str) return '';
      return String(str)
        .trim()
        .toLowerCase()
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i')
        .replace(/[.,/#!$%^&*;:{}=\\-_\\u0060~()?"'’]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
    }

    // STRICT PREFIX-FIRST SEARCH LOGIC
    function searchDictionary(query) {
      const q = normalize(query);
      if (!q) return null;

      // 1. Exact Match
      for (const item of dictionary) {
        if (searchDirection === 'en-tr' || searchDirection === 'auto') {
          if (item.s === q) return { item, type: 'Tam Eşleşme' };
        }
        if (searchDirection === 'tr-en' || searchDirection === 'auto') {
          if (item.t && normalize(item.t) === q) return { item, type: 'Tam Eşleşme' };
        }
      }

      // 2. Prefix Match (Starts with query)
      const prefixMatches = [];
      for (const item of dictionary) {
        if (searchDirection === 'en-tr' || searchDirection === 'auto') {
          if (item.s.startsWith(q)) {
            prefixMatches.push({ item, score: 1000 - Math.abs(item.s.length - q.length) });
            continue;
          }
          const words = item.s.split(' ');
          if (words.some(w => w.startsWith(q))) {
            prefixMatches.push({ item, score: 800 - Math.abs(item.s.length - q.length) });
            continue;
          }
        }
        if (searchDirection === 'tr-en' || searchDirection === 'auto') {
          const normT = normalize(item.t);
          if (normT.startsWith(q)) {
            prefixMatches.push({ item, score: 900 - Math.abs(normT.length - q.length) });
            continue;
          }
        }
      }

      if (prefixMatches.length > 0) {
        prefixMatches.sort((a, b) => b.score - a.score);
        return { item: prefixMatches[0].item, type: 'Ön Ek (Başlangıç) Eşleşmesi' };
      }

      // 3. Fallback: Only if zero prefix matches exist, look for substring
      const substringMatches = [];
      for (const item of dictionary) {
        if (searchDirection === 'en-tr' || searchDirection === 'auto') {
          if (item.s.includes(q)) {
            substringMatches.push({ item, score: 500 - Math.abs(item.s.length - q.length) });
            continue;
          }
        }
        if (searchDirection === 'tr-en' || searchDirection === 'auto') {
          const normT = normalize(item.t);
          if (normT.includes(q)) {
            substringMatches.push({ item, score: 450 - Math.abs(normT.length - q.length) });
            continue;
          }
        }
      }

      if (substringMatches.length > 0) {
        substringMatches.sort((a, b) => b.score - a.score);
        return { item: substringMatches[0].item, type: 'İçeren Eşleşme' };
      }

      return null;
    }

    // Update Output Display
    function renderResult(result) {
      activeResult = result;
      if (!result) {
        outputText.style.display = 'none';
        outputEmpty.style.display = 'block';
        outputMeta.style.display = 'none';
        matchTypeBadge.style.display = 'none';
        copyPill.style.display = 'none';
        return;
      }

      const item = result.item;
      const isReverse = searchDirection === 'tr-en';
      const mainText = isReverse ? item.origS : item.origT;
      const subText = isReverse ? item.origT : item.origS;

      outputText.textContent = mainText;
      outputText.style.display = 'block';
      outputEmpty.style.display = 'none';
      outputMeta.style.display = 'block';
      copyPill.style.display = 'inline-flex';

      matchTypeBadge.textContent = result.type;
      matchTypeBadge.style.display = 'inline-flex';

      sourceReminder.textContent = 'Kaynak Terim: ' + subText + (item.cat ? ' • ' + item.cat : '');

      // Multiple meanings pills
      meaningPills.innerHTML = '';
      const parts = mainText.split(/[/;,]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        parts.forEach(p => {
          const pill = document.createElement('span');
          pill.className = 'meaning-pill';
          pill.textContent = p;
          pill.onclick = (e) => {
            e.stopPropagation();
            copyAndAutoClear(p);
          };
          meaningPills.appendChild(pill);
        });
      }
    }

    // Input handlers
    function onInputChange(val) {
      mainTextarea.value = val;
      topSearchInput.value = val;
      charCount.textContent = val.trim().length + ' karakter';

      if (!val.trim()) {
        renderResult(null);
        return;
      }

      const found = searchDictionary(val);
      renderResult(found);
    }

    mainTextarea.addEventListener('input', (e) => onInputChange(e.target.value));
    topSearchInput.addEventListener('input', (e) => onInputChange(e.target.value));

    // COPY TO CLIPBOARD AND AUTO-CLEAR BOTH AREAS!
    function copyAndAutoClear(textToCopy) {
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        outputCard.classList.add('copied');
        copyPill.textContent = '✓ Kopyalandı & Temizlendi!';
        copyPill.classList.add('done');
        copiedToast.style.display = 'inline';

        // Auto-clear after 450ms for practical speed!
        setTimeout(() => {
          outputCard.classList.remove('copied');
          copyPill.textContent = '📋 Tıkla Kopyala & Sıfırla';
          copyPill.classList.remove('done');
          copiedToast.style.display = 'none';

          // Reset inputs
          onInputChange('');
          mainTextarea.focus();
        }, 450);
      }).catch(err => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);

        setTimeout(() => {
          onInputChange('');
          mainTextarea.focus();
        }, 450);
      });
    }

    outputCard.addEventListener('click', () => {
      if (activeResult) {
        const text = searchDirection === 'tr-en' ? activeResult.item.origS : activeResult.item.origT;
        copyAndAutoClear(text);
      }
    });

    // Native Ctrl+V Listener (NEVER triggers permission prompt in Chrome!)
    window.addEventListener('paste', (e) => {
      if (document.activeElement !== mainTextarea && document.activeElement !== topSearchInput) {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text && text.trim()) {
          onInputChange(text.trim());
          pasteToast.style.display = 'inline';
          setTimeout(() => pasteToast.style.display = 'none', 1500);
        }
      }
    });

    // Instant Paste on Click
    async function doInstantPaste() {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          onInputChange(text.trim());
          pasteToast.style.display = 'inline';
          setTimeout(() => pasteToast.style.display = 'none', 1500);
        }
      } catch (err) {
        mainTextarea.focus();
      }
    }

    document.getElementById('inputCard').addEventListener('click', (e) => {
      if (e.target.id !== 'clearInputBtn') {
        doInstantPaste();
      }
    });

    mainTextarea.addEventListener('click', (e) => {
      doInstantPaste();
    });

    document.getElementById('pasteBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      doInstantPaste();
    });

    // Clear Button & ESC shortcut
    document.getElementById('clearInputBtn').addEventListener('click', () => {
      onInputChange('');
      mainTextarea.focus();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        onInputChange('');
      }
    });

    // Toggle Direction
    document.getElementById('toggleDirectionBtn').addEventListener('click', () => {
      if (searchDirection === 'auto') {
        searchDirection = 'en-tr';
        directionLabel.textContent = 'İngilizce → Türkçe';
      } else if (searchDirection === 'en-tr') {
        searchDirection = 'tr-en';
        directionLabel.textContent = 'Türkçe → İngilizce';
      } else {
        searchDirection = 'auto';
        directionLabel.textContent = 'Otomatik Algıla (EN ↔ TR)';
      }
      onInputChange(mainTextarea.value);
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    let isDark = true;
    themeToggleBtn.addEventListener('click', () => {
      isDark = !isDark;
      if (isDark) {
        document.body.classList.remove('light');
        document.documentElement.classList.add('dark');
        themeIcon.textContent = '☀️';
      } else {
        document.body.classList.add('light');
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = '🌙';
      }
      localStorage.setItem('ofis_dict_theme', isDark ? 'dark' : 'light');
    });

    // IndexedDB for Persistent Offline Storage
    const DB_NAME = 'OfisSozlukDB_Offline';
    function openDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('entries')) {
            db.createObjectStore('entries', { keyPath: 's' });
          }
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta', { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    async function saveToIndexedDB(items, fileName) {
      try {
        const db = await openDB();
        const tx = db.transaction(['entries', 'meta'], 'readwrite');
        const entriesStore = tx.objectStore('entries');
        const metaStore = tx.objectStore('meta');

        entriesStore.clear();
        for (const it of items) {
          entriesStore.put(it);
        }
        metaStore.put({ key: 'currentMeta', fileName, total: items.length });
      } catch (err) {
        console.warn('IndexedDB save:', err);
      }
    }

    async function loadFromIndexedDB() {
      try {
        const db = await openDB();
        const tx = db.transaction(['entries', 'meta'], 'readonly');
        const entriesStore = tx.objectStore('entries');
        const metaStore = tx.objectStore('meta');

        const entriesReq = entriesStore.getAll();
        const metaReq = metaStore.get('currentMeta');

        entriesReq.onsuccess = () => {
          if (entriesReq.result && entriesReq.result.length > 0) {
            dictionary = entriesReq.result;
            metaReq.onsuccess = () => {
              if (metaReq.result) {
                currentFileName = metaReq.result.fileName || 'Excel Sözlüğü';
                currentFileNameSpan.textContent = currentFileName;
              }
            };
            termCountBadge.textContent = dictionary.length + ' Terim';
          }
        };
      } catch (err) {
        console.warn('IndexedDB load:', err);
      }
    }
    loadFromIndexedDB();

    // Excel Modal & File Parsing
    const excelModal = document.getElementById('excelModal');
    document.getElementById('openExcelModalBtn').addEventListener('click', () => {
      excelModal.classList.add('active');
    });
    document.getElementById('closeExcelModal').addEventListener('click', () => {
      excelModal.classList.remove('active');
    });

    const excelFileInput = document.getElementById('excelFileInput');
    const selectedFileName = document.getElementById('selectedFileName');
    const mappingSection = document.getElementById('mappingSection');
    const sourceColSelect = document.getElementById('sourceColSelect');
    const targetColSelect = document.getElementById('targetColSelect');
    const saveExcelMappingBtn = document.getElementById('saveExcelMappingBtn');

    excelFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      selectedFileName.textContent = file.name;
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      parsedWorkbook = wb;

      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      if (rows.length === 0) {
        alert('Bu Excel dosyasında veri satırı bulunamadı.');
        return;
      }

      const cols = Object.keys(rows[0]);
      sourceColSelect.innerHTML = '';
      targetColSelect.innerHTML = '';

      cols.forEach((c, idx) => {
        const o1 = new Option(c, c);
        const o2 = new Option(c, c);
        sourceColSelect.add(o1);
        targetColSelect.add(o2);
      });

      if (cols.length >= 2) {
        targetColSelect.selectedIndex = 1;
      }

      mappingSection.style.display = 'block';
      saveExcelMappingBtn.style.display = 'inline-flex';
    });

    saveExcelMappingBtn.addEventListener('click', () => {
      if (!parsedWorkbook) return;
      const firstSheet = parsedWorkbook.Sheets[parsedWorkbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      const srcCol = sourceColSelect.value;
      const tgtCol = targetColSelect.value;

      const newDict = [];
      rows.forEach(r => {
        const s = String(r[srcCol] || '').trim();
        const t = String(r[tgtCol] || '').trim();
        if (s || t) {
          newDict.push({
            s: normalize(s),
            t: t,
            origS: s,
            origT: t,
            cat: ''
          });
        }
      });

      if (newDict.length > 0) {
        dictionary = newDict;
        currentFileName = excelFileInput.files[0].name;
        currentFileNameSpan.textContent = currentFileName;
        termCountBadge.textContent = dictionary.length + ' Terim';
        saveToIndexedDB(dictionary, currentFileName);
        excelModal.classList.remove('active');
        alert(dictionary.length + ' terim başarıyla yüklendi ve bilgisayarınıza kaydedildi!');
        onInputChange(mainTextarea.value);
      }
    });

    // Add Term Modal
    const addTermModal = document.getElementById('addTermModal');
    document.getElementById('openAddTermModalBtn').addEventListener('click', () => {
      document.getElementById('newSourceInput').value = mainTextarea.value.trim();
      document.getElementById('newTargetInput').value = '';
      addTermModal.classList.add('active');
    });

    document.getElementById('saveNewTermBtn').addEventListener('click', () => {
      const s = document.getElementById('newSourceInput').value.trim();
      const t = document.getElementById('newTargetInput').value.trim();
      const cat = document.getElementById('newCatInput').value.trim();

      if (!s || !t) {
        alert('Lütfen hem İngilizce hem Türkçe alanlarını doldurun.');
        return;
      }

      const item = {
        s: normalize(s),
        t: t,
        origS: s,
        origT: t,
        cat: cat
      };

      dictionary.unshift(item);
      termCountBadge.textContent = dictionary.length + ' Terim';
      saveToIndexedDB(dictionary, currentFileName);
      addTermModal.classList.remove('active');
      onInputChange(s);
      alert('Terim sözlüğe eklendi ve kaydedildi!');
    });

    // Export to Excel (.xlsx)
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
      const exportData = dictionary.map(d => ({
        'İngilizce': d.origS,
        'Türkçe': d.origT,
        'Kategori': d.cat || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sozluk');
      XLSX.writeFile(wb, currentFileName.endsWith('.xlsx') ? currentFileName : 'guncel_ofis_sozluk.xlsx');
    });

    // Focus on start
    mainTextarea.focus();
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve('public/ofis_sozluk_tam_surum.html'), html, 'utf-8');
console.log('Successfully generated public/ofis_sozluk_tam_surum.html (Size:', Buffer.byteLength(html), 'bytes)');
