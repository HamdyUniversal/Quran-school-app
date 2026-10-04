# ADR 0005: Qur'an Reference Model

**Status:** Proposed; source, edition, and license not approved
**Date:** 2026-10-04
**Owner:** Qur'an Reviewer; Product Owner; Technical Lead

## Context

Homework and historical lessons must refer to precise verses even if text providers, display editions, or reader implementations change. Page and division mappings vary by edition and must not be treated as universal.

## Decision

- Represent a verse structurally using dataset identity, Surah number, and Ayah number.
- Represent a range with structured start and end references, not display strings.
- Record source, version, riwayah, script/orthography, edition/layout, license, and checksums for every imported dataset.
- Bind page/Juz/Hizb/quarter mappings to the dataset/edition that defines them.
- Preserve approved source text unchanged. Any search normalization is separate derived data and never replaces recitation/display text.
- Consider Tanzil Uthmani/Hafs with Medina Mushaf metadata as a candidate only; production use requires written distribution-rights confirmation and Qur'an Reviewer approval.

## Consequences

- Assignments and historical records must retain dataset/version identity.
- Dataset validation and human review gate acceptance of Qur'an-based assignments.
- Search, fonts, translations, audio, and metadata may have separate licenses.
- A future source change requires explicit mapping/migration rather than silently changing old references.

## Alternatives Considered

- Store a localized/display string: rejected because it is ambiguous and not reliably machine-validatable.
- Store only Surah/Ayah with no dataset identity: rejected because edition-specific mapping and historical provenance would be lost.
- Select a provider before licensing/reviewer approval: rejected because rights and religious accuracy are not established by technical availability.

## Review Gate

Do not import production content or accept memorization assignments until the approval questions in [Qur'an Integration](../../../docs/quran/INTEGRATION.md) are closed.