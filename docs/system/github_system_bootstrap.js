import "./runner_adapter.js";

window.__system_handleEnvelope = (envelope, onReply) => {
  return window.__system_runner(envelope).then(onReply);
};
