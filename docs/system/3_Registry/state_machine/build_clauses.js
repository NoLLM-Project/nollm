function build_clauses(chunks, tokens):

    clauses = []
    current_clause = null

    for each chunk in chunks:

        if current_clause == null:
            current_clause = new_clause()
            current_clause.chunks.append(chunk)
            continue

        if is_punctuation_boundary_after_chunk(chunk, tokens):
            current_clause.chunks.append(chunk)
            clauses.append(current_clause)
            current_clause = null
            continue

        if is_connective_chunk(chunk) and current_clause.chunks.length > 0:
            clauses.append(current_clause)
            current_clause = new_clause()
            current_clause.chunks.append(chunk)
            continue

        current_clause.chunks.append(chunk)

    if current_clause != null:
        clauses.append(current_clause)

    return clauses
