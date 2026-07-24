function collapse_phrases(tokens, atoms):

    i = 0
    result = []

    while i < len(tokens):
        match = find_longest_P_phrase(tokens, i)

        if match.exists:
            # match.span = [start, end], match.pid = P00000xx
            p_atom = ATOM(id=match.pid,
                          type="P",
                          subtype=get_P_subtype_by_id(match.pid),
                          surface=join_tokens(tokens[match.start..match.end]),
                          span=[match.start, match.end])
            result.append(p_atom)
            i = match.end + 1
        else:
            result.append(atoms[i])
            i += 1

    return result
