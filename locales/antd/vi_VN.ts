// src/locales/ant/vi_VN.ts
import type { Locale } from 'antd/es/locale';

const vi_VN: Locale = {
  locale: 'vi',

  // === PAGINATION ===
  Pagination: {
    items_per_page: 'mục / trang',
    jump_to: 'Đi đến',
    jump_to_confirm: 'xác nhận',
    page: '',
    prev_page: 'Trang trước',
    next_page: 'Trang sau',
    prev_5: '5 trang trước',
    next_5: '5 trang sau',
    prev_3: '3 trang trước',
    next_3: '3 trang sau',
  },

  // === DATE PICKER ===
  DatePicker: {
    lang: {
      locale: 'vi',
      placeholder: 'Chọn ngày',
      rangePlaceholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
      today: 'Hôm nay',
      now: 'Bây giờ',
      backToToday: 'Quay lại hôm nay',
      ok: 'OK',
      clear: 'Xóa',
      month: 'Tháng',
      year: 'Năm',
      timeSelect: 'Chọn giờ',
      dateSelect: 'Chọn ngày',
      monthSelect: 'Chọn tháng',
      yearSelect: 'Chọn năm',
      decadeSelect: 'Chọn thập kỷ',

      // === FORMAT ===
      yearFormat: 'YYYY',
      monthFormat: 'MM',
      dateFormat: 'D/M/YYYY',
      dayFormat: 'D',
      dateTimeFormat: 'D/M/YYYY HH:mm:ss',

      // === NAVIGATION ===
      previousMonth: 'Tháng trước (PageUp)',
      nextMonth: 'Tháng kế (PageDown)',
      previousYear: 'Năm trước (Control + left)',
      nextYear: 'Năm kế (Control + right)',
      previousDecade: 'Thập kỷ trước',
      nextDecade: 'Thập kỷ kế',
      previousCentury: 'Thế kỷ trước',
      nextCentury: 'Thế kỷ kế',

      // === NGÀY TRONG TUẦN ===
      // BẮT BUỘC: 'week' là field REQUIRED
      week: 'Tuần',

      // === SHORT DAYS & MONTHS ===
      shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      shortMonths: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ],

      // === OPTIONAL BUT NICE TO HAVE ===
      monthBeforeYear: true,
    },
    timePickerLocale: {
      placeholder: 'Chọn giờ',
      rangePlaceholder: ['Giờ bắt đầu', 'Giờ kết thúc'],
    },
  },

  // === TIME PICKER ===
  TimePicker: {
    placeholder: 'Chọn giờ',
    rangePlaceholder: ['Giờ bắt đầu', 'Giờ kết thúc'],
  },

  // === EMPTY ===
  Empty: {
    description: 'Không có dữ liệu',
  },

  // === MODAL ===
  Modal: {
    okText: 'Đồng ý',
    cancelText: 'Hủy',
    justOkText: 'OK',
  },

  // === POPCONFIRM ===
  Popconfirm: {
    okText: 'Đồng ý',
    cancelText: 'Hủy',
  },

  // === TRANSFER ===
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Tìm kiếm',
    itemUnit: 'mục',
    itemsUnit: 'mục',
    notFoundContent: 'Không tìm thấy',
    remove: 'Xóa',
    selectAll: 'Chọn tất cả',
    selectCurrent: 'Chọn trang hiện tại',
    selectInvert: 'Chọn ngược',
    removeAll: 'Xóa tất cả',
    removeCurrent: 'Xóa trang hiện tại',
  },

  // === TABLE ===
  Table: {
    filterTitle: 'Bộ lọc',
    filterConfirm: 'Tìm',
    filterReset: 'Đặt lại',
    filterEmptyText: 'Không có bộ lọc',
    emptyText: 'Không có dữ liệu',
    selectAll: 'Chọn tất cả',
    selectInvert: 'Chọn ngược',
    selectNone: 'Xóa chọn',
    selectionAll: 'Chọn tất cả dữ liệu',
    sortTitle: 'Sắp xếp',
    expand: 'Mở rộng',
    collapse: 'Thu gọn',
    triggerDesc: 'Sắp xếp giảm dần',
    triggerAsc: 'Sắp xếp tăng dần',
    cancelSort: 'Hủy sắp xếp',
  },

  // === UPLOAD ===
  Upload: {
    uploading: 'Đang tải lên...',
    removeFile: 'Xóa tập tin',
    uploadError: 'Lỗi tải lên',
    previewFile: 'Xem trước',
    downloadFile: 'Tải xuống',
  },

  // === TEXT ===
  Text: {
    edit: 'Chỉnh sửa',
    copy: 'Sao chép',
    copied: 'Đã sao chép',
    expand: 'Mở rộng',
  },
};

export default vi_VN;
