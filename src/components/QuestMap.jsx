import React, { useEffect, useState } from 'react';
import { ArrowUp, Check, Crown, Lock, Play, Swords } from '../icons';
import Modal from './Modal';

function nodeIcon(node) {
  if (node.type === 'final') return <Crown size={25} />;
  if (node.type === 'miniboss') return <Swords size={22} />;
  if (node.status === 'completed') return <Check size={20} />;
  if (node.status === 'locked') return <Lock size={18} />;
  return <Play size={18} />;
}

const statusLabels = {
  locked: 'Đã khóa',
  available: 'Đang mở',
  completed: 'Đã hoàn thành',
  submitted: 'Đã nộp',
  approved: 'Đã duyệt',
  revision: 'Cần chỉnh sửa',
};

const evidenceLabels = {
  'Google link, image, or text': 'Đường dẫn, hình ảnh hoặc văn bản',
  'Google link only': 'Chỉ đường dẫn',
  'Evidence image only': 'Chỉ hình ảnh',
  'Written response only': 'Chỉ câu trả lời viết',
  'Teacher-scored test evidence': 'Bài kiểm tra do giáo viên chấm',
};

function getSubmissionLock(node) {
  if (node.submissionLocked) return { locked: true, reason: 'Giáo viên đã đóng phần nộp bài.' };
  if (node.lockAfterDeadline && node.deadline && new Date(node.deadline).getTime() < Date.now()) {
    return { locked: true, reason: `Đã quá hạn nộp bài: ${new Date(node.deadline).toLocaleString('vi-VN')}.` };
  }
  return { locked: false, reason: '' };
}

export default function QuestMap({ nodes, submissions = [], studentId, onSubmit, teacherMode = false, onEdit, onDelete }) {
  const [selected, setSelected] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sorted = [...nodes].sort((a, b) => a.order - b.order);
  const submission = selected && studentId ? submissions.find((item) => item.studentId === studentId && item.nodeId === selected.id) : null;
  const lockState = selected ? getSubmissionLock(selected) : { locked: false, reason: '' };

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 520);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <div className="quest-map-shell">
        <div className="quest-path-line" />
        {sorted.map((node, index) => {
          const nodeLock = getSubmissionLock(node);
          return (
            <button
              key={node.id}
              className={`quest-node node-${node.type} status-${node.status} ${nodeLock.locked ? 'deadline-locked' : ''} ${index % 2 ? 'node-right' : 'node-left'}`}
              onClick={() => setSelected(node)}
              style={{ '--node-index': index }}
            >
              <span className="quest-node-icon">{nodeLock.locked && node.status !== 'locked' ? <Lock size={18} /> : nodeIcon(node)}</span>
              <span className="quest-node-copy">
                <small>{node.type === 'lesson' ? `Buổi ${node.order}` : node.type === 'miniboss' ? 'Mini Boss' : 'Final Boss'}</small>
                <strong>{node.title}</strong>
                <em>{node.date || 'Chưa có ngày học'}</em>
                {node.deadline && <em className={nodeLock.locked ? 'deadline-expired' : ''}>Hạn nộp {new Date(node.deadline).toLocaleString('vi-VN')}</em>}
              </span>
            </button>
          );
        })}
        {sorted.length === 0 && <div className="empty-state">Chưa có node nhiệm vụ. Hãy nhập tổng số buổi và lưu thông tin lớp.</div>}
      </div>

      <Modal open={Boolean(selected)} title={selected?.title || 'Quest'} onClose={() => setSelected(null)} wide>
        {selected && (
          <div className="quest-detail">
            <div className={`boss-banner node-${selected.type}`}><span>{nodeIcon(selected)}</span><strong>{selected.type.toUpperCase()}</strong></div>

            <section className="quest-detail-section">
              <small>TÓM TẮT NHIỆM VỤ</small>
              <p>{selected.description || 'Chưa có nội dung tóm tắt.'}</p>
            </section>

            <section className="quest-detail-section task-instructions">
              <small>NỘI DUNG BÀI TẬP</small>
              <p>{selected.assignmentInstructions || 'Giáo viên chưa thêm hướng dẫn chi tiết.'}</p>
              {selected.customPrompt && <div className="custom-task-box"><strong>Yêu cầu riêng</strong><span>{selected.customPrompt}</span></div>}
            </section>

            <div className="reward-row">
              <span>⭐ {selected.xpReward} XP</span>
              <span>🪙 {selected.goldReward} Gold</span>
              <span>📅 Ngày học: {selected.date || 'Chưa đặt'}</span>
              <span>⏰ Hạn nộp: {selected.deadline ? new Date(selected.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
            </div>
            <div className="tag-row">
              <span className={`status-tag ${selected.status}`}>{statusLabels[selected.status] || selected.status}</span>
              <span className="status-tag evidence">{evidenceLabels[selected.acceptedEvidence] || selected.acceptedEvidence || 'Nhiều loại minh chứng'}</span>
              {lockState.locked && <span className="status-tag locked">đã đóng nộp bài</span>}
            </div>

            {teacherMode ? (
              <div className="teacher-node-notes">
                <div className={`deadline-policy ${lockState.locked ? 'closed' : 'open'}`}>
                  <strong>{lockState.locked ? 'Đã đóng nộp bài' : 'Đang mở nộp bài'}</strong>
                  <span>{lockState.locked ? lockState.reason : selected.lockAfterDeadline ? 'Node sẽ tự đóng khi hết hạn.' : 'Chưa bật tự động khóa theo hạn nộp.'}</span>
                </div>
                <div className="form-actions">
                  <button className="button secondary" onClick={() => { onEdit?.(selected); setSelected(null); }}>Chỉnh sửa node</button>
                  {onDelete && <button className="button danger" onClick={() => { if (window.confirm(`Xóa ${selected.title}?`)) onDelete(selected.id); setSelected(null); }}>Xóa</button>}
                </div>
              </div>
            ) : (
              <div>
                {lockState.locked && <div className="deadline-alert"><Lock size={17} /><span>{lockState.reason}</span></div>}
                <div className="form-actions">
                  {selected.status === 'locked' ? (
                    <button className="button disabled" disabled><Lock size={17} /> Nhiệm vụ đã khóa</button>
                  ) : lockState.locked ? (
                    <button className="button disabled" disabled><Lock size={17} /> Đã đóng nộp bài</button>
                  ) : submission?.status === 'approved' ? (
                    <button className="button success" disabled><Check size={17} /> Đã duyệt</button>
                  ) : (
                    <button className="button primary" onClick={() => { onSubmit?.(selected); setSelected(null); }}>{submission ? 'Nộp lại minh chứng' : 'Nộp nhiệm vụ'}</button>
                  )}
                  {submission && <span className={`status-tag ${submission.status}`}>{statusLabels[submission.status] || submission.status}</span>}
                </div>
                {submission?.teacherFeedback && <div className="teacher-feedback-box"><strong>Nhận xét của giáo viên</strong><p>{submission.teacherFeedback}</p></div>}
              </div>
            )}
          </div>
        )}
      </Modal>

      {showBackToTop && sorted.length > 8 && (
        <button className="back-to-top-button" type="button" onClick={backToTop} aria-label="Về đầu trang">
          <ArrowUp size={18} />
          <span>Về đầu trang</span>
        </button>
      )}
    </>
  );
}
