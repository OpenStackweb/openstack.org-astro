// Shared main-site/blog project switcher. Release fallback from the public sponsored-project API, November 7, 2026.
const fallbackProjects = [{"id": 1, "name": "OpenInfra Foundation", "description": "Learn more about the OpenInfra Foundation", "site_url": "https://openinfra.org", "logo_url": "https://object-storage.public.mtl1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/sponsored-projects/1/logos/osf.svg", "is_active": true, "should_show_on_nav_bar": true}, {"id": 3, "name": "Kata Containers", "description": "Secure, lightweight, virtualized containers", "site_url": "https://katacontainers.io/", "logo_url": "https://object-storage.public.mtl1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/sponsored-projects/3/logos/kata.png", "is_active": true, "should_show_on_nav_bar": true}, {"id": 6, "name": "StarlingX", "description": "Cloud computing for ultra-low latency applications", "site_url": "https://www.starlingx.io/", "logo_url": "https://object-storage.public.mtl1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/sponsored-projects/6/logos/starlingx.png", "is_active": true, "should_show_on_nav_bar": true}, {"id": 7, "name": "Zuul", "description": "CI/CD platform for gating changes across repos", "site_url": "https://zuul-ci.org/", "logo_url": "https://object-storage.public.mtl1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/sponsored-projects/7/logos/zuul.png", "is_active": true, "should_show_on_nav_bar": true}];
(() => {
  if (customElements.get('openinfra-project-switcher')) return;
  class ProjectSwitcher extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({mode:'open'});
      root.innerHTML = `<style>
        :host{display:block;position:relative;font:14px/1.5 'Open Sans',sans-serif;color:#243e4d;z-index:1000}
        *{box-sizing:border-box}[hidden]{display:none!important}
        button{display:grid;grid-template-columns:repeat(3,5px);gap:3px;place-content:center;width:40px;height:40px;margin:0 -10px 0 0;padding:0;background:transparent;color:white;border:0;cursor:pointer}
        button span{width:5px;height:5px;background:currentColor}
        button:focus-visible,a:focus-visible{outline:3px solid #29abe2;outline-offset:3px}
        section{position:absolute;top:44px;right:0;width:440px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 60px);overflow:auto;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 8px 28px #0004;padding:22px;letter-spacing:normal}
        h2{font:600 20px/1.4 'Open Sans',sans-serif;margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid #ddd}
        ul{list-style:none;margin:0;padding:0}li{margin:0}
        a{color:#245570;text-decoration:none}li a{display:flex;gap:16px;align-items:center;padding:13px 4px;border-radius:3px}li a:hover{background:#edf3f6}
        img{width:66px;height:48px;object-fit:contain;flex-shrink:0}strong{display:block;font-size:15px}small{display:block;font-size:13px;color:#526574;margin-top:3px}
        footer{border-top:1px solid #ddd;margin-top:12px;padding-top:14px;font-size:13px}footer a{text-decoration:underline}
      </style><button type="button" aria-label="More OpenInfra projects" aria-expanded="false" aria-controls="projects">${'<span aria-hidden="true"></span>'.repeat(9)}</button><section id="projects" aria-labelledby="title" hidden><h2 id="title">More OpenInfra Projects</h2><ul></ul><footer>Learn more at <a href="https://openinfra.org/projects/">OpenInfra Foundation</a></footer></section>`;
      const button=root.querySelector('button'),panel=root.querySelector('section'),list=root.querySelector('ul');
      const render=projects=>{
        const rows=projects.filter(p=>p.is_active===true&&p.should_show_on_nav_bar===true&&p.id!==4&&typeof p.name==='string'&&/^https:\/\//.test(p.site_url));
        if(!rows.length)return;
        list.replaceChildren(...rows.map(p=>{
          const li=document.createElement('li'),a=document.createElement('a'),text=document.createElement('div'),name=document.createElement('strong'),description=document.createElement('small');
          a.href=p.site_url;name.textContent=p.name;
          // API descriptions are HTML; parse as an inert document and render only plain text.
          description.textContent=new DOMParser().parseFromString(p.description||'', 'text/html').body.textContent;
          if(typeof p.logo_url==='string'&&/^https:\/\//.test(p.logo_url)){const img=document.createElement('img');img.dataset.src=p.logo_url;img.alt='';a.append(img);}
          text.append(name,description);a.append(text);li.append(a);return li;
        }));
      };
      render(fallbackProjects);
      const close=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false')};
      button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src;delete img.dataset.src})});
      this.outside=e=>{if(!e.composedPath().includes(this))close()};
      this.escape=e=>{if(e.key==='Escape'&&!panel.hidden){close();button.focus();e.preventDefault()}};
      document.addEventListener('click',this.outside);document.addEventListener('keydown',this.escape);
      this.focusOut=()=>{queueMicrotask(()=>{if(!this.matches(':focus-within'))close()})};
      this.addEventListener('focusout',this.focusOut);
      fetch('https://oifapi.openinfra.dev/api/public/v1/sponsored-projects/?per_page=100',{credentials:'omit',signal:AbortSignal.timeout(5000)})
        .then(r=>{if(!r.ok)throw Error('Project list unavailable');return r.json()})
        .then(data=>{if(Array.isArray(data.data)&&data.data.length<=100&&panel.hidden)render(data.data)})
        .catch(()=>{}); // Retain release fallback during API failures.
    }
    disconnectedCallback(){document.removeEventListener('click',this.outside);document.removeEventListener('keydown',this.escape);this.removeEventListener('focusout',this.focusOut)}
  }
  customElements.define('openinfra-project-switcher',ProjectSwitcher);
})();
