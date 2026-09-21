<script lang="ts">
  // AboutWindow — colophon for the "About this site" window.
</script>

<div class="about">
  <h1 class="title">vamsiOS</h1>
  <p class="body-line">A fake little Mac, as a personal website.</p>
  <p class="body-line">Built with Astro + Svelte. Type set in San Francisco and Newsreader.</p>
  <p class="body-line link-line">
    <a
      href="https://github.com/vamsi876"
      target="_blank"
      rel="noopener"
      class="link"
    >github.com/vamsi876</a>
  </p>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px 32px;
    text-align: center;
    gap: 8px;
  }

  .title {
    font-family: var(--chrome-font);
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--text);
  }

  .body-line {
    font-family: var(--serif-font);
    font-size: 14px;
    color: var(--text);
    margin: 0;
    line-height: 1.5;
  }

  .link-line {
    margin-top: 4px;
  }

  .link {
    color: var(--accent);
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
