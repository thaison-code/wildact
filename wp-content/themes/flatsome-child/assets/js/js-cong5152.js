document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra nếu là thiết bị di động
  const isMobile = window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Nếu là thiết bị di động, không thực hiện chức năng này
  if (isMobile) {
    // Có thể thêm mã để hiển thị toàn bộ nội dung trên mobile nếu cần
    document.querySelectorAll('.text-content').forEach(content => {
      content.classList.add('expanded');
    });
    
    // Ẩn các nút read-more trên mobile
    document.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.style.display = 'none';
    });
    
    return; // Kết thúc function sớm
  }
  
  // Phần còn lại của code chỉ chạy trên desktop
  // Kiểm tra ngôn ngữ hiện tại
  const isVietnamese = document.documentElement.lang === 'vi' || 
                       document.location.pathname.includes('/vi/') ||
                       document.cookie.includes('pll_language=vi');
  
  // Thiết lập văn bản theo ngôn ngữ
  const expandText = isVietnamese ? 'Xem thêm' : 'See more';
  const collapseText = isVietnamese ? 'Thu gọn' : 'Collapse';
  
  // Thiết lập văn bản ban đầu cho tất cả các nút
  document.querySelectorAll('.read-more-btn').forEach((btn) => {
    const textContent = btn.parentElement.querySelector('.text-content');
    btn.textContent = textContent.classList.contains('expanded') ? collapseText : expandText;
    
    // Thêm event listener
    btn.addEventListener('click', function () {
      // Tìm phần tử .text-content nằm cùng container với nút
      const textContent = btn.parentElement.querySelector('.text-content');
      // Toggle class expanded để mở rộng hoặc thu gọn nội dung
      textContent.classList.toggle('expanded');
      // Cập nhật nội dung text của nút theo ngôn ngữ hiện tại
      if (textContent.classList.contains('expanded')) {
        btn.textContent = collapseText;
      } else {
        btn.textContent = expandText;
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Lấy URL hiện tại
  const currentUrl = window.location.href;
  
  // Kiểm tra chính xác hơn: URL có chứa '/vi/' hoặc trang chủ tiếng Việt
  const isVietnamese = currentUrl.includes('/vi/') || 
                       (currentUrl === 'https://wildact.k-tech-services.com/' && 
                        document.documentElement.lang === 'vi-VN');
  
  // Tìm button donation (lấy thẻ a thay vì chỉ span bên trong)
  const donationButton = document.querySelector('.header-button-1 .button');
  const donationText = document.querySelector('.header-button-1 .button span');
  
  // Kiểm tra xem đã tìm thấy các phần tử chưa
  if (donationButton && donationText) {
//     console.log('Tìm thấy nút quyên góp:', donationButton);
//     console.log('Ngôn ngữ hiện tại là tiếng Việt:', isVietnamese);
    
    // Đặt nội dung mặc định là tiếng Anh
    donationText.textContent = 'DONATION';
    donationButton.href = 'https://wildact-vn.org/donation/';
    
    // Chỉ thay đổi nếu là tiếng Việt
    if (isVietnamese) {
      donationText.textContent = 'ĐÓNG GÓP';
      donationButton.href = 'https://wildact-vn.org/quyen-gop/';
    }
  } else {
    console.error('Không tìm thấy nút quyên góp');
  }
});

jQuery(document).ready(function ($) {
  $('.box-text').on('click', function () {
    const link = $(this).closest('.box').find('.box-image a').attr('href');
    if (link) {
        window.open(link, '_blank');
    }
  });
});

// REPORT
document.addEventListener('DOMContentLoaded', function() {
  // Lấy tất cả container có class col-xemthem-rp
  const containers = document.querySelectorAll('.col-xemthem-rp');
  
  // Xử lý từng container
  containers.forEach(function(container) {
    // Lấy tất cả các row trong container
    const rows = container.querySelectorAll('.row-xemthem-rp');
    
    // Lấy nút "LOAD more"
    const loadMoreButton = container.querySelector('.button.secondary');
    
    // Số lượng row hiển thị ban đầu
    const initialRowsToShow = 4;
    
    
    for (let i = initialRowsToShow; i < rows.length; i++) {
      rows[i].style.display = 'none';
    }
    
    // Thêm sự kiện click cho nút "LOAD more"
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', function() {
        // Hiển thị tất cả các row đã ẩn
        for (let i = initialRowsToShow; i < rows.length; i++) {
          rows[i].style.display = '';
        }
        
        // Ẩn nút "LOAD more" sau khi đã hiển thị tất cả
        loadMoreButton.style.display = 'none';
      });
    }
  });
});