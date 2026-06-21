 //=== == 3 D CANVAS === == 
 (function() {
     const canvas = document.getElementById('bg-canvas'),
         ctx = canvas.getContext('2d');
     let W, H, particles, mouse = {
         x: 0,
         y: 0
     };

     function resize() {
         W = canvas.width = window.innerWidth;
         H = canvas.height = window.innerHeight
     }

     function rand(a, b) {
         return a + Math.random() * (b - a)
     }

     function initParticles() {
         particles = [];
         const count = Math.floor((W * H) / 18000);
         for (let i = 0; i < count; i++) particles.push({
             x: rand(0, W),
             y: rand(0, H),
             z: rand(.2, 1),
             vx: rand(-.15, .15),
             vy: rand(-.12, .1),
             r: rand(1, 2.5),
             color: Math.random() > .5 ? 'rgba(139,92,246,' : 'rgba(232,121,249,',
             opacity: rand(.2, .7),
             pulse: rand(0, Math.PI * 2),
             pulseSpeed: rand(.005, .02)
         });
     }
     const orbs = [{
         x: .15,
         y: .25,
         r: 200,
         color: 'rgba(109,40,217,',
         opacity: .07,
         vx: .0003,
         vy: .0002
     }, {
         x: .85,
         y: .15,
         r: 280,
         color: 'rgba(232,121,249,',
         opacity: .05,
         vx: -.0002,
         vy: .0003
     }, {
         x: .5,
         y: .7,
         r: 350,
         color: 'rgba(124,58,237,',
         opacity: .06,
         vx: .0002,
         vy: -.0002
     }, {
         x: .7,
         y: .8,
         r: 180,
         color: 'rgba(6,182,212,',
         opacity: .05,
         vx: -.0003,
         vy: -.0002
     }];
     let t = 0;

     function draw() {
         ctx.clearRect(0, 0, W, H);
         t += .008;
         orbs.forEach(o => {
             o.x += o.vx + Math.sin(t * .7) * .0001;
             o.y += o.vy + Math.cos(t * .5) * .0001;
             if (o.x < 0 || o.x > 1) o.vx *= -1;
             if (o.y < 0 || o.y > 1) o.vy *= -1;
             const gx = o.x * W,
                 gy = o.y * H,
                 g = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.r);
             g.addColorStop(0, o.color + (o.opacity * 1.5) + ')');
             g.addColorStop(.5, o.color + o.opacity + ')');
             g.addColorStop(1, 'rgba(0,0,0,0)');
             ctx.beginPath();
             ctx.arc(gx, gy, o.r, 0, Math.PI * 2);
             ctx.fillStyle = g;
             ctx.fill();
         });
         ctx.strokeStyle = 'rgba(139,92,246,0.025)';
         ctx.lineWidth = .5;
         for (let x = 0; x < W; x += 80) {
             ctx.beginPath();
             ctx.moveTo(x, 0);
             ctx.lineTo(x, H);
             ctx.stroke()
         }
         for (let y = 0; y < H; y += 80) {
             ctx.beginPath();
             ctx.moveTo(0, y);
             ctx.lineTo(W, y);
             ctx.stroke()
         }
         particles.forEach(p => {
             p.x += p.vx;
             p.y += p.vy;
             if (p.x < 0) p.x = W;
             if (p.x > W) p.x = 0;
             if (p.y < 0) p.y = H;
             if (p.y > H) p.y = 0;
             p.pulse += p.pulseSpeed;
             const a = p.opacity * (.7 + .3 * Math.sin(p.pulse));
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
             ctx.fillStyle = p.color + a + ')';
             ctx.fill();
         });
         const mx = mouse.x,
             my = mouse.y;
         particles.forEach(p => {
             const dx = p.x - mx,
                 dy = p.y - my,
                 d = Math.sqrt(dx * dx + dy * dy);
             if (d < 140) {
                 ctx.beginPath();
                 ctx.moveTo(mx, my);
                 ctx.lineTo(p.x, p.y);
                 ctx.strokeStyle = `rgba(139,92,246,${.3*(1-d/140)})`;
                 ctx.lineWidth = .6;
                 ctx.stroke()
             }
         });
         requestAnimationFrame(draw);
     }
     window.addEventListener('mousemove', e => {
         mouse.x = e.clientX;
         mouse.y = e.clientY
     });
     window.addEventListener('resize', () => {
         resize();
         initParticles()
     });
     resize();
     initParticles();
     draw();
 })();


 /* ===== SCROLL REVEAL ===== */
 const obs = new IntersectionObserver(entries => {
     entries.forEach(e => {
         if (e.isIntersecting) {
             e.target.classList.add('vis');
             obs.unobserve(e.target)
         }
     })
 }, {
     threshold: .1
 });
 document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

 /* ===== HAMBURGER ===== */
 const hamburger = document.getElementById('hamburger'),
     mobileMenu = document.getElementById('mobile-menu');

 function toggleMenu(open) {
     hamburger.classList.toggle('open', open);
     hamburger.setAttribute('aria-expanded', open);
     mobileMenu.classList.toggle('open', open);
     mobileMenu.setAttribute('aria-hidden', !open);
     document.body.style.overflow = open ? 'hidden' : ''
 }
 hamburger.addEventListener('click', () => toggleMenu(!hamburger.classList.contains('open')));
 document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', () => toggleMenu(false)));


 /* ===== MODAL ===== */
 let lastFocused = null;

 function openModal() {
     lastFocused = document.activeElement;
     document.getElementById('modal').classList.add('open');
     document.body.style.overflow = 'hidden';
     showStep(1, true);
     setTimeout(() => document.getElementById('fname').focus(), 300)
 }

 function closeModal() {
     document.getElementById('modal').classList.remove('open');
     document.body.style.overflow = '';
     if (lastFocused) lastFocused.focus()
 }
 ['nav-cta-btn', 'hero-cta-btn', 'cta-signup-btn', 'free-plan-btn', 'plus-plan-btn', 'team-plan-btn'].forEach(id => {
     const el = document.getElementById(id);
     if (el) el.addEventListener('click', openModal)
 });
 document.getElementById('mobile-signup-btn').addEventListener('click', () => {
     toggleMenu(false);
     openModal()
 });
 document.getElementById('modal-close-btn').addEventListener('click', closeModal);
 document.getElementById('success-close').addEventListener('click', closeModal);
 document.getElementById('modal').addEventListener('click', e => {
     if (e.target === document.getElementById('modal')) closeModal()
 });
 document.getElementById('signin-to-signup').addEventListener('click', e => {
     e.preventDefault();
     openModal()
 });
 document.addEventListener('keydown', e => {
     if (e.key === 'Escape') closeModal();
     if (e.key === 'Tab' && document.getElementById('modal').classList.contains('open')) {
         const focusable = document.getElementById('modal-dialog').querySelectorAll('button,input,select,a[href]');
         const first = focusable[0],
             last = focusable[focusable.length - 1];
         if (e.shiftKey) {
             if (document.activeElement === first) {
                 e.preventDefault();
                 last.focus()
             }
         } else {
             if (document.activeElement === last) {
                 e.preventDefault();
                 first.focus()
             }
         }
     }
 });


 /* ===== STEPS ===== */
 let currentStep = 1;

 function showStep(n, init) {
     for (let i = 1; i <= 4; i++) {
         const s = document.getElementById('step' + i);
         if (s) s.style.display = i === n ? 'block' : 'none'
     }
     currentStep = n;
     const pcts = {
         1: '33%',
         2: '66%',
         3: '100%',
         4: '100%'
     };
     document.getElementById('prog').style.width = pcts[n] || '33%';
     for (let i = 1; i <= 3; i++) document.getElementById('si' + i).className = 'si' + (i < n ? ' done' : i === n ? ' active' : '');
     for (let i = 1; i <= 2; i++) document.getElementById('sl' + i).className = 'si-line' + (i < n ? ' done' : '');
 }

 function setError(id, show) {
     const inp = document.getElementById(id),
         err = document.getElementById(id + '-error');
     if (!inp) return;
     inp.setAttribute('aria-invalid', show ? 'true' : 'false');
     if (err) err.classList.toggle('show', show)
 }

 function validateStep1() {
     const fname = document.getElementById('fname').value.trim(),
         lname = document.getElementById('lname').value.trim(),
         email = document.getElementById('email').value.trim(),
         pwd = document.getElementById('pwd').value;
     let ok = true;
     setError('fname', !fname);
     if (!fname) ok = false;
     setError('lname', !lname);
     if (!lname) ok = false;
     setError('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
     const pwdOk = pwd.length >= 8 && /\d/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd);
     setError('pwd', !pwdOk);
     if (!pwdOk) ok = false;
     return ok;
 }

 function validateStep2() {
     const uni = document.getElementById('uni').value.trim(),
         yr = document.getElementById('yr').value;
     let ok = true;
     setError('uni', !uni);
     if (!uni) ok = false;
     setError('yr', !yr);
     if (!yr) ok = false;
     return ok;
 }
 document.getElementById('step1-next').addEventListener('click', () => {
     if (validateStep1()) showStep(2)
 });
 document.getElementById('step2-back').addEventListener('click', () => showStep(1));
 document.getElementById('step2-next').addEventListener('click', () => {
     if (validateStep2()) showStep(3)
 });
 document.getElementById('step3-back').addEventListener('click', () => showStep(2));
 document.getElementById('step3-submit').addEventListener('click', () => {
     const fname = document.getElementById('fname').value.trim() || 'there',
         email = document.getElementById('email').value.trim();
     document.getElementById('success-msg').textContent = `Welcome, ${fname}! We'll send your early access link to ${email} very soon.`;
     showStep(4);
 });


 /* ===== CHECKBOXES ===== */
 document.querySelectorAll('#goals .check-item').forEach(item => {
     const cb = item.querySelector('input[type=checkbox]');
     item.addEventListener('click', () => {
         cb.checked = !cb.checked;
         item.classList.toggle('checked', cb.checked)
     });
 });

 /* ===== FAQ ===== */
 document.querySelectorAll('.faq-q').forEach(btn => {
     btn.addEventListener('click', () => {
         const item = btn.closest('.faq-item'),
             isOpen = item.classList.contains('open');
         document.querySelectorAll('.faq-item').forEach(i => {
             i.classList.remove('open');
             i.querySelector('.faq-q').setAttribute('aria-expanded', 'false')
         });
         if (!isOpen) {
             item.classList.add('open');
             btn.setAttribute('aria-expanded', 'true')
         }
     });
 });


 /* ===== PASSWORD TOGGLE (MODAL) ===== */
 const pwdInput = document.getElementById('pwd'),
     pwdToggle = document.getElementById('pwd-toggle');
 pwdToggle.addEventListener('click', () => {
     const show = pwdInput.type === 'password';
     pwdInput.type = show ? 'text' : 'password';
     pwdToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
     pwdToggle.setAttribute('aria-pressed', show);
     pwdToggle.querySelector('svg').style.stroke = show ? 'var(--p300)' : 'var(--muted)';
 });

 /* ===== PASSWORD STRENGTH ===== */
 pwdInput.addEventListener('input', () => {
     const v = pwdInput.value;
     let score = 0;
     if (v.length >= 8) score++;
     if (v.length >= 12) score++;
     if (/[A-Z]/.test(v)) score++;
     if (/\d/.test(v)) score++;
     if (/[^a-zA-Z0-9]/.test(v)) score++;
     const fill = document.getElementById('pwd-strength-fill'),
         hint = document.getElementById('pwd-strength-hint');
     const levels = [{
         w: '0%',
         c: 'transparent',
         t: ''
     }, {
         w: '25%',
         c: '#f87171',
         t: 'Weak — add numbers & symbols'
     }, {
         w: '50%',
         c: '#fb923c',
         t: 'Fair — try a longer password'
     }, {
         w: '75%',
         c: '#facc15',
         t: 'Good — almost there'
     }, {
         w: '100%',
         c: '#4ade80',
         t: 'Strong password ✓'
     }];
     const l = levels[Math.min(score, 4)];
     fill.style.width = l.w;
     fill.style.background = l.c;
     hint.textContent = l.t;
     hint.style.color = l.c;
     if (v.length > 0) setError('pwd', false);
 });

 /* ===== GOOGLE OAUTH ===== */
 const GOOGLE_CLIENT_ID = '803094066950-8k59qsfe36uipgcunblh6d98ug0sc46i.apps.googleusercontent.com';

 function handleGoogleCredential(response) {
     // Decode the JWT credential to get user info
     const payload = JSON.parse(atob(response.credential.split('.')[1]));
     const {
         name,
         email,
         picture,
         given_name
     } = payload;

     // Fill in sign-up form fields if coming from modal
     if (document.getElementById('modal').classList.contains('open')) {
         document.getElementById('fname').value = given_name || name.split(' ')[0] || '';
         document.getElementById('lname').value = name.split(' ').slice(1).join(' ') || '';
         document.getElementById('email').value = email || '';
         // Auto-advance to step 2 since Google verified their identity
         document.getElementById('pwd').value = 'Google@OAuth1';
         showStep(2);
         return;
     }

     // Sign-in flow — show success
     document.getElementById('signin-form').style.display = 'none';
     document.getElementById('signin-success').style.display = 'block';
     document.getElementById('signin-success').querySelector('h3').textContent = `Welcome back, ${given_name || name}!`;
     document.getElementById('signin-success').querySelector('p').textContent = `Signed in as ${email}. Redirecting to your dashboard…`;
     setTimeout(() => {
         document.getElementById('redirect-bar').style.width = '100%';
     }, 100);
 }

 function initGoogleAuth() {
     if (typeof google === 'undefined') return;

     google.accounts.id.initialize({
         client_id: GOOGLE_CLIENT_ID,
         callback: handleGoogleCredential,
         auto_select: false,
         cancel_on_tap_outside: true,
     });
 }

 // Trigger Google One Tap popup
 function triggerGoogleSignIn() {
     if (typeof google === 'undefined') {
         alert('Google Sign-In is not available. Please check your connection.');
         return;
     }
     google.accounts.id.prompt((notification) => {
         if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
             // Fallback to renderButton popup if One Tap is dismissed
             google.accounts.id.renderButton(
                 document.getElementById('google-render-target'), {
                     theme: 'filled_black',
                     size: 'large',
                     width: 400,
                     text: 'continue_with'
                 }
             );
             document.getElementById('google-render-target').style.display = 'flex';
             document.getElementById('google-render-target').style.justifyContent = 'center';
             document.getElementById('google-render-target').style.marginBottom = '1rem';
         }
     });
 }

 // Wire up both Google buttons
 ['google-btn', 'signin-google-btn'].forEach(id => {
     const btn = document.getElementById(id);
     if (!btn) return;
     btn.addEventListener('click', () => {
         btn.disabled = true;
         btn.innerHTML = '<i class="ri-loader-4-line" style="animation:spin 1s linear infinite;font-size:1rem"></i> Connecting to Google…';
         setTimeout(() => {
             triggerGoogleSignIn();
             btn.disabled = false;
             btn.innerHTML = btn.id === 'google-btn' ?
                 '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Continue with Google' :
                 '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Continue with Google';
         }, 800);
     });
 }); // Add spin animation
 const spinStyle = document.createElement('style');
 spinStyle.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
 document.head.appendChild(spinStyle);

 // Init when GSI is ready
 window.addEventListener('load', initGoogleAuth);

 /* ===== SIGN IN ===== */
 const signinPwdInput = document.getElementById('signin-pwd'),
     signinPwdToggle = document.getElementById('signin-pwd-toggle');
 signinPwdToggle.addEventListener('click', () => {
     const show = signinPwdInput.type === 'password';
     signinPwdInput.type = show ? 'text' : 'password';
     signinPwdToggle.setAttribute('aria-pressed', show);
     signinPwdToggle.querySelector('svg').style.stroke = show ? 'var(--p300)' : 'var(--muted)';
 });
 document.getElementById('signin-submit').addEventListener('click', () => {
     const email = document.getElementById('signin-email').value.trim(),
         pwd = document.getElementById('signin-pwd').value;
     let ok = true;
     const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
     document.getElementById('signin-email').setAttribute('aria-invalid', !emailOk);
     document.getElementById('signin-email-error').classList.toggle('show', !emailOk);
     if (!emailOk) ok = false;
     document.getElementById('signin-pwd').setAttribute('aria-invalid', !pwd);
     document.getElementById('signin-pwd-error').classList.toggle('show', !pwd);
     if (!pwd) ok = false;
     if (!ok) return;
     document.getElementById('signin-form').style.display = 'none';
     document.getElementById('signin-success').style.display = 'block';
     setTimeout(() => {
         document.getElementById('redirect-bar').style.width = '100%'
     }, 100);
 });