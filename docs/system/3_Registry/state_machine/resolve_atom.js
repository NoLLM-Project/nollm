function resolve_atom(token, index):

    if token_in_lexicon_N(token):
        return ATOM(id=get_N_id(token),
                    type="N",
                    subtype=get_N_subtype(token),
                    surface=token,
                    span=[index, index])

    if token_in_lexicon_F(token):
        return ATOM(id=get_F_id(token),
                    type="F",
                    subtype=get_F_subtype(token),
                    surface=token,
                    span=[index, index])

    if token_in_lexicon_D(token):
        return ATOM(id=get_D_id(token),
                    type="D",
                    subtype=get_D_subtype(token),
                    surface=token,
                    span=[index, index])

    if token_in_lexicon_J(token):
        return ATOM(id=get_J_id(token),
                    type="J",
                    subtype=get_J_subtype(token),
                    surface=token,
                    span=[index, index])

    if token_in_lexicon_P_single(token):
        return ATOM(id=get_P_id(token),
                    type="P",
                    subtype=get_P_subtype(token),
                    surface=token,
                    span=[index, index])

    return ATOM(id="UNKNOWN",
                type="UNKNOWN",
                subtype="UNKNOWN",
                surface=token,
                span=[index, index])
