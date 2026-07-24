S0 + raw text → init → S1
S1 + raw text → tokenize → S2
S2 + token → atom lookup → S2
S2 + end → finalize atoms → S3
S3 + token span → phrase match → S3
S3 + end → finalize P-atoms → S4
S4 + atom pattern → chunk → S4
S4 + end → finalize chunks → S5
S5 + chunk → append → S5
S5 + punctuation/comma → close clause → S5
S5 + connective (mid-sentence) → close clause → S5
S5 + end → finalize clauses → S6
S6 + data → assemble SENTENCE → END
