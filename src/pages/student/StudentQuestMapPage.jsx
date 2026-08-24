import React, { useState } from 'react';
import QuestMap from '../../components/QuestMap';
import QuestSubmissionModal from '../../components/QuestSubmissionModal';
import { useApp } from '../../context/AppContext';

export default function StudentQuestMapPage() {
  const { data, currentStudent, submitQuest } = useApp();
  const [submitNode, setSubmitNode] = useState(null);
  const classId = currentStudent.classIds[0];
  const nodes = data.questNodes.filter((node) => node.classId === classId);
  const existingSubmission = submitNode
    ? data.submissions.find((item) => item.studentId === currentStudent.id && item.nodeId === submitNode.id)
    : null;

  return (
    <>
      <div className="panel quest-panel">
        <div className="panel-header">
          <div>
            <small>HÀNH TRÌNH CỦA EM</small>
            <h2>Bản đồ nhiệm vụ</h2>
            <p>Chọn một node để đọc yêu cầu, xem hạn nộp và gửi bài làm hoặc xác nhận đã gửi minh chứng qua Zalo/ứng dụng khác.</p>
          </div>
        </div>
        <QuestMap
          nodes={nodes}
          submissions={data.submissions}
          studentId={currentStudent.id}
          onSubmit={(node) => setSubmitNode(node)}
        />
      </div>

      <QuestSubmissionModal
        open={Boolean(submitNode)}
        node={submitNode}
        existingSubmission={existingSubmission}
        onClose={() => setSubmitNode(null)}
        onSubmit={(payload) => submitQuest(currentStudent.id, submitNode.id, payload)}
      />
    </>
  );
}
