// 메뉴 클릭 시 URL 로드
document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', async e => {
    e.preventDefault();
    const url = link.dataset.url;
    if (!url) return;

    try {
      const res = await fetch(url);
      const html = await res.text();
      document.getElementById('content').innerHTML = html;
    } catch (err) {
      document.getElementById('content').innerHTML = '<p>페이지를 불러올 수 없습니다.</p>';
      console.error(err);
    }
  });
});
