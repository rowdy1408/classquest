import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, HelpCircle, Upload } from '../icons';
import Modal from './Modal';
import { googleSheetExportUrl, parseClassWorkbook } from '../utils/classImport';

const templateUrl = `${import.meta.env.BASE_URL}ClassQuest_Import_Template.xlsx`;

function SummaryCard({ value, label }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

export function ClassImportHelpModal({ open, onClose }) {
  return (
    <Modal open={open} title="Cách chuẩn bị file tạo lớp" onClose={onClose} wide>
      <div className="import-help-stack">
        <div className="import-help-hero">
          <span><FileSpreadsheet size={28} /></span>
          <div><h3>Dùng đúng file mẫu để hệ thống đọc tự động</h3><p>Giữ nguyên tên ba sheet và hàng tiêu đề. Bạn chỉ cần thay dữ liệu mẫu bằng thông tin lớp của mình.</p></div>
        </div>
        <a className="button primary import-template-button" href={templateUrl} download>
          <Download size={18} /> Tải file Excel mẫu
        </a>
        <div className="import-help-grid">
          <article><b>1</b><div><strong>THONG_TIN_LOP</strong><p>Nhập tên lớp, mã lớp, level, số buổi, ngày bắt đầu và mô tả.</p></div></article>
          <article><b>2</b><div><strong>BUOI_HOC_VA_TEST</strong><p>Mỗi dòng là một buổi học hoặc bài test. Loại dùng: BUOI_HOC, PROGRESS_TEST, FINAL_TEST.</p></div></article>
          <article><b>3</b><div><strong>HOC_VIEN</strong><p>Họ và tên là bắt buộc. Email, vai trò, giới tính và ghi chú có thể để trống.</p></div></article>
        </div>
        <div className="import-note-box">
          <strong>Nếu dùng Google Sheets</strong>
          <p>Tải file mẫu lên Google Sheets, giữ nguyên ba tab, sau đó chọn Chia sẻ → Bất kỳ ai có đường liên kết → Người xem. Dán link vào ClassQuest. Nếu tổ chức của bạn chặn link công khai, hãy tải Sheet xuống dạng Microsoft Excel (.xlsx) rồi nhập file.</p>
        </div>
        <div className="import-note-box neutral">
          <strong>Sau khi nhập</strong>
          <p>ClassQuest sẽ tạo lớp, Quest Map, ngày test, 8 quy tắc mẫu và danh sách học viên. Học viên ở trạng thái chưa kích hoạt; giáo viên cấp mật khẩu riêng khi sẵn sàng.</p>
        </div>
      </div>
    </Modal>
  );
}

export default function ClassImportModal({ open, onClose, onImport, onHelp }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('file');
  const [googleLink, setGoogleLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode('file');
    setGoogleLink('');
    setFileName('');
    setPreview(null);
    setMessage('');
    setBusy(false);
  }, [open]);

  const readWorkbook = async (blob, label) => {
    setBusy(true);
    setMessage('');
    setPreview(null);
    try {
      const result = await parseClassWorkbook(blob);
      setPreview(result);
      setFileName(label);
      if (result.errors.length) setMessage('File còn lỗi. Hãy sửa các dòng được báo rồi nhập lại.');
    } catch (error) {
      console.warn('Could not parse class workbook:', error);
      setMessage('Không đọc được file. Hãy dùng file mẫu .xlsx và giữ nguyên tên các sheet.');
    } finally {
      setBusy(false);
    }
  };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      setMessage('ClassQuest hiện nhận file Excel .xlsx.');
      setPreview(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage('File lớn hơn 10 MB. Hãy xóa hình ảnh hoặc nội dung không cần thiết rồi thử lại.');
      setPreview(null);
      return;
    }
    await readWorkbook(file, file.name);
  };

  const readGoogleSheet = async () => {
    setBusy(true);
    setMessage('');
    setPreview(null);
    try {
      const response = await fetch(googleSheetExportUrl(googleLink));
      if (!response.ok) throw new Error(`Google Sheet export returned ${response.status}`);
      const blob = await response.blob();
      await readWorkbook(blob, 'Google Sheets');
    } catch (error) {
      console.warn('Could not import Google Sheet:', error);
      setBusy(false);
      setMessage('Không thể đọc Google Sheet. Hãy bật “Bất kỳ ai có đường liên kết – Người xem”, hoặc tải Sheet xuống dạng .xlsx rồi nhập file.');
    }
  };

  const valid = preview && !preview.errors.length && preview.classInfo;
  const sessionPreview = useMemo(() => preview?.sessions.slice(0, 6) || [], [preview]);

  const confirmImport = () => {
    if (!valid) return;
    onImport(preview);
    onClose();
  };

  return (
    <Modal open={open} title="Nhập lớp từ Excel hoặc Google Sheets" onClose={onClose} wide>
      <div className="class-import-stack">
        <div className="import-source-tabs" role="tablist" aria-label="Nguồn dữ liệu">
          <button type="button" className={mode === 'file' ? 'active' : ''} onClick={() => setMode('file')}><FileSpreadsheet size={17} /> File Excel</button>
          <button type="button" className={mode === 'google' ? 'active' : ''} onClick={() => setMode('google')}>🔗 Google Sheets</button>
          <button type="button" className="import-help-button" onClick={onHelp} aria-label="Xem hướng dẫn tạo file"><HelpCircle size={17} /> Cách tạo file</button>
        </div>

        {mode === 'file' ? (
          <div className="import-drop-zone">
            <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={chooseFile} hidden />
            <span><Upload size={28} /></span>
            <div><strong>{fileName || 'Chọn file ClassQuest .xlsx'}</strong><p>Tối đa 10 MB · hệ thống chỉ đọc dữ liệu, không tải file lên máy chủ.</p></div>
            <button type="button" className="button secondary" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? 'Đang đọc…' : 'Chọn file'}</button>
          </div>
        ) : (
          <div className="google-sheet-import">
            <label><span>Link Google Sheet</span><input value={googleLink} onChange={(event) => setGoogleLink(event.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." /></label>
            <button type="button" className="button secondary" disabled={busy || !googleLink.trim()} onClick={readGoogleSheet}>{busy ? 'Đang đọc…' : 'Đọc Google Sheet'}</button>
            <small>Sheet cần bật quyền “Bất kỳ ai có đường liên kết – Người xem”.</small>
          </div>
        )}

        {message && <div className="form-error">⚠️ {message}</div>}

        {preview && (
          <div className="import-preview">
            <div className="import-preview-heading"><div><small>XEM TRƯỚC</small><h3>{preview.classInfo?.name || 'Chưa đọc được tên lớp'}</h3><p>{fileName}</p></div><span className={preview.errors.length ? 'invalid' : 'valid'}>{preview.errors.length ? 'Cần sửa file' : 'Sẵn sàng tạo lớp'}</span></div>
            <div className="import-summary-grid">
              <SummaryCard value={preview.classInfo?.sessionCount || 0} label="Buổi học" />
              <SummaryCard value={preview.tests.filter((test) => test.type === 'progress').length} label="Progress Test" />
              <SummaryCard value={preview.tests.filter((test) => test.type === 'final').length} label="Final Test" />
              <SummaryCard value={preview.students.length} label="Học viên" />
            </div>

            {!!preview.errors.length && <div className="import-issue-list errors"><strong>Lỗi cần sửa</strong>{preview.errors.map((error) => <p key={error}>• {error}</p>)}</div>}
            {!!preview.warnings.length && <div className="import-issue-list warnings"><strong>Lưu ý</strong>{preview.warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div>}

            {!!sessionPreview.length && (
              <div className="import-table-wrap"><table><thead><tr><th>Buổi</th><th>Tên</th><th>Ngày</th><th>Giờ học</th></tr></thead><tbody>{sessionPreview.map((session) => <tr key={`${session.order}-${session.date}`}><td>{session.order}</td><td>{session.title}</td><td>{session.date}</td><td>{session.start && session.end ? `${session.start}–${session.end}` : 'Chưa có'}</td></tr>)}</tbody></table>{preview.sessions.length > sessionPreview.length && <small>Và {preview.sessions.length - sessionPreview.length} buổi khác…</small>}</div>
            )}
          </div>
        )}

        <div className="form-actions import-actions">
          <button className="button ghost" type="button" onClick={onClose}>Hủy</button>
          <button className="button primary" type="button" disabled={!valid || busy} onClick={confirmImport}>Tạo lớp từ dữ liệu</button>
        </div>
      </div>
    </Modal>
  );
}

