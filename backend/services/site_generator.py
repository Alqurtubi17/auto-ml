"""
Site generator — produces a minimal, self-contained HTML site
from a TemplateSchema + user configuration.

In production: replace string assembly with a Jinja2 template engine
or hand off to a headless Next.js SSG build process.
"""
from __future__ import annotations
from schemas import TemplateSchema


_SECTION_RENDERERS: dict[str, str] = {
    "hero": """
  <section class="hero">
    <div class="container">
      <h1>{{headline}}</h1>
      <p class="subtitle">{{subtitle}}</p>
      <a href="#" class="btn-primary">Get started</a>
    </div>
  </section>""",
    "features": """
  <section class="features">
    <div class="container grid-3">
      <div class="feature-card"><h3>Fast</h3><p>Optimised for performance.</p></div>
      <div class="feature-card"><h3>Reliable</h3><p>Built to last.</p></div>
      <div class="feature-card"><h3>Smart</h3><p>AI-powered insights.</p></div>
    </div>
  </section>""",
    "pricing": """
  <section class="pricing">
    <div class="container grid-3">
      <div class="plan"><h3>Starter</h3><p class="price">$0/mo</p></div>
      <div class="plan featured"><h3>Pro</h3><p class="price">$29/mo</p></div>
      <div class="plan"><h3>Enterprise</h3><p class="price">Custom</p></div>
    </div>
  </section>""",
    "testimonials": """
  <section class="testimonials">
    <div class="container">
      <blockquote>"This transformed how we work."<cite>— Happy Customer</cite></blockquote>
    </div>
  </section>""",
    "gallery": """
  <section class="gallery">
    <div class="container grid-3">
      <div class="gallery-item"></div>
      <div class="gallery-item"></div>
      <div class="gallery-item"></div>
    </div>
  </section>""",
    "faq": """
  <section class="faq">
    <div class="container">
      <details><summary>What is this?</summary><p>An AI-generated website.</p></details>
      <details><summary>How does it work?</summary><p>ML models personalise every element.</p></details>
    </div>
  </section>""",
    "contact": """
  <section class="contact">
    <div class="container">
      <form><input placeholder="Your email" /><button type="submit">Send</button></form>
    </div>
  </section>""",
    "cta": """
  <section class="cta">
    <div class="container"><h2>Ready to build?</h2><a href="#" class="btn-primary">Start now</a></div>
  </section>""",
}

_BASE_CSS = """
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
:root {{ --accent: {accent}; --radius: 10px; }}
body {{ font-family: system-ui, sans-serif; color: #111; line-height: 1.6; }}
.container {{ max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }}
.grid-3 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }}
h1 {{ font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.15; margin-bottom: 1rem; }}
h2 {{ font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 600; margin-bottom: 1rem; }}
h3 {{ font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }}
.subtitle {{ font-size: 1.125rem; color: #555; margin-bottom: 2rem; }}
.btn-primary {{ display: inline-block; padding: 0.75rem 1.75rem; background: var(--accent);
                color: #fff; border-radius: var(--radius); font-weight: 600; text-decoration: none; }}
.feature-card, .gallery-item {{ background: #f8f8f8; border-radius: var(--radius); padding: 1.5rem; }}
.gallery-item {{ min-height: 200px; background: linear-gradient(135deg, #e8e8e8, #d0d0d0); }}
.plan {{ border: 1px solid #e5e5e5; border-radius: var(--radius); padding: 2rem; text-align: center; }}
.plan.featured {{ border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }}
.price {{ font-size: 1.75rem; font-weight: 700; color: var(--accent); margin: 0.5rem 0 1rem; }}
blockquote {{ font-size: 1.25rem; font-style: italic; padding: 2rem; background: #f8f8f8;
              border-left: 4px solid var(--accent); border-radius: 0 var(--radius) var(--radius) 0; }}
cite {{ display: block; margin-top: 1rem; font-size: 0.9rem; color: #777; font-style: normal; }}
.hero {{ background: linear-gradient(160deg, #f9f9f9 60%, {accent}12 100%); }}
.cta {{ background: var(--accent); color: #fff; }}
.cta h2, .cta a {{ color: #fff; }}
.cta .btn-primary {{ background: #fff; color: var(--accent); }}
details {{ border-bottom: 1px solid #e5e5e5; padding: 1rem 0; cursor: pointer; }}
summary {{ font-weight: 600; }}
form {{ display: flex; gap: 0.75rem; flex-wrap: wrap; }}
input {{ flex: 1; min-width: 220px; padding: 0.75rem 1rem; border: 1px solid #ddd;
         border-radius: var(--radius); font-size: 1rem; }}
form button {{ padding: 0.75rem 1.5rem; background: var(--accent); color: #fff;
                border: none; border-radius: var(--radius); cursor: pointer; font-size: 1rem; }}
"""


def generate_html(
    template: TemplateSchema,
    project_name: str,
    primary_color: str,
    description: str,
) -> str:
    css = _BASE_CSS.format(accent=primary_color)
    body_sections = "\n".join(
        _SECTION_RENDERERS.get(s.type, "")
        for s in template.sections
    ).replace("{{headline}}", project_name).replace("{{subtitle}}", description or template.description)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{project_name}</title>
  <style>{css}</style>
</head>
<body>
  <nav style="position:sticky;top:0;background:#fff;border-bottom:1px solid #eee;
              padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;z-index:100">
    <strong style="font-size:1.1rem">{project_name}</strong>
    <a href="#" style="color:var(--accent);font-weight:600;text-decoration:none">Get started</a>
  </nav>
{body_sections}
  <footer style="border-top:1px solid #eee;padding:2rem 1.5rem;text-align:center;color:#888;font-size:0.875rem">
    Built with WebForge AI · {template.name} template
  </footer>
</body>
</html>"""
