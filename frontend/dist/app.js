const menu = document.querySelector('#menu');
const toggle = document.querySelector('.nav-toggle');
const close = document.createElement('button');
close.className = 'menu-close';
close.type = 'button';
close.setAttribute('aria-label', 'Fechar menu');
close.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>';
menu.prepend(close);
toggle.addEventListener('click', () => {
  menu.showModal();
  menu.scrollTop = 0;
  toggle.setAttribute('aria-expanded', 'true');
  close.focus({preventScroll: true});
});
close.addEventListener('click', () => menu.close());
// Native modal semantics contain focus and handle Escape. All closing paths agree.
menu.addEventListener('close', () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus({preventScroll: true});
});
menu.querySelectorAll('a').forEach(link => {
  const url = new URL(link.href);
  if (url.origin === location.origin && url.pathname === location.pathname) link.setAttribute('aria-current', 'page');
  link.addEventListener('click', () => menu.close());
});
document.querySelectorAll('.year').forEach(e=>e.textContent=new Date().getFullYear());
const contactForm=document.querySelector('#contact-form');
if (contactForm) {
  contactForm.querySelector('[type=submit]').disabled = false;
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const body = `Nome: ${data.get('nome')}\nEmail: ${data.get('email')}\nTelefone: ${data.get('telefone') || '—'}\n\n${data.get('mensagem')}`;
    contactForm.querySelector('.form-status').textContent = 'Confirme o envio na sua aplicação de email. Se não abriu, contacte patriciacapiarcos@sapo.pt. Este formulário não envia email pelo servidor.';
    window.location.href = `mailto:patriciacapiarcos@sapo.pt?subject=${encodeURIComponent(data.get('assunto'))}&body=${encodeURIComponent(body)}`;
  });
}
