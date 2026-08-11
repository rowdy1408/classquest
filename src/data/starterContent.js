export const STARTER_CONTENT_VERSION = 1;

export const starterRuleTemplates = [
  { key: 'participation', type: 'reward', title: 'Tham gia xây dựng bài', points: 5, gold: 2, description: 'Phát biểu, đặt câu hỏi hoặc đóng góp ý kiến tích cực trong giờ học.' },
  { key: 'homework', type: 'reward', title: 'Hoàn thành bài tập đúng hạn', points: 10, gold: 5, description: 'Nộp đầy đủ bài tập theo đúng yêu cầu và thời hạn.' },
  { key: 'teamwork', type: 'reward', title: 'Hỗ trợ bạn học', points: 5, gold: 5, description: 'Giúp đỡ bạn học một cách tôn trọng và hợp tác.' },
  { key: 'progress', type: 'reward', title: 'Tiến bộ nổi bật', points: 15, gold: 10, description: 'Thể hiện sự tiến bộ rõ rệt về kiến thức, kỹ năng hoặc thái độ học tập.' },
  { key: 'punctual', type: 'reward', title: 'Đi học đúng giờ', points: 5, gold: 2, description: 'Có mặt đúng giờ và sẵn sàng học tập.' },
  { key: 'missing-homework', type: 'penalty', title: 'Chưa hoàn thành bài tập', points: -10, gold: -5, description: 'Không nộp bài tập và không có trao đổi trước với giáo viên.' },
  { key: 'disruption', type: 'penalty', title: 'Làm gián đoạn lớp học', points: -5, gold: -2, description: 'Nói chuyện riêng hoặc gây ảnh hưởng đến hoạt động chung của lớp.' },
  { key: 'class-rule', type: 'penalty', title: 'Vi phạm quy tắc lớp', points: -10, gold: -5, description: 'Không thực hiện quy tắc lớp sau khi đã được nhắc nhở.' },
];

export const starterShopItems = [
  { id: 'starter-shop-hint', name: 'Thẻ gợi ý', icon: '💡', price: 40, category: 'Hỗ trợ nhiệm vụ', description: 'Nhận một gợi ý ngắn từ giáo viên khi đang làm nhiệm vụ.', effect: 'Được yêu cầu 1 gợi ý trong một hoạt động.', active: true },
  { id: 'starter-shop-extra-time', name: 'Thêm 5 phút', icon: '⏳', price: 60, category: 'Hỗ trợ nhiệm vụ', description: 'Có thêm thời gian để hoàn thiện một nhiệm vụ trên lớp.', effect: 'Cộng thêm 5 phút cho 1 nhiệm vụ.', active: true },
  { id: 'starter-shop-ask-friend', name: 'Hỏi đồng đội', icon: '🤝', price: 45, category: 'Hợp tác', description: 'Được hỏi một bạn trong đội để nhận gợi ý.', effect: 'Trao đổi với 1 đồng đội trong 60 giây.', active: true },
  { id: 'starter-shop-reroll', name: 'Đổi câu hỏi', icon: '🎲', price: 70, category: 'Thử thách', description: 'Đổi sang một câu hỏi khác có độ khó tương đương.', effect: 'Đổi 1 câu hỏi trong hoạt động được giáo viên cho phép.', active: true },
  { id: 'starter-shop-late-pass', name: 'Gia hạn 24 giờ', icon: '🕰️', price: 100, category: 'Bài tập', description: 'Xin gia hạn cho một bài tập chưa quá hạn.', effect: 'Gia hạn tối đa 24 giờ với sự xác nhận của giáo viên.', active: true },
  { id: 'starter-shop-second-chance', name: 'Cơ hội thứ hai', icon: '🔁', price: 120, category: 'Bài tập', description: 'Sửa và nộp lại một nhiệm vụ sau khi nhận phản hồi.', effect: 'Được nộp lại 1 lần cho nhiệm vụ được giáo viên duyệt.', active: true },
  { id: 'starter-shop-team-shield', name: 'Khiên đồng đội', icon: '🛡️', price: 90, category: 'Hợp tác', description: 'Hỗ trợ cả đội tránh một lần trừ Gold nhẹ.', effect: 'Giảm tối đa 5 Gold bị trừ cho đội trong 1 tình huống.', active: true },
  { id: 'starter-shop-bonus-xp', name: 'Thử thách XP', icon: '⭐', price: 80, category: 'Thử thách', description: 'Nhận một câu hỏi nâng cao để kiếm thêm XP.', effect: 'Mở 1 câu hỏi bonus do giáo viên chọn.', active: true },
];

export function makeStarterRules(classId) {
  return starterRuleTemplates.map((rule) => ({
    id: `starter-rule-${classId}-${rule.key}`,
    classId,
    type: rule.type,
    title: rule.title,
    points: rule.points,
    gold: rule.gold,
    description: rule.description,
  }));
}

