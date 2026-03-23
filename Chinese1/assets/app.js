(() => {
  const library = window.CLASSICS_LIBRARY;
  const books = library.books;

  const bookList = document.getElementById("bookList");
  const tocList = document.getElementById("tocList");
  const entries = document.getElementById("entries");
  const entryTemplate = document.getElementById("entryTemplate");

  const bookTitle = document.getElementById("bookTitle");
  const bookMeta = document.getElementById("bookMeta");
  const siteDescription = document.getElementById("siteDescription");
  const sectionStatLabel = document.getElementById("sectionStatLabel");
  const sectionCount = document.getElementById("sectionCount");
  const entryStatLabel = document.getElementById("entryStatLabel");
  const entryCount = document.getElementById("entryCount");
  const translationState = document.getElementById("translationState");
  const tocHeading = document.getElementById("tocHeading");
  const tocMeta = document.getElementById("tocMeta");

  const translationToggleWrap = document.getElementById("translationToggleWrap");
  const translationToggle = document.getElementById("translationToggle");
  const translationToggleLabel = document.getElementById("translationToggleLabel");
  const sectionHeading = document.getElementById("sectionHeading");
  const sectionMeta = document.getElementById("sectionMeta");
  const sectionTitle = document.getElementById("sectionTitle");
  const sectionSource = document.getElementById("sectionSource");
  const sourceNotice = document.getElementById("sourceNotice");
  const prevSection = document.getElementById("prevSection");
  const nextSection = document.getElementById("nextSection");
  const printPageLink = document.getElementById("printPageLink");
  const fullOriginalPdfLink = document.getElementById("fullOriginalPdfLink");
  const fullTranslationPdfLink = document.getElementById("fullTranslationPdfLink");
  const sectionPrintLink = document.getElementById("sectionPrintLink");
  const sectionOriginalPdfLink = document.getElementById("sectionOriginalPdfLink");
  const sectionTranslationPdfLink = document.getElementById("sectionTranslationPdfLink");

  const prefaceCard = document.getElementById("prefaceCard");
  const prefaceTitle = document.getElementById("prefaceTitle");
  const prefaceContent = document.getElementById("prefaceContent");

  let currentBookIndex = findInitialBookIndex();
  let currentSectionIndex = findInitialSectionIndex(getCurrentBook());

  function getCurrentBook() {
    return books[currentBookIndex];
  }

  function translationStorageKey(book) {
    return `${book.slug}.showTranslation`;
  }

  function loadTranslationPreference(book) {
    return book.supports_translation && localStorage.getItem(translationStorageKey(book)) === "1";
  }

  function saveTranslationPreference(book, showTranslation) {
    localStorage.setItem(translationStorageKey(book), showTranslation ? "1" : "0");
  }

  function findInitialBookIndex() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("book") || "shishuoxinyu";
    const index = books.findIndex((book) => book.slug === slug);
    return index >= 0 ? index : 0;
  }

  function findInitialSectionIndex(book) {
    const sectionId = window.location.hash.replace("#", "");
    const index = book.sections.findIndex((section) => section.id === sectionId);
    return index >= 0 ? index : 0;
  }

  function setTheme(book) {
    document.documentElement.style.setProperty("--accent", book.theme.accent);
    document.documentElement.style.setProperty("--accent-strong", book.theme.accent_strong);
    document.documentElement.style.setProperty("--accent-soft", book.theme.accent_soft);
    document.documentElement.style.setProperty("--glow-a", book.theme.glow_a);
    document.documentElement.style.setProperty("--glow-b", book.theme.glow_b);
    document.body.dataset.book = book.slug;
  }

  function updateUrl(book, section) {
    const url = new URL(window.location.href);
    url.searchParams.set("book", book.slug);
    url.hash = section.id;
    window.history.replaceState({}, "", url);
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatSectionOrdinal(book, section) {
    if (book.slug === "shishuoxinyu") {
      return `第 ${pad2(section.order)} 门`;
    }
    return `第 ${pad2(section.order)} ${book.section_label}`;
  }

  function formatSectionDisplayTitle(book, section) {
    if (book.slug === "shishuoxinyu") {
      return section.title;
    }
    if (section.subtitle) {
      return `${section.subtitle} · ${section.title}`;
    }
    return section.title;
  }

  function formatSectionHeading(book, section) {
    if (book.slug === "shishuoxinyu") {
      return formatSectionOrdinal(book, section);
    }
    if (section.subtitle) {
      return formatSectionDisplayTitle(book, section);
    }
    return `${book.title} · ${section.title}`;
  }

  function buildFullPdfPath(book, showTranslation) {
    if (showTranslation && book.full_pdf.translation) {
      return book.full_pdf.translation;
    }
    return book.full_pdf.original;
  }

  function buildSectionPdfPath(book, section, showTranslation) {
    if (!book.section_pdf_dir) {
      return "";
    }
    const suffix =
      showTranslation && book.supports_translation && section.translation_entry_count > 0
        ? "with-translation"
        : "original-only";
    return `${book.section_pdf_dir}/${section.id}-${suffix}.pdf`;
  }

  function createParagraph(text, kind, role) {
    const paragraph = document.createElement("p");
    paragraph.className = `${role} ${kind === "poem" ? "is-poem" : "is-prose"}`;
    paragraph.textContent = text;
    return paragraph;
  }

  function renderBookList(book) {
    bookList.innerHTML = "";
    books.forEach((candidate, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "book-chip";
      button.dataset.book = candidate.slug;
      button.innerHTML = `
        <span class="book-chip-title">${candidate.title}</span>
        <span class="book-chip-meta">${candidate.author}</span>
      `;
      if (index === currentBookIndex) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        if (currentBookIndex === index) {
          return;
        }
        currentBookIndex = index;
        currentSectionIndex = 0;
        translationToggle.checked = loadTranslationPreference(getCurrentBook());
        render();
      });
      bookList.appendChild(button);
    });
  }

  function renderToc(book) {
    tocList.innerHTML = "";
    let previousSubtitle = "";
    book.sections.forEach((section, index) => {
      if (section.subtitle && section.subtitle !== previousSubtitle) {
        const label = document.createElement("div");
        label.className = "toc-group-label";
        label.textContent = section.subtitle;
        tocList.appendChild(label);
        previousSubtitle = section.subtitle;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "toc-item";
      const subtitleParts = [formatSectionOrdinal(book, section), `${section.entry_count}${book.entry_label}`];
      button.dataset.sectionId = section.id;
      button.innerHTML = `
        <span class="toc-order">${pad2(section.order)}</span>
        <span class="toc-copy">
          <span class="toc-title">${section.title}</span>
          <span class="toc-subtitle">${subtitleParts.join(" · ")}</span>
        </span>
      `;
      if (index === currentSectionIndex) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        currentSectionIndex = index;
        render();
      });
      tocList.appendChild(button);
    });
  }

  function renderPreface(book) {
    const showPreface =
      Boolean(book.preface && book.preface.title && book.preface.paragraphs.length) &&
      currentSectionIndex === 0;
    prefaceCard.hidden = !showPreface;
    if (!showPreface) {
      return;
    }

    prefaceTitle.textContent = book.preface.title;
    prefaceContent.innerHTML = "";
    book.preface.paragraphs.forEach((paragraph) => {
      const node = document.createElement("p");
      node.textContent = paragraph;
      prefaceContent.appendChild(node);
    });
  }

  function renderEntries(book, section, showTranslation) {
    entries.innerHTML = "";
    section.entries.forEach((entry) => {
      const fragment = entryTemplate.content.cloneNode(true);
      const entryIndex = fragment.querySelector(".entry-index");
      const entryTitle = fragment.querySelector(".entry-title");
      const entryMeta = fragment.querySelector(".entry-meta");
      const originalGroup = fragment.querySelector(".entry-original-group");
      const translationWrap = fragment.querySelector(".entry-translation-wrap");
      const translationGroup = fragment.querySelector(".entry-translation-group");

      const hasStandaloneTitle =
        Boolean(entry.title) && !(section.entries.length === 1 && entry.title === section.title);
      const metaParts = [entry.meta];
      if (!hasStandaloneTitle && entry.subtitle && entry.subtitle !== section.subtitle) {
        metaParts.push(entry.subtitle);
      }

      entryIndex.textContent = entry.code || `${pad2(section.order)}.${String(entry.index).padStart(3, "0")}`;
      entryTitle.textContent = entry.title || "";
      entryTitle.hidden = !hasStandaloneTitle;
      entryMeta.textContent = metaParts.join(" · ");
      entryMeta.hidden = metaParts.length === 0;

      entry.original_paragraphs.forEach((paragraph) => {
        originalGroup.appendChild(createParagraph(paragraph, entry.kind, "entry-original"));
      });

      if (showTranslation && entry.translation_paragraphs.length > 0) {
        entry.translation_paragraphs.forEach((paragraph) => {
          translationGroup.appendChild(
            createParagraph(paragraph, entry.kind, "entry-translation")
          );
        });
        translationWrap.hidden = false;
      } else {
        translationWrap.hidden = true;
      }

      entries.appendChild(fragment);
    });
  }

  function renderToolbar(book, section, showTranslation) {
    const heading = formatSectionHeading(book, section);

    const metaParts = [];
    if (book.slug === "shishuoxinyu") {
      metaParts.push(section.title);
    } else {
      metaParts.push(formatSectionOrdinal(book, section));
    }
    metaParts.push(`共 ${section.entry_count} ${book.entry_label}`);
    sectionHeading.textContent = heading;
    sectionMeta.textContent = metaParts.join(" · ");

    prevSection.disabled = currentSectionIndex === 0;
    nextSection.disabled = currentSectionIndex === book.sections.length - 1;

    translationToggle.disabled = !book.supports_translation;
    translationToggleWrap.classList.toggle("is-disabled", !book.supports_translation);
    translationToggleLabel.textContent = book.supports_translation ? "显示译文" : "暂无译文";

    printPageLink.href = `./print.html?book=${book.slug}&translation=${showTranslation ? "1" : "0"}`;
    fullOriginalPdfLink.href = buildFullPdfPath(book, false);
    fullTranslationPdfLink.href = buildFullPdfPath(book, true);
    fullTranslationPdfLink.hidden = !book.supports_translation;

    sectionPrintLink.href = `./print.html?book=${book.slug}&section=${section.id}&translation=${showTranslation ? "1" : "0"}`;

    const sectionOriginalPath = buildSectionPdfPath(book, section, false);
    const sectionTranslationPath = buildSectionPdfPath(book, section, true);
    sectionOriginalPdfLink.hidden = !sectionOriginalPath;
    sectionTranslationPdfLink.hidden =
      !book.supports_translation || section.translation_entry_count === 0 || !sectionTranslationPath;

    if (sectionOriginalPath) {
      sectionOriginalPdfLink.href = sectionOriginalPath;
    }
    if (sectionTranslationPath) {
      sectionTranslationPdfLink.href = sectionTranslationPath;
    }
  }

  function renderMeta(book, section) {
    bookTitle.textContent = book.title;
    bookMeta.textContent = `${book.author} · ${book.era}`;
    siteDescription.textContent = book.description;
    sectionStatLabel.textContent = book.section_label;
    sectionCount.textContent = book.stats.section_count;
    entryStatLabel.textContent = book.entry_label;
    entryCount.textContent = book.stats.entry_count;
    translationState.textContent = book.supports_translation ? "可切换" : "原文";

    tocHeading.textContent = `${book.section_label}目录`;
    tocMeta.textContent = `当前共 ${book.stats.section_count} ${book.section_label}`;

    sectionTitle.textContent = formatSectionDisplayTitle(book, section);
    const sourceParts = [];
    sourceParts.push(formatSectionOrdinal(book, section));
    if (section.source_url) {
      sourceParts.push(`来源：${section.source_url}`);
    }
    sectionSource.textContent = sourceParts.join(" · ");
    sourceNotice.textContent = `${book.source_notice.original} ${book.source_notice.translation}`;
  }

  function render() {
    const book = getCurrentBook();
    const section = book.sections[currentSectionIndex];
    const showTranslation = book.supports_translation && translationToggle.checked;

    setTheme(book);
    renderBookList(book);
    renderToc(book);
    renderMeta(book, section);
    renderToolbar(book, section, showTranslation);
    renderPreface(book);
    renderEntries(book, section, showTranslation);
    updateUrl(book, section);

    document.title = `${book.title} · ${formatSectionDisplayTitle(book, section)}`;
  }

  translationToggle.checked = loadTranslationPreference(getCurrentBook());

  translationToggle.addEventListener("change", () => {
    saveTranslationPreference(getCurrentBook(), translationToggle.checked);
    render();
  });

  prevSection.addEventListener("click", () => {
    currentSectionIndex = Math.max(0, currentSectionIndex - 1);
    render();
  });

  nextSection.addEventListener("click", () => {
    currentSectionIndex = Math.min(getCurrentBook().sections.length - 1, currentSectionIndex + 1);
    render();
  });

  window.addEventListener("popstate", () => {
    const nextBookIndex = findInitialBookIndex();
    currentBookIndex = nextBookIndex;
    translationToggle.checked = loadTranslationPreference(getCurrentBook());
    currentSectionIndex = findInitialSectionIndex(getCurrentBook());
    render();
  });

  window.addEventListener("hashchange", () => {
    const nextSectionIndex = findInitialSectionIndex(getCurrentBook());
    if (nextSectionIndex !== currentSectionIndex) {
      currentSectionIndex = nextSectionIndex;
      render();
    }
  });

  render();
})();
