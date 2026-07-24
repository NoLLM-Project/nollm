// surfaces/ui/pipeline/build_envelope.js
// Construct the envelope: { message, tag }

import { buildTag } from "./build_tag.js";

export function buildEnvelope(text) {
  return {
    text,
    tag: buildTag()
  };
}
