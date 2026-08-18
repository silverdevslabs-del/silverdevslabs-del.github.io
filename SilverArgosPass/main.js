document.addEventListener('DOMContentLoaded', () => {
  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Dynamic Release / Download Handler
  const downloadBtns = document.querySelectorAll('.btn-download-exe');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Default to direct repo release asset if no specific link is configured
      const downloadUrl = btn.getAttribute('href');
      if (downloadUrl === '#' || !downloadUrl) {
        e.preventDefault();
        window.location.href = 'https://github.com/SilverDevsLabs/SilverArgosPass/releases/latest/download/SilverArgosPass_1.0.0_x64-setup.exe';
      }
    });
  });

  // Header blur on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
      header.style.background = 'rgba(8, 11, 16, 0.9)';
    } else {
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      header.style.background = 'rgba(8, 11, 16, 0.75)';
    }
  });
});
