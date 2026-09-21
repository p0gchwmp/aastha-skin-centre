# Editorial Preview Target Lock

This workstream has exactly one development target.

- Repository: `p0gchwmp/aastha-skin-centre`
- Branch: `concept/editorial-interactive-v1`
- Render service: `aastha-editorial-concept-preview`
- Preview URL: https://aastha-editorial-concept-preview.onrender.com/
- Render service ID: `srv-daifui3m8hqs73cmq5fg`

## Safety rules

1. Do not implement editorial-preview milestones in `aastha-skin-centre-cms` or `aastha-editorial-cms-staging`.
2. Do not modify production as part of this preview workstream.
3. Batch meaningful changes before committing because the preview auto-deploys on commit.
4. `scripts/build_concept_preview.py` fails closed when Render exposes a different service name.
5. Production deployment requires a separate explicit go-live instruction.
