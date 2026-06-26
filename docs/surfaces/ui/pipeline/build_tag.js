// surfaces/ui/pipeline/build_tag.js
// Construct the routing tag: { user_id, conversation_id, timestamp }

import { getUserId } from "../state/user_id.js";
import { getConversationId } from "../state/conversation_id.js";

export function buildTag() {
  return {
    user_id: getUserId(),
    conversation_id: getConversationId(),
    timestamp: new Date().toISOString()
  };
}
