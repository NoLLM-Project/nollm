// surfaces/ui/actions/new_conversation.js

import { newConversationId } from "../state/conversation_id.js";

export function actionNewConversation() {
  newConversationId();
}
