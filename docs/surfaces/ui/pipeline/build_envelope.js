// surfaces/ui/pipeline/build_envelope.js
// Construct the envelope: { message, tag }

import { buildTag } from "./build_tag.js";

export function buildEnvelope(message) {
  return {
    message,
    tag: buildTag()
  };
}
