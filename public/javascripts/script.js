document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = e.target.dataset.url;
      const res = await fetch(`/content/${url}`);
      const html = await res.text();
      document.getElementById('content').innerHTML = html;
    });
  });
});

