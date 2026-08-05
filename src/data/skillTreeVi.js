export const branchLabels = {
  retry: 'Tái chiến', comfort: 'Tiện ích', shield: 'Phòng thủ', hint: 'Gợi ý', knowledge: 'Tri thức', time: 'Thời gian',
  heal: 'Hồi phục', support: 'Hỗ trợ', peace: 'Bình tâm', swap: 'Đổi nhiệm vụ', movement: 'Di chuyển', break: 'Nghỉ ngơi',
  attendance: 'Chuyên cần', late: 'Đúng giờ', teamDefense: 'Bảo vệ đội', music: 'Âm nhạc', teamEnergy: 'Tinh thần đội',
  presentation: 'Thuyết trình', ultimate: 'Tối thượng',
};

const translations = {
  warrior_retry_1: ['Đòn Tái Chiến', 'Làm lại một nhiệm vụ trên lớp.', 'Làm lại một câu hỏi, nhiệm vụ nhỏ hoặc lượt nói.'],
  warrior_retry_2: ['Cơ Hội Thứ Hai', 'Làm lại với một gợi ý nhỏ.', 'Làm lại một nhiệm vụ và nhận một gợi ý nhỏ từ giáo viên trước khi thử lại.'],
  warrior_retry_3: ['Màn Trở Lại Anh Hùng', 'Biến lượt làm lại thành XP thưởng.', 'Sau khi làm lại thành công, cả đội nhận một phần thưởng XP nhỏ.'],
  warrior_snack_1: ['Bữa Nhẹ Chiến Binh', 'Ăn một phần nhẹ trong lớp.', 'Được ăn một món nhẹ vào thời điểm phù hợp trong lớp.'],
  warrior_snack_2: ['Chia Sẻ Bữa Nhẹ', 'Chia sẻ món ăn với một đồng đội.', 'Chia sẻ một món ăn nhỏ với một đồng đội trong giờ nghỉ hoặc lúc phù hợp.'],
  warrior_snack_3: ['Yến Tiệc Chiến Thắng', 'Đặc quyền ăn nhẹ cho cả đội.', 'Sau phần thể hiện tốt của cả đội, mở một khoảng thời gian ăn nhẹ ngắn với sự đồng ý của giáo viên.'],
  warrior_shield_1: ['Khiên Dũng Cảm', 'Chặn một lần mất HP nhỏ.', 'Chặn một lần mất HP nhỏ do lỗi trong lớp.'],
  warrior_shield_2: ['Ý Chí Sắt Đá', 'Giảm một lần mất HP lớn hơn.', 'Giảm một lần mất HP đáng kể cho cả đội.'],
  warrior_shield_3: ['Phòng Tuyến Cuối Cùng', 'Bảo vệ đội khỏi mất nhiều HP.', 'Bảo vệ cả đội khỏi một sự kiện làm mất nhiều HP.'],
  warrior_ultimate_challenge: ['Thử Thách Anh Hùng', 'Tăng mạnh XP cho Hard Quest.', 'Tối thượng: Chọn một Hard Quest. Nếu hoàn thành, cả đội nhận lượng XP lớn.'],
  warrior_ultimate_stand: ['Tử Thủ Thần Thánh', 'Chặn một lần mất HP nghiêm trọng.', 'Tối thượng: Bảo vệ cả đội khỏi một sự kiện làm mất lượng HP lớn.'],
  warrior_ultimate_command: ['Mệnh Lệnh Chiến Thắng', 'Cho cả đội quyền làm lại.', 'Tối thượng: Cho cả đội làm lại một nhiệm vụ nhóm với sự đồng ý của giáo viên.'],

  mage_hint_1: ['Phép Gợi Ý', 'Xin một gợi ý.', 'Xin giáo viên một gợi ý nhỏ trong khi làm nhiệm vụ.'],
  mage_hint_2: ['Phép Dẫn Lối', 'Xin một gợi ý rõ hơn.', 'Nhận một gợi ý hoặc ví dụ rõ hơn trước khi trả lời.'],
  mage_hint_3: ['Lời Thì Thầm Tiên Tri', 'Xem trước hướng làm nhiệm vụ.', 'Xem trước hướng giải quyết của một nhiệm vụ khó trước khi bắt đầu.'],
  mage_dictionary_1: ['Từ Điển Ma Thuật', 'Tra một từ.', 'Tra nghĩa của một từ trong một nhiệm vụ nhỏ.'],
  mage_dictionary_2: ['Kho Lưu Trữ Từ Vựng', 'Tra tối đa hai từ.', 'Tra tối đa hai từ trong một nhiệm vụ có kiểm soát.'],
  mage_dictionary_3: ['Chế Độ Học Giả', 'Dùng ghi chú một lần.', 'Xem ghi chú cá nhân một lần trong hoạt động được giáo viên cho phép.'],
  mage_time_1: ['Đóng Băng Thời Gian', 'Nhận thêm 2 phút.', 'Nhận thêm 2 phút để hoàn thành một nhiệm vụ.'],
  mage_time_2: ['Chuyển Động Chậm', 'Nhận thêm 3 phút.', 'Nhận thêm 3 phút cho một nhiệm vụ nói hoặc viết.'],
  mage_time_3: ['Cổng Thời Gian', 'Gia hạn một deadline.', 'Gia hạn một deadline bài tập nhỏ với sự đồng ý của giáo viên.'],
  mage_ultimate_oracle: ['Đại Tiên Tri', 'Nhận gợi ý mạnh cho nhiệm vụ khó.', 'Tối thượng: Nhận một gợi ý quan trọng do giáo viên duyệt cho một nhiệm vụ khó.'],
  mage_ultimate_time: ['Bậc Thầy Thời Gian', 'Gia hạn một deadline quan trọng.', 'Tối thượng: Gia hạn deadline của một bài tập quan trọng với sự đồng ý của giáo viên.'],
  mage_ultimate_arcane: ['Cường Hóa Bí Thuật', 'Tăng thưởng cho câu trả lời xuất sắc.', 'Tối thượng: Nhận lượng XP lớn sau một câu trả lời xuất sắc hoặc nhiệm vụ sáng tạo.'],

  cleric_heal_1: ['Hồi Phục Nhẹ', 'Hồi HP cho đội.', 'Hồi một lượng HP nhỏ cho cả đội.'],
  cleric_heal_2: ['Hồi Phục Dịu Dàng', 'Hồi thêm HP.', 'Hồi thêm HP sau khi cả đội thể hiện nỗ lực tích cực.'],
  cleric_heal_3: ['Hồi Sinh Đồng Đội', 'Hồi phục lớn cho đội.', 'Hồi một lượng HP lớn sau một buổi học khó khăn.'],
  cleric_friend_1: ['Cứu Trợ Đồng Đội', 'Giúp một đồng đội.', 'Hỗ trợ một đồng đội trong nhiệm vụ mà không bị phạt.'],
  cleric_friend_2: ['Phước Lành Cặp Đôi', 'Tự chọn bạn cùng cặp.', 'Chọn bạn đồng hành cho một hoạt động làm việc theo cặp.'],
  cleric_friend_3: ['Vòng Tròn Hỗ Trợ', 'Đội nhận thưởng hỗ trợ.', 'Sau khi tích cực giúp đỡ đồng đội, cả đội nhận thêm HP.'],
  cleric_peace_1: ['Thẻ Bình Tâm', 'Bỏ qua một lượt nói.', 'Bỏ qua một lượt nói khi cảm thấy quá tải.'],
  cleric_peace_2: ['Tái Lập Bình Tĩnh', 'Nghỉ ngắn để cân bằng.', 'Dành một khoảng nghỉ ngắn để ổn định cảm xúc trước khi tiếp tục.'],
  cleric_peace_3: ['Vùng An Toàn', 'Bỏ qua một hoạt động nhỏ.', 'Bỏ qua một hoạt động nhỏ mà không làm đội mất HP.'],
  cleric_ultimate_revival: ['Hồi Sinh Thần Thánh', 'Hồi lượng HP rất lớn cho đội.', 'Tối thượng: Hồi một lượng HP lớn cho cả đội sau một giai đoạn khó khăn.'],
  cleric_ultimate_aura: ['Hào Quang An Toàn', 'Bảo vệ một hoạt động nhỏ.', 'Tối thượng: Cả đội được bỏ qua hoặc giảm độ khó của một hoạt động nhỏ mà không mất HP.'],
  cleric_ultimate_blessing: ['Vòng Tròn Phước Lành', 'Thưởng cho tinh thần hỗ trợ.', 'Tối thượng: Khi cả đội hỗ trợ nhau tốt, nhận thêm HP và XP.'],

  explorer_swap_1: ['Đổi Quest', 'Đổi một nhiệm vụ nhỏ.', 'Đổi một nhiệm vụ nhỏ trên lớp sang một nhiệm vụ tương đương.'],
  explorer_swap_2: ['Đổi Tuyến Câu Hỏi', 'Đổi một câu hỏi.', 'Đổi một câu hỏi khó sang một câu hỏi khác.'],
  explorer_swap_3: ['Người Tìm Đường', 'Chọn một lộ trình nhiệm vụ.', 'Chọn một trong hai lộ trình nhiệm vụ được giáo viên duyệt.'],
  explorer_seat_1: ['Dịch Chuyển Chỗ Ngồi', 'Đổi chỗ một lần.', 'Đổi chỗ ngồi một lần trong buổi học.'],
  explorer_seat_2: ['Đồng Hành Dịch Chuyển', 'Chọn chỗ cùng bạn.', 'Chọn chỗ ngồi cùng một bạn cho một hoạt động.'],
  explorer_seat_3: ['Trại Thám Hiểm', 'Chọn cách sắp xếp chỗ cho đội.', 'Chọn cách sắp xếp chỗ ngồi của đội trong một hoạt động trên lớp.'],
  explorer_break_1: ['Nghỉ Chân Phiêu Lưu', 'Nghỉ một hoạt động nhỏ.', 'Nghỉ một hoạt động nhỏ trên lớp mà không làm đội mất HP.'],
  explorer_break_2: ['Tiết Kiệm Năng Lượng', 'Nghỉ mà vẫn bảo toàn thành tích.', 'Bỏ qua một nhiệm vụ ít quan trọng mà vẫn giữ an toàn HP cho đội.'],
  explorer_break_3: ['Thẻ Ngày An Toàn', 'Một ngày nghỉ được duyệt.', 'Dùng cho một ngày nghỉ hoặc phương án học bù được giáo viên duyệt mà không làm đội mất HP.'],
  explorer_ultimate_route: ['Lộ Trình Huyền Thoại', 'Chọn đường đi cho nhiệm vụ lớn.', 'Tối thượng: Chọn một trong các lộ trình được giáo viên duyệt cho một nhiệm vụ lớn.'],
  explorer_ultimate_voyage: ['Hành Trình Hoàng Kim', 'Nhận Gold nhờ khám phá.', 'Tối thượng: Nhận Gold sau khi hoàn thành một dự án hoặc thử thách khám phá.'],
  explorer_ultimate_safe_day: ['Thẻ Hành Trình An Toàn', 'Đặc quyền nghỉ hoặc học bù mạnh.', 'Tối thượng: Dùng một phương án nghỉ hoặc học bù quan trọng mà không làm đội mất HP.'],

  guardian_absence_1: ['Khiên Vắng Mặt', 'Bảo vệ một buổi nghỉ có phép.', 'Một buổi nghỉ được duyệt sẽ không làm đội mất HP.'],
  guardian_absence_2: ['Hộ Vệ Học Bù', 'Bảo vệ buổi nghỉ bằng nhiệm vụ bù.', 'Bảo vệ một buổi nghỉ bằng cách hoàn thành nhiệm vụ học bù.'],
  guardian_absence_3: ['Đặc Ân Hộ Vệ', 'Bảo vệ mạnh cho buổi nghỉ.', 'Dùng cho một buổi nghỉ quan trọng được giáo viên duyệt mà không làm đội mất HP.'],
  guardian_late_1: ['Khiên Đi Trễ', 'Bảo vệ một lần đến trễ nhẹ.', 'Một lần đến trễ ít phút sẽ không làm đội mất HP.'],
  guardian_late_2: ['Giáp Thời Gian', 'Giảm hình phạt đi trễ.', 'Giảm hình phạt đi trễ cho bản thân hoặc một đồng đội.'],
  guardian_late_3: ['Pháo Đài Đồng Hồ', 'Bảo vệ đội khỏi phạt thời gian.', 'Bảo vệ cả đội khỏi một lần mất HP liên quan đến thời gian.'],
  guardian_team_1: ['Giáp Đồng Đội', 'Giảm lượng HP đội bị mất.', 'Giảm một lần mất HP của cả đội.'],
  guardian_team_2: ['Tường Thành Bảo Hộ', 'Tạo khiên lớn hơn cho đội.', 'Giảm mạnh một lần mất HP của cả đội.'],
  guardian_team_3: ['Phòng Thủ Thành Trì', 'Tạo lá chắn lớn cho đội.', 'Bảo vệ đội khỏi một sự kiện làm mất nhiều HP trên lớp.'],
  guardian_ultimate_fortress: ['Trái Tim Pháo Đài', 'Tạo lá chắn cực lớn cho đội.', 'Tối thượng: Bảo vệ cả đội khỏi một hình phạt lớn trên lớp.'],
  guardian_ultimate_oath: ['Lời Thề Hộ Vệ', 'Bảo vệ một đồng đội.', 'Tối thượng: Bảo vệ một đồng đội khỏi hình phạt với sự đồng ý của giáo viên.'],
  guardian_ultimate_stability: ['Tập Thể Bất Khả Chiến Bại', 'Thưởng HP và Gold cho đội.', 'Tối thượng: Khi cả đội duy trì sự ổn định, nhận thêm HP và Gold.'],

  bard_music_1: ['Quyền Chọn Nhạc', 'Chọn nhạc cho lớp một lần.', 'Chọn nhạc phù hợp cho phần khởi động, giờ nghỉ hoặc chuyển hoạt động.'],
  bard_music_2: ['Phép Danh Sách Nhạc', 'Đề xuất một playlist ngắn.', 'Đề xuất một playlist ngắn được giáo viên duyệt cho giờ nghỉ.'],
  bard_music_3: ['Khoảnh Khắc Hòa Nhạc', 'Dẫn dắt một hoạt động âm nhạc.', 'Dẫn dắt một đoạn nhạc hoặc chant ngắn để tạo năng lượng cho lớp.'],
  bard_cheer_1: ['Cổ Vũ Đồng Đội', 'Tặng đội một ít HP.', 'Sau khi khích lệ đồng đội, cả đội nhận một lượng HP nhỏ.'],
  bard_cheer_2: ['Khúc Ca Tiếp Lửa', 'Tăng năng lượng cho đội.', 'Khi cả đội tham gia tích cực, đội nhận thêm HP và XP.'],
  bard_cheer_3: ['Thánh Ca Hội Nhóm', 'Tăng mạnh tinh thần đồng đội.', 'Sau phần thể hiện tốt, cả đội nhận lượng XP và HP lớn hơn.'],
  bard_order_1: ['Thứ Tự Trình Bày', 'Chọn thứ tự thuyết trình.', 'Chọn thời điểm đội của mình thuyết trình.'],
  bard_order_2: ['Điều Khiển Sân Khấu', 'Chọn thứ tự người nói.', 'Chọn thứ tự nói trong phần thuyết trình của đội.'],
  bard_order_3: ['Thẻ Tâm Điểm', 'Chọn một lợi thế thuyết trình.', 'Chọn một lợi thế thuyết trình được giáo viên duyệt như thứ tự, hình thức hoặc hỗ trợ khởi động.'],
  bard_ultimate_anthem: ['Đại Thánh Ca Hội Nhóm', 'Tăng cực mạnh tinh thần đội.', 'Tối thượng: Sau màn phối hợp tốt, cả đội nhận lượng XP và HP lớn.'],
  bard_ultimate_stage: ['Bậc Thầy Sân Khấu', 'Điều khiển luồng thuyết trình.', 'Tối thượng: Chọn một lợi thế quan trọng khi thuyết trình với sự đồng ý của giáo viên.'],
  bard_ultimate_celebration: ['Khoảnh Khắc Lễ Hội', 'Tạo khoảnh khắc vui cho lớp.', 'Tối thượng: Mở một khoảnh khắc vui hoặc hoạt động ăn mừng được giáo viên duyệt.'],
};

export function localizeSkill(skill) {
  const translation = translations[skill.id];
  if (!translation) return skill;
  return { ...skill, name: translation[0], shortDescription: translation[1], description: translation[2] };
}

export function localizeSkillTree(tree = []) {
  return tree.map(localizeSkill);
}
