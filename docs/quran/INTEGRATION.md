# Qur'an Data Integration Decision

**Status:** Candidate documented; not approved for production import
**Prepared:** 4 October 2026
**Owners:** Qur'an Reviewer; Product Owner for licensing and distribution terms; Technical Lead for validation/import
**School jurisdiction:** Egypt (privacy/legal review tracked separately)

## 1. Recommendation

Evaluate the **Tanzil Uthmani Quran text** as the V1 Arabic-text candidate, paired with the corresponding Tanzil Quran metadata release for Surah/Ayah structure and Medina Mushaf page/Juz divisions. Tanzil states that its text is based on the Medina Mushaf in the narration of Hafs, and that the Uthmani variant is Unicode encoded.

This is a recommendation, not approval. Do not import text into production, ship it in an offline app, or commit a redistributed dataset until the Qur'an Reviewer approves the exact recitation/script/edition and the Product Owner confirms in writing that the text, metadata, fonts, and intended distribution are licensed for the app (including any future commercial school service).

## 2. Source Findings

The following official Tanzil pages were reviewed on 4 October 2026:

- [Tanzil Quran Text Types](https://tanzil.net/docs/quran_text_types) lists Uthmani and other script variants.
- [Tanzil Uthmani](https://tanzil.net/docs/uthmani) describes the text as Unicode encoding of the Medina Mushaf.
- [Medina Mushaf](https://tanzil.net/docs/medina_mushaf) says the Tanzil text is based on the Medina Mushaf narration of Hafs.
- [Tanzil Quran Metadata](https://tanzil.net/docs/Quran_Metadata) lists Surah information and partitioning such as Juz, Hizb, Hizb quarters, Manzil, Ruku, and page number in the Medina Mushaf. It identifies metadata release 1.0.
- [Tanzil Text License](https://tanzil.net/docs/Text_License) identifies CC BY 3.0, permits verbatim copying/distribution, prohibits changing the text, and requires source attribution, a Tanzil link, and retention of the copyright notice.
- [Tanzil FAQ](https://tanzil.net/docs/faq) says its developer resources are available for non-commercial purposes. This statement must be reconciled with the text-specific license before any commercial use; the metadata and any font assets also need their own rights review.
- [Tanzil Download](https://tanzil.net/download/) identifies text release 1.1 (February 2021), gives the text terms, and links to metadata and updates.

These pages do not establish that the project has permission to modify the text, create a changed derivative, or use every related resource (metadata, fonts, translations, audio) commercially. Do not assume that text terms automatically cover separate assets or metadata.

Quran Foundation's [API documentation](https://api-docs.quran.foundation/) offers content APIs for verses, chapters, translations, tafsir, audio, and search. Its [access page](https://api-docs.quran.foundation/request-access) describes app registration, pre-live credentials, and requesting production permissions. It is an alternative to evaluate if live API delivery is preferred, but the reviewed pages do not establish offline redistribution rights or dataset licensing. No API has been selected.

## 3. Approval Questions (Blocking Before 0.3 Import)

- [ ] Qur'an Reviewer confirms riwayah (proposed: Hafs), script (proposed: Uthmani), and exact edition/layout required by the school.
- [ ] Qur'an Reviewer confirms whether the Medina Mushaf page mapping is the school's intended print layout and how basmala is represented for display and assignment ranges.
- [ ] Product Owner obtains written confirmation that text and metadata may be bundled, cached offline, and distributed in this app; explicitly resolve commercial/service use and the FAQ's non-commercial wording.
- [ ] Product Owner confirms attribution and copyright-notice placement in the app and in any redistributed data package.
- [ ] Technical Lead confirms exact source files, release versions, checksums, update monitoring, and whether the Unicode/font rendering requirements can be met without altering source text.
- [ ] Separately review the license for each Arabic font, translation, tafsir, audio, or other asset; none is implicitly covered by the text decision.

If these approvals cannot be obtained, do not use Tanzil in a production build. Evaluate a source with explicit compatible offline and commercial terms, or use an approved API without caching/redistribution where its terms permit.

## 4. Versioned Domain Reference Model

Store a verse reference as structured data, never as a display string such as `"Al-Baqarah 10-20"`:

```ts
export type QuranDatasetId = string;

export type QuranReference = {
  datasetId: QuranDatasetId;
  surahNumber: number;
  ayahNumber: number;
};

export type QuranRange = {
  start: QuranReference;
  end: QuranReference;
};
```

The dataset record identifies source, release, riwayah, script/orthography, edition/layout, license, attribution, import timestamp, and source-file checksums. Surah/Ayah ordering is validated against that dataset. Page, Juz, Hizb, quarter, and other division mappings are dataset/edition-specific and must not be treated as universal properties of a verse.

Keep the original approved Arabic text unchanged. Any search normalization or display-only shaping must be a separate derived value, traceable to the original dataset, and must never replace text used for recitation display, assignment identity, or historical records.

## 5. Import and Validation Gate

Before accepting Qur'an ranges in milestone 0.3:

- [ ] Download source files only from the approved official source; preserve an unmodified copy and its license/attribution notice.
- [ ] Parse structured source formats with a parser, not line-position assumptions or ad hoc text rewriting.
- [ ] Record source URL, release/version, retrieval date, riwayah, script, edition, licensing decision, and SHA-256 checksums.
- [ ] Validate exactly the expected Surah sequence and each Surah's approved Ayah count; detect missing, duplicate, out-of-order, and invalid references.
- [ ] Validate page/Juz/Hizb/quarter mapping coverage and boundaries against the selected edition; do not infer mappings from text order.
- [ ] Define and test basmala treatment, including Surah 1 and the beginning of Surah 9, with the Qur'an Reviewer.
- [ ] Have a qualified reviewer compare representative beginning, middle, ending, and boundary passages against the approved Mushaf edition.
- [ ] Render representative diacritics and pause marks on supported Android and iOS devices using the separately approved font.
- [ ] Make the validation script repeatable in CI and fail the import/build on unexpected dataset changes.
- [ ] Preserve dataset/version identity on every later assignment and historical reference so updates cannot silently reinterpret old work.

## 6. Decision Gate

The data-source task remains open until the approval questions are answered and recorded. Only then update this document's status to approved, record the approver/date and exact artifact versions, and proceed with a versioned import. Production Qur'an content must not depend on an unreviewed source or mutable third-party response.