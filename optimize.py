import re
import os

html_file = 'index.html'

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL | re.IGNORECASE)
styles = style_pattern.findall(content)
merged_css = "\n".join(styles)

# Remove style blocks from HTML and insert <link>
# We replace the first one with the link, and remove the rest
link_tag = '<link rel="preload" href="styles.min.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="styles.min.css"></noscript>'
content = style_pattern.sub(lambda m: link_tag if m.start() == style_pattern.search(content).start() else '', content)

# Extract JS
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
scripts = script_pattern.findall(content)
merged_js = "\n".join(scripts)

# Remove script blocks from HTML and insert <script src>
script_tag = '<script defer src="script.min.js"></script>'
content = script_pattern.sub(lambda m: script_tag if m.start() == script_pattern.search(content).start() else '', content)

# Basic HTML replacements for SEO/Accessibility/Performance
# Add lang="en" if missing
content = re.sub(r'<html(?!.*lang=)>', '<html lang="en">', content, flags=re.IGNORECASE)

# Add meta tags for SEO
seo_tags = """
  <meta name="description" content="A special birthday surprise for Binita">
  <meta name="keywords" content="birthday, surprise, binita, celebration">
  <meta property="og:title" content="Happy Birthday Binita">
  <meta property="og:description" content="A special birthday surprise just for you.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://yourdomain.com/">
"""
content = re.sub(r'(<head[^>]*>)', r'\1' + seo_tags, content, flags=re.IGNORECASE, count=1)

# Add width/height/loading=lazy to images
def img_repl(match):
    tag = match.group(0)
    if 'loading=' not in tag and 'preload' not in tag:
        tag = tag.replace('<img', '<img loading="lazy" width="800" height="600"')
    if 'alt=' not in tag:
        tag = tag.replace('<img', '<img alt="Image"')
    return tag

content = re.sub(r'<img[^>]+>', img_repl, content, flags=re.IGNORECASE)

# Add preload="metadata" to videos and remove autoplay if present
def vid_repl(match):
    tag = match.group(0)
    tag = re.sub(r'\s*autoplay\s*', ' ', tag, flags=re.IGNORECASE)
    if 'preload=' not in tag:
        tag = tag.replace('<video', '<video preload="metadata"')
    else:
        tag = re.sub(r'preload="[^"]+"', 'preload="metadata"', tag, flags=re.IGNORECASE)
    
    # We don't remove playsinline, loop, muted
    # Add generic poster if not present
    if 'poster=' not in tag:
        tag = tag.replace('<video', '<video poster="image/background/lock_back.png"')
    return tag

content = re.sub(r'<video[^>]+>', vid_repl, content, flags=re.IGNORECASE)

# Add aria-label to buttons without text
def btn_repl(match):
    tag = match.group(0)
    if 'aria-label=' not in tag:
        tag = tag.replace('<button', '<button aria-label="Button"')
    return tag
content = re.sub(r'<button[^>]+>', btn_repl, content, flags=re.IGNORECASE)

with open('styles.min.css', 'w', encoding='utf-8') as f:
    f.write(merged_css)

with open('script.min.js', 'w', encoding='utf-8') as f:
    f.write(merged_js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Optimization completed.")
