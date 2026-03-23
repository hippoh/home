(() => {
  const books = window.CLASSICS_LIBRARY.books;
  const params = new URLSearchParams(window.location.search);

  const printBookTitle = document.getElementById("printBookTitle");
  const printMeta = document.getElementById("printMeta");
  const printDocument = document.getElementById("printDocument");
  const printButton = document.getElementById("printButton");
  const returnLink = document.getElementById("returnLink");
  const toggleWrap = document.getElementById("printTranslationToggleWrap");
  const toggle = document.getElementById("printTranslationToggle");
  const translationLabel = document.getElementById("printTranslationLabel");
  const sectionTemplate = document.getElementById("printSectionTemplate");
  const entryTemplate = document.getElementById("printEntryTemplate");

  const book = resolveBook();
  const scopeSectionId = params.get("section");

  function translationStorageKey() {
    return `${book.slug}.showTranslation`;
  }

  function resolveBook() {
    const slug = params.get("book") || "shishuoxinyu";
    return books.find((item) => item.slug === slug) || books[0];
  }

  function resolveSections() {
    if (!scopeSectionId) {
      return book.sections;
    }
    const section = book.sections.find((item) => item.id === scopeSectionId);
    return section ? [section] : book.sections;
  }

  function setTheme() {
    document.documentElement.style.setProperty("--accent", book.theme.accent);
    document.documentElement.style.setProperty("--accent-strong", book.theme.accent_strong);
    document.documentElement.style.setProperty("--accent-soft", book.theme.accent_soft);
    document.documentElement.style.setProperty("--glow-a", book.theme.glow_a);
    document.documentElement.style.setProperty("--glow-b", book.theme.glow_b);
    document.body.dataset.book = book.slug;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatSectionOrdinal(section) {
    if (book.slug === "shishuoxinyu") {
      return `第 ${pad2(section.order)} 门`;
    }
    return `第 ${pad2(section.order)} ${book.section_label}`;
  }

  function formatSectionDisplayTitle(section) {
    if (book.slug === "shishuoxinyu") {
      return section.title;
    }
    if (section.subtitle) {
      return `${section.subtitle} · ${section.title}`;
    }
    return section.title;
  }

  function createParagraph(text, kind, role) {
    const node = document.createElement("p");
    node.className = `${role} ${kind === "poem" ? "is-poem" : "is-prose"}`;
    node.textContent = text;
    return node;
  }

  function renderEntry(sectionNode, section, entry, showTranslation) {
    const fragment = entryTemplate.content.cloneNode(true);
    const codeNode = fragment.querySelector(".print-entry-code");
    const titleNode = fragment.querySelector(".print-entry-title");
    const metaNode = fragment.querySelector(".print-entry-meta");
    const originalGroup = fragment.querySelector(".print-original-group");
    const translationGroup = fragment.querySelector(".print-translation-group");

    const hasStandaloneTitle =
      Boolean(entry.title) && !(section.entries.length === 1 && entry.title === section.title);
    const metaParts = [entry.meta];
    if (!hasStandaloneTitle && entry.subtitle && entry.subtitle !== section.subtitle) {
      metaParts.push(entry.subtitle);
    }

    codeNode.textContent = entry.code;
    titleNode.textContent = entry.title || "";
    titleNode.hidden = !hasStandaloneTitle;
    metaNode.textContent = metaParts.join(" · ");
    metaNode.hidden = metaParts.length === 0;

    entry.original_paragraphs.forEach((paragraph) => {
      originalGroup.appendChild(createParagraph(paragraph, entry.kind, "print-original"));
    });

    if (showTranslation && entry.translation_paragraphs.length > 0) {
      entry.translation_paragraphs.forEach((paragraph) => {
        translationGroup.appendChild(
          createParagraph(paragraph, entry.kind, "print-translation")
        );
      });
      translationGroup.hidden = false;
    } else {
      translationGroup.hidden = true;
    }

    sectionNode.appendChild(fragment);
  }

  function renderPreface(sectionFragment) {
    const shouldShowPreface =
      !scopeSectionId &&
      book.preface &&
      book.preface.title &&
      book.preface.paragraphs &&
      book.preface.paragraphs.length > 0;

    const prefaceNode = sectionFragment.querySelector(".print-preface");
    if (!shouldShowPreface) {
      prefaceNode.hidden = true;
      return;
    }

    prefaceNode.hidden = false;
    sectionFragment.querySelector(".print-preface-title").textContent = book.preface.title;
    const contentNode = sectionFragment.querySelector(".print-preface-content");
    contentNode.innerHTML = "";
    book.preface.paragraphs.forEach((paragraph) => {
      const node = document.createElement("p");
      node.textContent = paragraph;
      contentNode.appendChild(node);
    });
  }

  function render() {
    const showTranslation = book.supports_translation && toggle.checked;
    const sections = resolveSections();

    printDocument.innerHTML = "";
    printBookTitle.textContent = book.title;
    printMeta.textContent = scopeSectionId
      ? `${formatSectionDisplayTitle(sections[0])} · ${formatSectionOrdinal(sections[0])} · ${sections[0].entry_count}${book.entry_label}`
      : `共 ${book.stats.section_count}${book.section_label}，${book.stats.entry_count}${book.entry_label}`;
    document.title = `${book.title}打印版${showTranslation ? "（原文与译文）" : "（原文）"}`;
    returnLink.href = `./classics.html?book=${book.slug}${scopeSectionId ? `#${scopeSectionId}` : ""}`;

    sections.forEach((section, index) => {
      const sectionFragment = sectionTemplate.content.cloneNode(true);
      sectionFragment.querySelector(".print-order").textContent = formatSectionOrdinal(section);
      sectionFragment.querySelector(".print-title").textContent = formatSectionDisplayTitle(section);

      const sourceParts = [];
      sourceParts.push(formatSectionOrdinal(section));
      if (section.source_url) {
        sourceParts.push(section.source_url);
      }
      sectionFragment.querySelector(".print-source").textContent = sourceParts.join(" · ");

      if (index === 0) {
        renderPreface(sectionFragment);
      }

      const entriesRoot = sectionFragment.querySelector(".print-entries");
      section.entries.forEach((entry) => {
        renderEntry(entriesRoot, section, entry, showTranslation);
      });

      printDocument.appendChild(sectionFragment);
    });
  }

  toggle.checked =
    params.get("translation") === "1" ||
    localStorage.getItem(translationStorageKey()) === "1";
  toggle.disabled = !book.supports_translation;
  toggleWrap.classList.toggle("is-disabled", !book.supports_translation);
  translationLabel.textContent = book.supports_translation ? "显示译文" : "暂无译文";

  toggle.addEventListener("change", () => {
    localStorage.setItem(translationStorageKey(), toggle.checked ? "1" : "0");
    render();
  });

  printButton.addEventListener("click", () => {
    window.print();
  });

  setTheme();
  render();
})();
