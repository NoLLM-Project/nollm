// surfaces/ui/actions/new_conversation.js

import { newConversationId as generateNewConversationId } from "../state/conversation_id.js";

export function actionNewConversation() {
  newConversationId();
}
