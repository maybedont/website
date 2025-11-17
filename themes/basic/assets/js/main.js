// Documentation TOC mobile toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toc-toggle');
  const sidebar = document.getElementById('docs-sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside the TOC
    sidebar.addEventListener('click', function(e) {
      if (e.target === sidebar) {
        toggle.classList.remove('active');
        sidebar.classList.remove('active');
      }
    });

    // Close sidebar when clicking a link
    const tocLinks = sidebar.querySelectorAll('a');
    tocLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        sidebar.classList.remove('active');
      });
    });
  }
});
